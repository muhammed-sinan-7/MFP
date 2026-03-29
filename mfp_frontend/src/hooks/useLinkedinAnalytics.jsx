import { useState, useEffect, useRef, useCallback } from "react";
import {
  getLinkedinOverview,
  getLinkedinGrowth,
  getLinkedinPosts,
} from "../services/analyticsService";

export const useLinkedinAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loaded = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [o, g, p] = await Promise.all([
        getLinkedinOverview(),
        getLinkedinGrowth(),
        getLinkedinPosts(),
      ]);

      setOverview(o.data);
      setGrowth(g.data || []);
      setPosts(p.data || []);
    } catch (err) {
      console.error("LinkedIn analytics fetch error:", err);
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

  return { overview, growth, posts, loading, error, refetch: load };
};
