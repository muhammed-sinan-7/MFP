import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPosts,
  deletePost,
  getPostDetail,
  restorePost,
} from "../services/postService";
import { useNavigate } from "react-router-dom";
// S3 already returns full https:// URLs — no prefix needed

import { toast } from "sonner";
import { exportRowsToCsv } from "../services/csvExport";
const platformIcons = {
  linkedin: "https://img.icons8.com/color/24/linkedin.png",
  instagram: "https://img.icons8.com/color/24/instagram-new--v1.png",
  youtube: "https://img.icons8.com/color/24/youtube-play.png",
  facebook: "https://img.icons8.com/color/24/facebook-new.png", // if you add facebook later
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [dateRangeMode, setDateRangeMode] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);
  const requestIdRef = useRef(0);

  const loadPosts = async (pageNumber = 1) => {
    const requestId = ++requestIdRef.current;
    try {
      const filters = {
        search: debouncedSearch,
        platforms__publishing_target__provider: platform,
        platforms__publish_status: status,
      };

      const res = await getPosts(pageNumber, filters, pageSize);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setPosts(res.data.results || []);
      setCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const delay = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => window.clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    loadPosts(page);
  }, [page, debouncedSearch, platform, status]);

  const visiblePosts = useMemo(() => {
    if (dateRangeMode === "all") return posts;

    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() - 7);

    return posts.filter((post) =>
      (post.platforms || []).some((platformItem) => {
        if (!platformItem?.scheduled_time) return false;
        const dt = new Date(platformItem.scheduled_time);
        return dt >= threshold;
      }),
    );
  }, [posts, dateRangeMode]);

  const handleExportCsv = () => {
    const rows = visiblePosts.map((post) => {
      const p = post.platforms?.[0] || {};
      return {
        post_id: post.id,
        platform: p.provider || "",
        caption: p.caption || "",
        status: p.publish_status || "",
        scheduled_time: p.scheduled_time || "",
      };
    });

    const ok = exportRowsToCsv("post-management.csv", rows);
    if (ok) toast.success("Posts CSV downloaded.");
    else toast.info("No post data available to export.");
  };

  const toggleDateRange = () => {
    setDateRangeMode((prev) => (prev === "all" ? "last7" : "all"));
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      toast.success("Post moved to recycle bin.");
      loadPosts(page);
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleRestore = async (postId) => {
    try {
      await restorePost(postId);
      toast.success("Post restored successfully.");
      loadPosts(page);
    } catch {
      toast.error("Failed to restore post.");
    }
  };
  const handleView = async (postId) => {
    try {
      const res = await getPostDetail(postId);

      setSelectedPost(res.data);
    } catch (err) {
      console.error("Failed to load post details", err);
      toast.error("Failed to load post details.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Post Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Plan, review, and analyze your multi-channel marketing content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => navigate("/schedule")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Create New Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <StatCard
          title="TOTAL POSTS"
          value={count}
          change="+12%"
          changeColor="text-green-600"
        />
        <StatCard
          title="SCHEDULED"
          value={
            posts.filter((p) =>
              p.platforms?.some((pl) => pl.publish_status === "pending"),
            ).length
          }
          change="+5%"
          changeColor="text-green-600"
        />
        <StatCard
          title="AVG ENGAGEMENT"
          value="3.8%"
          change="+0.4%"
          changeColor="text-green-600"
        />
        <StatCard
          title="FAILED POSTS"
          value={
            posts.filter((p) =>
              p.platforms?.some((pl) => pl.publish_status === "failed"),
            ).length
          }
          change="-2%"
          changeColor="text-red-600"
        />
      </div>

      {/* Search + Filters (unchanged) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title, author, or keyword..."
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={toggleDateRange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            {dateRangeMode === "all" ? "Date Range: All" : "Date Range: Last 7 Days"}
          </button>
          <button
            onClick={() => {
              setSearch("");
              setPlatform("");
              setStatus("");
              setPage(1);
            }}
            className="text-blue-600 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50/60 border-b border-blue-100">
              <tr className="text-xs font-semibold text-blue-900/70 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Platform</th>
                <th className="text-left px-5 py-3 min-w-[280px]">Content</th>
                <th className="text-left px-5 py-3">Preview</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3 min-w-[180px]">Schedule</th>
                <th className="text-left px-5 py-3 min-w-[200px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-blue-50">
              {visiblePosts.map((post) => {
                const platform = post.platforms?.[0] || {};
                const media = platform.media?.[0];
                const provider = platform.provider?.toLowerCase() || "";

                return (
                  <tr key={post.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center">
                        {platformIcons[provider] ? (
                          <img
                            src={platformIcons[provider]}
                            alt={provider}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <span className="text-gray-500 capitalize">
                            {provider || "-"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="font-medium text-gray-900 leading-snug">
                        {platform.caption?.slice(0, 80) || "Untitled Post"}
                        {platform.caption?.length > 80 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {post.author || "Unknown"}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      {media?.file ? (
                        media.media_type === "IMAGE" ? (
                          <img
                            src={media.file}
                            alt="preview"
                            className="w-20 h-12 object-cover rounded-lg border border-blue-100"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x48?text=Image";
                            }}
                          />
                        ) : media.media_type === "VIDEO" ? (
                          <video
                            src={media.file}
                            className="w-20 h-12 object-cover rounded-lg border border-blue-100"
                            muted
                          />
                        ) : null
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                          No media
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <StatusBadge status={platform.publish_status} />
                    </td>

                    <td className="px-5 py-4 align-middle text-gray-700 text-sm">
                      {platform.scheduled_time
                        ? new Date(platform.scheduled_time).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3 text-sm">
                        <button
                          onClick={() => {
                            const platform = post.platforms?.[0];
                            if (!platform) return;

                            if (platform.publish_status !== "pending") {
                              toast.error("Only scheduled posts can be edited.");
                              return;
                            }

                            const scheduled = new Date(platform.scheduled_time);
                            const now = new Date();

                            if (scheduled <= now) {
                              toast.error(
                                "Past or published posts cannot be edited.",
                              );
                              return;
                            }

                            navigate("/schedule", { state: { editPost: post } });
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleView(post.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        {!post.is_deleted ? (
                          <button
                            onClick={() => setPostToDelete(post.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(post.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!visiblePosts.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <p className="text-sm font-medium text-gray-600">No posts found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try adjusting your filters or search query.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination (unchanged) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200 bg-white text-sm text-gray-600">
          <p>
            Showing {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, count)} of {count} results
          </p>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-medium">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedPost && (
        <PostDetailDrawer
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <ConfirmActionModal
        isOpen={Boolean(postToDelete)}
        title="Delete Post?"
        description="This will move the post to recycle bin. You can restore it later."
        confirmLabel="Move to Recycle Bin"
        onClose={() => setPostToDelete(null)}
        onConfirm={async () => {
          if (!postToDelete) return;
          await handleDelete(postToDelete);
          setPostToDelete(null);
        }}
      />
    </div>
  );
}

function StatCard({ title, value, change, changeColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {change && (
          <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const base =
    "inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize";

  const styles = {
    success: "bg-green-100 text-green-800 border border-green-200",
    published: "bg-green-100 text-green-800 border border-green-200",
    pending: "bg-blue-100 text-blue-800 border border-blue-200",
    processing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    failed: "bg-red-100 text-red-800 border border-red-200",
    draft: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Draft";

  return (
    <span
      className={`${base} ${styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}
    >
      {label}
    </span>
  );
}

function PostDetailDrawer({ post, onClose }) {
  if (!post) return null;

  const formatDateTime = (value) => {
    if (!value) return "Not scheduled";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex justify-end">
      <div className="w-full max-w-md lg:max-w-xl bg-gradient-to-b from-slate-50 to-white h-full shadow-2xl overflow-y-auto border-l border-slate-200">
        <div className="p-6 lg:p-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Post Preview
              </h2>
              <p className="text-sm text-slate-500 mt-1">Key details only</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xl leading-none"
              aria-label="Close drawer"
            >
              x
            </button>
          </div>

          {post.platforms?.length ? (
            post.platforms.map((platform) => {
              const provider = platform.provider?.toLowerCase();
              const mediaCount = platform.media?.length || 0;

              return (
                <div
                  key={platform.id}
                  className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold capitalize text-slate-900 flex items-center gap-2">
                        {provider && platformIcons[provider] && (
                          <img
                            src={platformIcons[provider]}
                            alt={provider}
                            className="w-5 h-5"
                          />
                        )}
                        {platform.provider || "Unknown"}
                      </div>
                      <StatusBadge status={platform.publish_status || "draft"} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-slate-500">Scheduled</p>
                        <p className="text-slate-800 mt-0.5 font-medium">
                          {formatDateTime(platform.scheduled_time)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="text-slate-500">Media</p>
                        <p className="text-slate-800 mt-0.5 font-medium">
                          {mediaCount} file{mediaCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
                        Caption
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                        {platform.caption || "No caption added."}
                      </p>
                    </div>

                    {platform.failure_reason && (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                        <p className="text-xs font-medium text-red-700 mb-1">
                          Publish Issue
                        </p>
                        <p className="text-xs text-red-700">{platform.failure_reason}</p>
                      </div>
                    )}

                    {platform.media?.length ? (
                      <div className="grid grid-cols-2 gap-3">
                        {platform.media.map((m) => (
                          <div
                            key={m.id}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                          >
                            {m.media_type === "IMAGE" && (
                              <img
                                src={m.file}
                                alt="media"
                                className="w-full h-32 object-cover"
                              />
                            )}

                            {m.media_type === "VIDEO" && (
                              <video
                                src={m.file}
                                controls
                                className="w-full h-32 object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500 text-center">
                        No media files attached.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No platform data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
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
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}



