import { useState, useEffect, useRef, useCallback } from "react";
import {
  getYoutubeOverview,
  getYoutubeGrowth,
  getYoutubeVideos,
  getYouTubeTrafficSources,
} from "../services/analyticsService";

export const useYoutubeAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [videos, setVideos] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loaded = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [o, g, v, t] = await Promise.all([
        getYoutubeOverview(),
        getYoutubeGrowth(),
        getYoutubeVideos(),
        getYouTubeTrafficSources(),
      ]);

      setOverview(o.data);
      setGrowth(g.data || []);
      setVideos(v.data || []);

      const formattedTraffic = (t.data || []).map((s) => ({
        label: s.label,
        percentage: Number(s.value) || 0,
        width: `${Number(s.value) || 0}%`,
        color: "bg-[#7C3AED]",
      }));

      setTrafficSources(formattedTraffic);
    } catch (err) {
      console.error("YouTube analytics fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    load();
  }, [load]);

  return {
    overview,
    growth,
    videos,
    trafficSources,
    loading,
    error,
    refetch: load,
  };
};
