import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Upload,
  Sparkles,
  Calendar,
  Clock,
  Info,
  UserCircle2,
} from "lucide-react";

export default function YouTubeEditor({
  target,
  content,
  setContent,
  platformMedia,
  setPlatformMedia,
  scheduledTime,
  setScheduledTime,
}) {
  const fileInputRef = useRef(null);

  const datePart = scheduledTime?.slice(0, 10) || "";
  const timePart = scheduledTime?.slice(11, 16) || "";

  const media = platformMedia[target?.id] || { video: null };

  const videoPreviewUrl = useMemo(() => {
    if (!media.video) return null;
    return URL.createObjectURL(media.video);
  }, [media.video]);

  const [videoMeta, setVideoMeta] = useState({
    duration: 0,
    width: 0,
    height: 0,
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPlatformMedia((prev) => ({
      ...prev,
      [target.id]: { ...prev[target.id], video: file },
    }));
  };

  useEffect(() => {
    if (!media.video) {
      setVideoMeta({ duration: 0, width: 0, height: 0 });
      return;
    }

    const probeUrl = URL.createObjectURL(media.video);
    const probe = document.createElement("video");
    probe.preload = "metadata";

    probe.onloadedmetadata = () => {
      setVideoMeta({
        duration: Number.isFinite(probe.duration) ? probe.duration : 0,
        width: probe.videoWidth || 0,
        height: probe.videoHeight || 0,
      });
      URL.revokeObjectURL(probeUrl);
    };

    probe.src = probeUrl;

    return () => {
      URL.revokeObjectURL(probeUrl);
    };
  }, [media.video]);

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return "00:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isPortrait =
    videoMeta.width > 0 &&
    videoMeta.height > 0 &&
    videoMeta.height > videoMeta.width;
  const isShort = videoMeta.duration > 0 && videoMeta.duration <= 60 && isPortrait;

  return (
    <div className="flex gap-3 font-sans text-[#1D2226]">
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
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={datePart}
                  onChange={(e) =>
                    setScheduledTime(`${e.target.value}T${timePart || "10:00"}`)
                  }
                  className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
                Time
              </label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="time"
                  value={timePart}
                  onChange={(e) => setScheduledTime(`${datePart}T${e.target.value}`)}
                  className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <p className="text-[11px] font-bold text-blue-600 uppercase mb-2">
            AI Optimizer
          </p>

          <p className="text-[11px] text-blue-800 leading-relaxed mb-3">
            Long-form videos perform best around <span className="font-bold">7:00 PM</span>.
          </p>

          <button
            onClick={() => {
              if (!datePart) return;
              setScheduledTime(`${datePart}T19:00`);
            }}
            className="text-[11px] font-bold text-blue-600 underline"
          >
            Apply Suggestion
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-y-auto ml-3 rounded-xl px-16 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create YouTube Post</h2>
              <p className="text-sm text-gray-500 mt-1">
                Prepare your video and optimize title for better discoverability.
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

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-video max-w-xl mx-auto mb-6 border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange}
            />

            {videoPreviewUrl ? (
              <>
                <video src={videoPreviewUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-sm font-semibold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md">
                    Change Video
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Upload your video</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI supported</p>
                </div>
              </div>
            )}
          </div>

          {videoPreviewUrl && (
            <div className="mb-6 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                Duration: {formatDuration(videoMeta.duration)}
              </span>
              <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-semibold">
                {isShort ? "Shorts Layout" : "Standard Video Layout"}
              </span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-900">Video Title</label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {content.length} / 100
                </span>
              </div>

              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-blue-500 transition shadow-sm"
                placeholder="Enter a strong YouTube title..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[420px] ml-3 rounded-xl bg-[#F3F5F7] border-l border-gray-200 flex flex-col items-center py-12 px-6 overflow-y-auto">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
          Live Post Preview
        </h3>

        {!isShort ? (
          <div className="w-[340px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="aspect-video bg-black relative flex items-center justify-center">
              {videoPreviewUrl ? (
                <video src={videoPreviewUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white">
                  <Play size={20} fill="currentColor" />
                </div>
              )}
              <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                {formatDuration(videoMeta.duration)}
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-start gap-2">
                <UserCircle2 size={34} className="text-gray-400 shrink-0" />
                <div>
                  <p className="font-semibold text-[14px] text-gray-900 leading-snug line-clamp-2">
                    {content || "Your video title will appear here..."}
                  </p>
                  <div className="mt-1 text-[12px] text-gray-500">
                    <p>{target?.display_name || "YouTube Channel"}</p>
                    <p>Just now • Scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[240px] bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="aspect-[9/16] bg-black relative">
              {videoPreviewUrl ? (
                <video src={videoPreviewUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              )}
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full">
                Shorts
              </span>
              <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                {formatDuration(videoMeta.duration)}
              </span>
            </div>
            <div className="p-3">
              <p className="font-semibold text-[13px] text-gray-900 leading-snug line-clamp-2">
                {content || "Your Shorts title will appear here..."}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {target?.display_name || "YouTube Channel"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 w-[340px] p-4 bg-white border border-gray-200 rounded-xl flex gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Info size={14} />
          </div>
          <div className="text-[11px] leading-relaxed text-gray-500">
            <p className="font-bold text-gray-800 mb-0.5">Preview Notice</p>
            Title and media are shown as a simulation. Final render may vary slightly on YouTube.
          </div>
        </div>
      </div>
    </div>
  );
}
