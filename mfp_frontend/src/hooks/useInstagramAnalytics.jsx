import { useState, useEffect, useRef, useCallback } from "react";
import {
  getInstagramOverview,
  getInstagramGrowth,
  getInstagramTopPosts,
  getInstagramPerformance,
} from "../services/analyticsService";

export const useInstagramAnalytics = () => {
  const loaded = useRef(false);

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, growthRes, topRes, performanceRes] =
        await Promise.all([
          getInstagramOverview(),
          getInstagramGrowth(),
          getInstagramTopPosts(),
          getInstagramPerformance(),
        ]);

      setOverview(overviewRes.data);
      setGrowth(
        (growthRes.data || []).map((g) => {
          const dt = new Date(g.day);

          return {
            ...g,
            dateLabel: dt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };
        }),
      );
      setTopPosts(topRes.data || []);
      setPerformance(performanceRes.data || []);
    } catch (err) {
      console.error("Instagram analytics fetch error:", err);
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
    topPosts,
    performance,
    loading,
    error,
    refetch: load,
  };
};
