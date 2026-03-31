import { useState, useEffect, useMemo, useCallback } from "react";
import { addMonths, subMonths, isBefore, isSameDay, startOfDay } from "date-fns";
import CalendarSection from "../components/schedule/CalenderSection";
import DailyAgenda from "../components/schedule/DailyAgenda";
import StatsFooter from "../components/schedule/StatsFooter";
import { toast } from "sonner";
import {
  getPublishingTargets,
  createPost,
  updatePost,
  getPosts,
} from "../services/postService";
import PlatformSidebar from "../components/scheduler/platformSidebar";
import PlatformEditor from "../components/scheduler/PlatformEditor";
import { useLocation } from "react-router-dom";

import AIAssistPanel from "../components/scheduler/AIAssistantPanel";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const [activeTarget, setActiveTarget] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [targets, setTargets] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);

  const [editingPost, setEditingPost] = useState(null);

  const [content, setContent] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [platformMedia, setPlatformMedia] = useState({});
  const [calendarPosts, setCalendarPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  const location = useLocation();

  const loadCalendarPosts = useCallback(async () => {
    try {
      let page = 1;
      let hasNext = true;
      const merged = [];
      const filters = {};

      if (statusFilter !== "all") {
        filters["platforms__publish_status"] = statusFilter;
      }

      while (hasNext && page <= 10) {
        const res = await getPosts(page, filters, 200);
        const payload = res?.data || {};
        const rows = payload.results || [];
        merged.push(...rows);

        hasNext = Boolean(payload.next);
        page += 1;
      }

      setCalendarPosts(merged);
    } catch (err) {
      console.error("Failed to load calendar posts", err);
      toast.error("Could not load scheduled posts.");
    }
  }, [statusFilter]);

  useEffect(() => {
    const openAI = () => setAiOpen(true);
    window.addEventListener("open-ai", openAI);

    return () => window.removeEventListener("open-ai", openAI);
  }, []);

  useEffect(() => {
    if (!location.state?.editPost) return;

    const post = location.state.editPost;
    const platform = post.platforms?.[0];

    if (!platform) return;

    if (platform.publish_status !== "pending") {
      toast.error("Only scheduled posts can be edited.");
      return;
    }

    const scheduled = new Date(platform.scheduled_time);
    const now = new Date();

    if (scheduled <= now) {
      toast.error("Past or published posts cannot be edited.");
      return;
    }

    setEditingPost(post);
    setContent(platform.caption || "");

    setScheduledTime(
      new Date(platform.scheduled_time).toISOString().slice(0, 16),
    );

    const ids = post.platforms.map((p) => Number(p.publishing_target));
    setSelectedTargets(ids);

    setActiveTarget({
      id: platform.id,
      provider: platform.provider,
    });

    setIsDrawerOpen(true);
  }, [location.state]);

  useEffect(() => {
    loadCalendarPosts();
  }, [loadCalendarPosts]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    async function loadTargets() {
      try {
        if (targets.length) {
          return;
        }

        let page = 1;
        let hasNext = true;
        const merged = [];

        while (hasNext && page <= 3) {
          const res = await getPublishingTargets(page, 100);
          const payload = res?.data || {};

          if (Array.isArray(payload)) {
            merged.push(...payload);
            hasNext = false;
            break;
          }

          merged.push(...(payload.results || []));
          hasNext = Boolean(payload.next);
          page += 1;
        }

        setTargets(merged);
      } catch (err) {
        console.error("Failed to load targets", err);
      }
    }

    loadTargets();
  }, [isDrawerOpen, targets.length]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    if (activeTarget) return;
    if (!targets.length) return;
    setActiveTarget(targets[0]);
    setSelectedTargets([targets[0].id]);
  }, [isDrawerOpen, targets, activeTarget]);

  useEffect(() => {
    if (!isDrawerOpen || !selectedDate) return;

    const defaultTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      10,
      0,
    );

    setScheduledTime(defaultTime.toISOString().slice(0, 16));
  }, [isDrawerOpen, selectedDate]);

  const handlePlatformSelect = (target) => {
    setActiveTarget(target);
    setSelectedTargets([target.id]);
  };

  const handleDateSelect = useCallback((day) => {
    const selectedDay = startOfDay(day);
    const today = startOfDay(new Date());

    if (isBefore(selectedDay, today)) {
      toast.warning("Past dates are not available for scheduling.");
      return;
    }

    setSelectedDate((prev) =>
      prev && isSameDay(prev, day) ? null : day,
    );
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    if (!scheduledTime) {
      toast.warning("Please select a schedule time.");
      setSubmitting(false);
      return;
    }

    const selectedTime = new Date(scheduledTime);
    const now = new Date();

    if (selectedTime <= now) {
      toast.warning("Schedule time must be in the future.");
      setSubmitting(false);
      return;
    }

    if (selectedTargets.length === 0) {
      toast.warning("Please select at least one platform.");
      setSubmitting(false);
      return;
    }

    for (const id of selectedTargets) {
      const target = targets.find((t) => t.id === id);
      if (!target) continue;

      const provider = target.provider;
      const media = platformMedia[id] || {};
      const files = media.images || [];

      const hasMedia = media.video || (files && files.length > 0);

      if (provider === "instagram" && !hasMedia) {
        toast.warning("Instagram requires at least one image or video.");
        setSubmitting(false);
        return;
      }

      if (!content && !hasMedia) {
        toast.warning("Post must contain text or media.");
        setSubmitting(false);
        return;
      }

      if (provider === "youtube" && !media.video) {
        toast.error("YouTube requires a video file.");
        setSubmitting(false);
        return;
      }
    }

    try {
      if (!editingPost) {
        const formData = new FormData();

        formData.append("caption", content);

        formData.append(
          "scheduled_time",
          new Date(scheduledTime).toISOString(),
        );

        selectedTargets.forEach((id) =>
          formData.append("publishing_target_ids", id),
        );

        selectedTargets.forEach((id) => {
          const media = platformMedia[id];
          if (!media) return;

          if (media.video) {
            formData.append(`video_${id}`, media.video);
          }

          // LinkedIn uses media.image (single File), not media.images (array)
          if (media.image) {
            formData.append(`image_${id}_0`, media.image);
          }

          // Instagram / multi-image platforms use media.images (array)
          media.images?.forEach((file, index) => {
            const isVideo = file.type.startsWith("video");

            if (isVideo) {
              formData.append(`video_${id}_${index}`, file);
            } else {
              formData.append(`image_${id}_${index}`, file);
            }
          });
        });

        await createPost(formData);
        toast.success("Post created successfully.");
      } else {
        const currentPlatform = editingPost.platforms.find(
          (p) => p.id === activeTarget?.id,
        );

        if (!currentPlatform) {
          console.error("Platform not found", {
            activeTarget,
            platforms: editingPost.platforms,
          });

          toast.error("Something went wrong. Platform not matched.");
          setSubmitting(false);
          return;
        }

        const payload = {
          platforms: [
            {
              id: currentPlatform.id,
              caption: content,
              scheduled_time: new Date(scheduledTime).toISOString(),
            },
          ],
        };
        await updatePost(editingPost.id, payload);

        toast.success("Post updated successfully.");
      }

      setIsDrawerOpen(false);
      setContent("");
      setSelectedTargets([]);
      setPlatformMedia({});
      setEditingPost(null);
      await loadCalendarPosts();
    } catch (err) {
      console.error("API ERROR:", err);

      let message = "Failed to create post";

      if (err?.response?.data) {
        const data = err.response.data;

        if (data.non_field_errors) {
          message = data.non_field_errors[0];
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          message = Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : data[firstKey];
        } else if (data.detail) {
          message = data.detail;
        }
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const calendarEvents = useMemo(() => {
    const eventMap = {};

    for (const post of calendarPosts) {
      for (const platform of post.platforms || []) {
        if (!platform?.scheduled_time) continue;

        const scheduledAt = new Date(platform.scheduled_time);
        if (Number.isNaN(scheduledAt.getTime())) continue;

        const key = [
          scheduledAt.getFullYear(),
          String(scheduledAt.getMonth() + 1).padStart(2, "0"),
          String(scheduledAt.getDate()).padStart(2, "0"),
        ].join("-");

        if (!eventMap[key]) {
          eventMap[key] = new Set();
        }

        if (platform.provider) {
          eventMap[key].add(platform.provider);
        }
      }
    }

    return Object.fromEntries(
      Object.entries(eventMap).map(([dateKey, providers]) => [
        dateKey,
        Array.from(providers),
      ]),
    );
  }, [calendarPosts]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 px-8 py-6">
          <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <CalendarSection
              currentMonth={currentMonth}
              onPrev={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              onNext={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              filterStatus={statusFilter}
              onFilterChange={setStatusFilter}
              onRefresh={loadCalendarPosts}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              events={calendarEvents}
            />
          </div>
        </div>

        <div className="w-[380px] shrink-0 border-l border-gray-200 bg-white">
          <DailyAgenda posts={calendarPosts} selectedDate={selectedDate} />
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white">
        <StatsFooter
          onCreate={() => {
            if (!selectedDate) {
              toast.warning("Select a date first");
              return;
            }

            setActiveTarget(null);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
          {/* HEADER */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create Schedule
              </h2>
              <p className="text-xs text-gray-500">
                Professional multi-platform publishing
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-xl transition"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex flex-1 overflow-hidden">
            <PlatformSidebar
              targets={targets}
              selectedTargets={selectedTargets}
              activeTarget={activeTarget}
              onSelect={handlePlatformSelect}
            />

            <div className="flex-1 flex p-10">
              {!activeTarget && (
                <div className="flex items-center justify-center w-full text-gray-400">
                  Select a platform to start editing
                </div>
              )}

              {activeTarget && (
                <PlatformEditor
                  target={activeTarget}
                  content={content}
                  setContent={setContent}
                  selectedTargets={selectedTargets}
                  platformMedia={platformMedia}
                  setPlatformMedia={setPlatformMedia}
                  scheduledTime={scheduledTime}
                  setScheduledTime={setScheduledTime}
                  handleSubmit={handleSubmit}
                  selectedDate={selectedDate}
                />
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-end px-10 shadow-sm">
            <div className="flex gap-4">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-md  ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {submitting
                  ? "Scheduling..."
                  : editingPost
                    ? "Update Post"
                    : "Schedule"}
              </button>
            </div>
          </div>

          {aiOpen && activeTarget && (
            <AIAssistPanel
              onClose={() => setAiOpen(false)}
              content={content}
              setContent={setContent}
              platform={activeTarget.provider}
            />
          )}
        </div>
      )}
    </div>
  );
}
