import { useEffect, useState } from "react";
import API from "../services/api";

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async (force = false) => {
    const cacheKey = "dashboard_full_cache";
    const cacheTsKey = "dashboard_full_cache_ts";
    const timestampNow = Date.now();

    if (!force) {
      const cached = sessionStorage.getItem(cacheKey);
      const cachedTs = Number(sessionStorage.getItem(cacheTsKey) || 0);

      if (cached && timestampNow - cachedTs < 30 * 1000) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/analytics/dashboard/full/", {
        params: force ? { force: 1 } : undefined,
      });
      setData(res.data);
      sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
      sessionStorage.setItem(cacheTsKey, String(Date.now()));
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: () => loadDashboard(true),
  };
}
