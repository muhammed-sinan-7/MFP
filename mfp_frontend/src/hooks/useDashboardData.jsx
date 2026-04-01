import { useEffect, useState } from "react";
import API from "../services/api";

const DASHBOARD_CACHE_KEY = "dashboard_full_cache";
const DASHBOARD_CACHE_TS_KEY = "dashboard_full_cache_ts";
const DASHBOARD_TTL_MS = 5 * 60 * 1000;
let dashboardInFlight = null;

const readDashboardCache = () => {
  if (typeof window === "undefined") {
    return { data: null, ts: 0 };
  }

  try {
    const raw =
      window.sessionStorage.getItem(DASHBOARD_CACHE_KEY) ||
      window.localStorage.getItem(DASHBOARD_CACHE_KEY);
    const ts = Number(
      window.sessionStorage.getItem(DASHBOARD_CACHE_TS_KEY) ||
        window.localStorage.getItem(DASHBOARD_CACHE_TS_KEY) ||
        0
    );
    return {
      data: raw ? JSON.parse(raw) : null,
      ts,
    };
  } catch (error) {
    return { data: null, ts: 0 };
  }
};

const writeDashboardCache = (data) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
    window.sessionStorage.setItem(DASHBOARD_CACHE_TS_KEY, String(Date.now()));
    window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
    window.localStorage.setItem(DASHBOARD_CACHE_TS_KEY, String(Date.now()));
  } catch (error) {
  }
};

export function useDashboardData() {
  const initialCache = readDashboardCache();
  const [data, setData] = useState(initialCache.data);
  const [loading, setLoading] = useState(!initialCache.data);
  const [error, setError] = useState(null);

  const loadDashboard = async (force = false) => {
    const cached = readDashboardCache();
    const timestampNow = Date.now();

    if (cached.data) {
      setData(cached.data);
      setLoading(false);
      if (!force && timestampNow - cached.ts < DASHBOARD_TTL_MS) {
        setLoading(false);
        return;
      }
    }

    if (!cached.data) {
      setLoading(true);
    }
    setError(null);

    try {
      dashboardInFlight =
        dashboardInFlight ||
        API.get("/analytics/dashboard/full/", {
          params: force ? { force: 1 } : undefined,
        });

      const res = await dashboardInFlight;
      setData(res.data);
      writeDashboardCache(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      dashboardInFlight = null;
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
