import { useState, useEffect } from "react";
import {
  createPost,
  getSocialAccounts,
} from "../services/postService";
import { toast } from "sonner";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Replace with your real organization context later
  const organizationId = "YOUR_ORG_ID";

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await getSocialAccounts(organizationId);
        setAccounts(res.data);
      } catch (err) {
        console.error("Failed to fetch accounts");
      }
    }

    loadAccounts();
  }, []);

  const toggleAccount = (id) => {
    setSelectedAccounts((prev) =>
      prev.includes(id)
        ? prev.filter((acc) => acc !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Content required");
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setLoading(true);

    try {
      await createPost({
        organization_id: organizationId,
        content,
        scheduled_time:
          scheduledTime || new Date().toISOString(),
        social_account_ids: selectedAccounts,
      });

      toast.success("Post created successfully");

      setContent("");
      setScheduledTime("");
      setSelectedAccounts([]);
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
      <h1 className="text-xl font-semibold mb-6">
        Create Post
      </h1>

      {/* Content */}
      <textarea
        className="w-full border rounded-lg p-3 mb-4"
        placeholder="Write your content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Platforms */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">
          Select Platforms
        </p>

        <div className="flex flex-wrap gap-3">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => toggleAccount(acc.id)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                selectedAccounts.includes(acc.id)
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {acc.platform} — {acc.resource_name}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="mb-6">
        <label className="text-sm font-medium">
          Schedule Time
        </label>

        <input
          type="datetime-local"
          className="w-full border rounded-lg p-2 mt-1"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
      >
        {loading ? "Publishing..." : "Publish Post"}
      </button>
    </div>
  );
}
