import React, { useMemo } from "react";
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Globe2,
  MoreHorizontal,
  ChevronRight,
  Sparkles
} from "lucide-react";
export default function LinkedInEditor({
  target,
  content,
  setContent,
  platformMedia,
  setPlatformMedia,
  scheduledTime,
  setScheduledTime,
  selectedtargets,
  //   handleSubmit,
  //   closeEditor,
}) {
  const media = platformMedia[target.id] || { image: null };

  const previewUrl = useMemo(() => {
    if (!media.image) return null;
    return URL.createObjectURL(media.image);
  }, [media.image]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPlatformMedia((prev) => ({
      ...prev,
      [target.id]: { image: file },
    }));
  };
  const display_name = target.display_name;
  const datePart = scheduledTime?.slice(0, 10) || "";
  const timePart = scheduledTime?.slice(11, 16) || "";

  return (
    <div className="flex gap-3  font-sans text-[#1D2226]">
      {/* LEFT COLUMN */}
      <div className="w-72 h-100 rounded-xl p-6 border-gray-200 overflow-y-auto shrink-0 bg-white">
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

      {/* MIDDLE COLUMN */}
      <div className="flex-1 bg-white h-150 rounded-xl p-10 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create LinkedIn Post
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Draft your professional update and see real-time previews.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-2 px-4  py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <span>Media</span>
              </label>
              <button
                onClick={() => window.dispatchEvent(new Event("open-ai"))}
                className="group inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-gradient-to-b from-white to-slate-50 border border-slate-200 hover:border-blue-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
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
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-80 p-6 text-[15px] leading-relaxed text-gray-800 outline-none resize-none placeholder:text-gray-300"
              placeholder="We're thrilled to announce the launch of ScheduleFlow 2.0! 🚀"
            />

            <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-[10px] font-black uppercase tracking-tighter text-gray-400">
              <div className="flex gap-4">
                <span>{content.length} / 3000 chars</span>
              </div>

              {/* <span className="text-blue-600">Readability: High</span> */}
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      {/* --- PREVIEW COLUMN --- */}
      <div className="w-[480px] bg-[#F3F5F7] border-l border-gray-200 overflow-y-auto">
        <div className="max-w-[400px] mx-auto py-10 px-4 space-y-6">
          {/* Label & Header Controls */}
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[11px] font-black text-[#666666] uppercase tracking-widest">
              LIVE DESKTOP PREVIEW
            </h3>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50">
                <ThumbsUp size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm text-gray-400">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* MAIN CARD - Now has a max-width and natural height */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Actor Info */}
            <div className="flex items-start gap-2 p-3 pb-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img
                  src="https://i.pravatar.cc/150?u=alex"
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">
                    {display_name || "Alex Rivera"}
                    <span className="text-gray-500 font-normal text-[12px] ml-1">
                      • 1st
                    </span>
                  </p>
                  <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <p className="text-[12px] text-gray-500 leading-tight">
                  Content Manager at ScheduleFlow | Social Strategy Expert
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
                  Just now • <Globe2 size={10} />
                </p>
              </div>
            </div>

            {/* Body Text */}
            <div className="px-4 py-2">
              <p className="text-[14px] leading-[1.5] text-[#191919] whitespace-pre-wrap">
                {content ||
                  "Your professional update and insights will appear here..."}
              </p>
            </div>

            {/* Media Section */}
            <div className="mt-2">
              {previewUrl ? (
                <div className="cursor-pointer">
                  <img
                    src={previewUrl}
                    className="w-full h-auto"
                    alt="Post visual"
                  />
                  <div className="p-3 bg-[#F9FAFB] border-t border-gray-100">
                    <p className="text-[12px] text-gray-500 uppercase font-semibold tracking-tight">
                      SCHEDULEFLOW.IO
                    </p>
                    <p className="text-[14px] font-bold text-gray-900 mt-0.5 leading-snug">
                      Revolutionizing Content Workflows for Professionals
                    </p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 border-y border-gray-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">
                    No Media Attached
                  </p>
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 mx-1">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-[#0A66C2] border border-white flex items-center justify-center">
                    <ThumbsUp size={8} className="text-white fill-current" />
                  </div>
                </div>
                <span>You and 12 others</span>
              </div>
              <span className="text-[12px] text-gray-500">
                2 comments • 1 share
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1">
              {[
                { label: "Like", icon: <ThumbsUp size={18} /> },
                { label: "Comment", icon: <MessageSquare size={18} /> },
                { label: "Repost", icon: <Repeat2 size={18} /> },
                { label: "Send", icon: <Send size={18} /> },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-100 rounded text-[#666666] font-semibold text-[14px]"
                >
                  {action.icon} <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notice box - This will now naturally sit below the card */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl flex gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              i
            </div>
            <div className="text-[11px] leading-relaxed text-gray-500">
              <p className="font-bold text-gray-800 mb-0.5">Preview Notice</p>
              Aspect ratios and fonts are simulated. Actual appearance may vary.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
