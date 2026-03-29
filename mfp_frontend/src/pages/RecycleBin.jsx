import { useEffect, useMemo, useState } from "react";
import {
  getRecycleBinPosts,
  restorePost,
  permanentlyDeletePost,
  emptyRecycleBin,
} from "../services/postService";
import { toast } from "sonner";



// Modern SVG Icons
const Icons = {
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  ),
  Filter: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Restore: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  Info: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  Empty: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  ),
};

export default function RecycleBinPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState("desc");

  const loadPosts = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getRecycleBinPosts(pageNumber);
      const results = res.data.results || [];
      const count = res.data.count || 0;

      setPosts(results);
      setTotalItems(count);
      setTotalPages(Math.max(1, Math.ceil(count / 10)));
      setPage(pageNumber);
    } catch {
      toast.error("Failed to load recycle bin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(page);
  }, []);

  const handlePermanentDelete = async (postId) => {
    try {
      await permanentlyDeletePost(postId);

      toast.success("Post permanently deleted");

      // Optimistic UI (no reload)
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setTotalItems((prev) => prev - 1);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEmptyBin = async () => {
    try {
      const res = await emptyRecycleBin();

      toast.success(`Deleted ${res.data.deleted_count} posts`);

      setPosts([]);
      setTotalItems(0);
    } catch {
      toast.error("Failed to empty recycle bin");
    }
  };

  const openConfirm = (config) => {
    setConfirmDialog(config);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmDialog(null);
  };

  const runConfirm = async () => {
    if (!confirmDialog?.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRestore = async (postId) => {
    try {
      await restorePost(postId);

      toast.success("Post restored successfully");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setTotalItems((prev) => prev - 1);
    } catch {
      toast.error("Restore failed");
    }
  };

  const visiblePosts = useMemo(() => {
    const list = [...posts];
    list.sort((a, b) => {
      const aTime = new Date(a.deleted_at || a.updated_at || 0).getTime();
      const bTime = new Date(b.deleted_at || b.updated_at || 0).getTime();
      return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [posts, sortDirection]);

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-tight">
          Syncing Recycle Bin...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] font-sans text-slate-900">
      {/* 01. Minimal Unified Header (No white BG) */}
      <div className="pb-6 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Recycle Bin
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                {totalItems} Posts
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
              Items are kept for 30 days before being purged. Restored items
              move to Drafts.
            </p>
          </div>

          <button
            onClick={() =>
              openConfirm({
                title: "Empty Recycle Bin?",
                description:
                  "This will permanently delete all posts in the recycle bin. This action cannot be undone.",
                confirmLabel: "Delete All",
                onConfirm: handleEmptyBin,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            <Icons.Trash />
            Empty Trash
          </button>
        </div>

        {/* 02. Floating Search & Tool Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search deleted content..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
            />
          </div>
          <button
            onClick={() =>
              setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <Icons.Calendar />
            Date {sortDirection === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {/* 03. Scrollable Table Area */}
      <main className="flex-1 overflow-y-auto pb-8">
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Content Asset
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Author
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Deleted
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visiblePosts.map((post) => (
                <tr
                  key={post.id}
                  className="group hover:bg-blue-50/30 transition-all"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded-md border-slate-300 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {/* Media Logic Here */}
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">
                          Img
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-bold text-slate-800 line-clamp-1 max-w-[350px]">
                          {post.platforms?.[0]?.caption || "Unnamed Post"}
                        </p>
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                          {post.platforms?.[0]?.provider}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black uppercase">
                        {post.author?.[0]}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-600">
                        {post.author}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-mono font-medium text-slate-500">
                      {new Date(post.deleted_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleRestore(post.id)}
                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                      >
                        <Icons.Restore />
                      </button>
                      <button
                        onClick={() =>
                          openConfirm({
                            title: "Delete Permanently?",
                            description:
                              "This post will be permanently removed and cannot be restored.",
                            confirmLabel: "Delete Permanently",
                            onConfirm: () => handlePermanentDelete(post.id),
                          })
                        }
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 04. Minimal Pagination Footer */}
      <footer className="py-5 bg-white border-t border-slate-200 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-400">
          Page <span className="text-slate-900">{page}</span> of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => loadPosts(page - 1)}
            className="px-4 py-2 text-[12px] font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => loadPosts(page + 1)}
            className="px-4 py-2 text-[12px] font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all"
          >
            Next Page
          </button>
        </div>
      </footer>

      <ConfirmActionModal
        isOpen={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        isLoading={confirmLoading}
        onClose={closeConfirm}
        onConfirm={runConfirm}
      />
    </div>
  );
}

function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  isLoading,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-70"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
