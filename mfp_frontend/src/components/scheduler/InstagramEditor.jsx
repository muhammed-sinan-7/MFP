import React, { useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Calendar,
  Clock,
  Camera,
  Layout,
  Hash,
  MapPin,
  Tag,
  Sparkles,
} from "lucide-react";

export default function InstagramEditor({
  target,
  content,
  setContent,
  platformMedia,
  setPlatformMedia,
  scheduledTime,
  setScheduledTime,
}) {
  const [firstComment, setFirstComment] = useState("");

  const media = platformMedia[target?.id] || { images: [] };
  const previewUrls = useMemo(() => {
    if (!media.images || media.images.length === 0) return [];
    return media.images.map((file) => URL.createObjectURL(file));
  }, [media.images]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      setPlatformMedia((prev) => ({
        ...prev,
        [target.id]: { images: files },
      }));
    }
  };

  const datePart = scheduledTime?.slice(0, 10) || "2024-06-24";
  const timePart = scheduledTime?.slice(11, 16) || "09:30";

  return (
    <div className="flex flex-col 2xl:flex-row text-[#262626] font-sans relative gap-3">
      <div className="w-full 2xl:w-72 rounded-xl p-4 sm:p-6 border border-gray-200 overflow-y-auto shrink-0 bg-white">
        <section className="mb-8">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
            Scheduling
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
                Date
              </label>

              <input
                type="date"
                value={datePart}
                onChange={(e) =>
                  setScheduledTime(`${e.target.value}T${timePart || "10:00"}`)
                }
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
                Time
              </label>

              <input
                type="time"
                value={timePart}
                onChange={(e) =>
                  setScheduledTime(`${datePart}T${e.target.value}`)
                }
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <p className="text-[11px] font-bold text-blue-600 uppercase mb-2">
            AI Optimizer
          </p>

          <p className="text-[11px] text-blue-800 leading-relaxed mb-3">
            Engagement peaks at <span className="font-bold">11:30 AM</span> on
            Tuesdays.
          </p>

          <button
            onClick={() => {
              if (!datePart) return;
              setScheduledTime(`${datePart}T11:30`);
            }}
            className="text-[11px] font-bold text-blue-600 underline"
          >
            Apply Suggestion
          </button>
        </div>
      </div>

      {/* COLUMN 2: EDITOR */}
      <div className="flex-1 bg-white overflow-y-auto rounded-xl px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 border border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Instagram Post
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Craft your perfect visual story with optimized previews.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("open-ai"))}
              className="group inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-gradient-to-b from-white to-slate-50 border border-slate-200 hover:border-blue-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 shrink-0"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Sparkles size={13} />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[12px] font-semibold tracking-tight text-slate-800">
                  AI Assistant
                </span>
                <span className="text-[10px] text-slate-500">
                  Smart suggestions
                </span>
              </span>
            </button>
          </div>

          {/* Media Upload Area */}
          <div className="relative group aspect-square max-w-md mx-auto mb-5 border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-300 transition-colors">
            {previewUrls.length > 0 ? (
              <>
                <img
                  src={previewUrls[0]}
                  className="w-full h-full object-cover"
                  alt="Upload"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                  <span className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md">
                    Change Media
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            ) : (
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <Camera size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">
                    Upload high-res image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    1080x1080 recommended
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Caption & Metadata */}
          <div className="space-y-6">
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-900">
                  Post Caption
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {content.length} / 2200
                </span>
              </div>
              <div className="relative border border-gray-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition shadow-sm">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 p-4 text-sm outline-none resize-none"
                  placeholder="Write a caption..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3: MOBILE PREVIEW */}
      <div className="hidden 2xl:flex w-[420px] rounded-xl bg-[#F3F5F7] border-l border-gray-200 flex-col items-center py-12 px-6 overflow-y-auto">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
          Live Post Preview
        </h3>

        {/* Phone Shell */}
        <div className="w-[320px] bg-white rounded-[45px] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-[8px] border-white">
          <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100">
            {/* Instagram Header */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?u=alex" alt="profile" />
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold leading-none">
                    {target.display_name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    San Francisco, California
                  </p>
                </div>
              </div>
              <MoreHorizontal size={16} className="text-gray-700" />
            </div>

            {/* Post Image */}
            <div className="aspect-square bg-gray-100">
              {previewUrls.length > 0 ? (
                <img
                  src={previewUrls[0]}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Camera size={48} />
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="p-3">
              <div className="flex justify-between mb-2">
                <div className="flex gap-4">
                  <Heart size={22} />
                  <MessageCircle size={22} />
                  <Send size={22} />
                </div>
                <Bookmark size={22} />
              </div>

              <p className="text-[13px] font-bold mb-1">1,248 likes</p>

              <div className="text-[13px] leading-snug">
                <span className="font-bold mr-2">arivera_design</span>
                <span className="text-gray-800">
                  {content || "Your caption will appear here..."}
                </span>
              </div>

              <p className="text-[10px] text-gray-400 uppercase mt-2">
                2 minutes ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
