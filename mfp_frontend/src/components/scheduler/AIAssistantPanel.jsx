import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Wand2 } from "lucide-react";
import { aiService } from "../../services/aiService";
import { getPlatformTone } from "../../services/aiHelper";

export default function AIAssistPanel({ onClose, content, setContent, platform }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const chatRef = useRef(null);

  const tone = getPlatformTone(platform);
  const audience = "general audience";
  const storageKey = `ai_chat_${platform}`;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
    setIsHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    sessionStorage.setItem(storageKey, JSON.stringify(history));
  }, [history, storageKey, isHydrated]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, loading]);

  useEffect(() => {
    if (!content) return;

    setHistory((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "assistant") return prev;

      const updated = [...prev];
      updated[updated.length - 1] = {
        ...last,
        parsed: {
          ...last.parsed,
          caption: content,
        },
      };

      return updated;
    });
  }, [content]);

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedHistory = [...history, userMessage];

    setHistory(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await aiService.generatePost({
        history: updatedHistory,
        platform,
        tone,
        audience,
      });

      const payload = res?.data || res || {};

      let parsedData = payload;
      if (typeof payload === "string") {
        try {
          parsedData = JSON.parse(payload);
        } catch {
          parsedData = { caption: payload };
        }
      }

      const safeData = {
        hook: String(parsedData?.hook || "").trim(),
        caption: String(parsedData?.caption || "").trim(),
        hashtags: Array.isArray(parsedData?.hashtags)
          ? parsedData.hashtags.filter((h) => typeof h === "string" && h.trim())
          : [],
        format: parsedData?.format || "post",
      };

      if (!safeData.caption && safeData.hook) {
        safeData.caption = safeData.hook;
      }

      if (!safeData.caption && safeData.hashtags.length) {
        safeData.caption = `Suggested hashtags: ${safeData.hashtags.join(" ")}`;
      }

      if (!safeData.caption) {
        safeData.caption =
          "I can help with hooks, captions, hashtags, and rewrites. Try asking for a full caption with tone.";
      }

      const assistantMessage = {
        role: "assistant",
        content: safeData.caption,
        parsed: safeData,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "error",
          parsed: {
            hook: "",
            caption: "Failed to generate content. Please try again.",
            hashtags: [],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-3 sm:inset-4 lg:top-24 lg:right-8 lg:bottom-24 lg:left-auto lg:w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col ring-1 ring-black/5">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Wand2 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">AI Assistant</h3>
            <p className="text-xs text-slate-500 capitalize">{platform} • {tone} tone</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
          aria-label="Close AI panel"
        >
          <X size={14} className="mx-auto" />
        </button>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/40">
        {!history.length && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-medium text-slate-700">Ready to assist</p>
            <p className="text-xs text-slate-500 mt-1">
              Ask for hooks, captions, hashtags, or rewriting suggestions.
            </p>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-3">
                  {msg.parsed?.hook ? (
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                      {msg.parsed.hook}
                    </p>
                  ) : null}

                  <p className="whitespace-pre-line">{msg.parsed?.caption || msg.content}</p>

                  {msg.parsed?.hashtags?.length ? (
                    <p className="text-[11px] text-slate-500">
                      {msg.parsed.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                    </p>
                  ) : null}

                  {msg.parsed?.caption ? (
                    <button
                      onClick={() => setContent(msg.parsed.caption || msg.parsed.hook || "")}
                      className="w-full py-2 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-blue-600 transition"
                    >
                      Apply to Editor
                    </button>
                  ) : null}
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
            </span>
            Generating...
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to write, improve, or shorten your content..."
            className="w-full h-20 bg-transparent px-3 py-2 text-sm text-slate-700 resize-none outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Shift + Enter for new line</span>
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Send size={12} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
