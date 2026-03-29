import { useState, useEffect, useCallback } from "react";
import {
  getOverview,
  getEngagementChart,
  getEngagementDistribution,
  getRecentPosts,
} from "../services/analyticsService";

export const useAnalytics = (platform = null) => {
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [engagementDistribution, setEngagementDistribution] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, chartRes, distributionRes, recentPostsRes] =
        await Promise.all([
          getOverview(platform),
          getEngagementChart(platform),
          getEngagementDistribution(),
          getRecentPosts(),
        ]);

      setOverview(overviewRes.data);

      const formatted =
        chartRes.data?.map((item) => ({
          date: item.date,
          instagram: Number(item.instagram || 0),
          youtube: Number(item.youtube || 0),
          linkedin: Number(item.linkedin || 0),
        })) || [];

      setChartData(formatted);
      setEngagementDistribution(distributionRes?.data || []);
      setRecentPosts(recentPostsRes?.data || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    overview,
    chartData,
    engagementDistribution,
    recentPosts,
    loading,
    error,
    refetch: loadAnalytics,
  };
};
