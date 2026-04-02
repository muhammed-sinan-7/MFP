import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  PlayCircle,
  DollarSign,
  ChevronRight,
  Youtube as YoutubeIcon,
  Image as ImageIcon,
} from "lucide-react";
import { exportRowsToCsv } from "../../services/csvExport";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const YouTubeAnalytics = ({
  overview,
  growth,
  videos,
  trafficSources,
  onRefresh,
  isConnected = true,
}) => {
  const navigate = useNavigate();
  const safeGrowth = Array.isArray(growth) ? growth : [];
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeTrafficSources = Array.isArray(trafficSources) ? trafficSources : [];

  const hasData =
    Boolean(overview) ||
    safeGrowth.length > 0 ||
    safeVideos.length > 0 ||
    safeTrafficSources.length > 0;

  const formattedGrowth = safeGrowth.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const organicPercent = safeTrafficSources
    .filter((s) => !s.label.toLowerCase().includes("external"))
    .reduce((sum, s) => sum + s.percentage, 0);


  const kpis = [
    {
      label: "Total Subscribers",
      val: overview?.subscribers?.toLocaleString() || "0",
      trend: "+12.5%",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Watch Time (Hours)",
      val: overview?.watch_time?.toLocaleString() || "0",
      trend: "+8.2%",
      icon: PlayCircle,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Estimated Revenue",
      val: `$${overview?.estimated_revenue?.toLocaleString() || "0.00"}`,
      trend: "-2.1%",
      icon: DollarSign,
      color: "text-rose-600",
      bg: "bg-rose-50",
      isNegative: true,
    },
  ];

  const hasGrowthMetrics = safeGrowth.length > 0;
  const hasVideoMetrics = safeVideos.length > 0;
  const hasTrafficMetrics = safeTrafficSources.length > 0;

  const handleRefresh = async () => {
    if (!onRefresh) return;

    try {
      await onRefresh();
      toast.success("YouTube analytics refreshed.");
    } catch {
      toast.error("Failed to refresh YouTube analytics.");
    }
  };

  const handleExport = () => {
    const rows = safeVideos.map((video) => ({
      title: video.title || "Untitled",
      views: Number(video.views || 0),
      ctr: Number(video.ctr || 0),
      comments: Number(video.comments || 0),
      status: video.status || "",
    }));

    const exported = exportRowsToCsv("youtube-video-performance.csv", rows);
    if (exported) {
      toast.success("YouTube performance CSV downloaded.");
    } else {
      toast.info("No YouTube video data available to export.");
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white px-6 py-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Connect YouTube first</h2>
          <p className="mt-2 text-sm text-slate-500">
            Connect your YouTube account and schedule a video post to unlock analytics.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate("/accounts")}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Connect Account
            </button>
            <button
              onClick={() => navigate("/schedule")}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              Schedule Post
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white px-8 py-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">No metrics found</h2>
          <p className="mt-2 text-sm text-slate-500">
            YouTube analytics data is currently empty. Metrics will appear after channel activity is tracked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-gray-900">
      <div>
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-red-600 p-1 rounded-md text-white">
                <YoutubeIcon size={16} fill="currentColor" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                YouTube Channel Insights
              </h1>
            </div>
            <p className="text-gray-400 text-sm font-small">
              Detailed performance analysis for the last 30 days.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 shadow-sm">
              Dec 01, 2023 - Dec 31, 2023
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold shadow-md shadow-violet-100 hover:bg-[#6D28D9] transition-all"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${kpi.bg} p-2.5 rounded-xl`}>
                  <kpi.icon className={`${kpi.color} w-5 h-5`} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${kpi.isNegative ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"} border border-gray-100`}
                >
                  {kpi.trend}
                </span>
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.val}</h3>
              {kpi.label === "Total Subscribers" && (
                <p className="text-[10px] text-gray-400 mt-1">
                  New subscribers this month
                </p>
              )}
              {kpi.label === "Watch Time (Hours)" && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Cumulative viewing hours
                </p>
              )}
              {kpi.label === "Estimated Revenue" && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Ad revenue and memberships
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Audience Retention & Views Chart */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-10">
            <div>
              <h3 className="font-bold text-gray-900">
                Audience Retention & Views
              </h3>
              <p className="text-gray-400 text-[11px]">
                Views vs. Average view duration trends over time
              </p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => toast.info("Daily view is currently active.")}
                className="px-3 py-1 bg-white text-[10px] font-bold rounded-md shadow-sm"
              >
                Daily
              </button>
            </div>
          </div>
          <div className="h-[260px] sm:h-[320px] lg:h-[350px]">
            {hasGrowthMetrics ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedGrowth}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F3F4F6"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  />
                  <Tooltip />
                  <Area
                    type="natural"
                    dataKey="views"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl border border-blue-100 bg-white flex items-center justify-center text-sm text-slate-500">
                No audience metrics found.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5 text-violet-600">
              <div className="w-2 h-2 rounded-full bg-violet-600" /> Views
            </div>
            <div className="flex items-center gap-1.5 text-gray-900">
              <div className="w-2 h-2 rounded-full bg-gray-900" /> Avg. Duration
              (Min)
            </div>
          </div>
        </div>

        {/* Video Performance & Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 mb-8">
          {/* Recent Video Performance Table */}
          <div className="lg:col-span-8 bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-50 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Recent Video Performance
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Key metrics for your latest uploads
                </p>
              </div>
              <button
                onClick={() => navigate("/posts")}
                className="text-violet-600 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Video</th>
                    <th className="px-8 py-5 text-right">Views</th>
                    <th className="px-8 py-5 text-right">CTR</th>
                    <th className="px-8 py-5 text-right">Comments</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {hasVideoMetrics && safeVideos?.map((video, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-violet-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {video.thumbnail && video.media_type === "VIDEO" ? (
                              <video
                                src={video.thumbnail}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title || "video media"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={12} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[180px] sm:max-w-[260px]">
                              {video.title}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              2 DAYS AGO
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                        {video.views?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                        {video.ctr}%
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                        {video.comments}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            video.status === "Trending"
                              ? "bg-violet-600 text-white"
                              : "bg-gray-50 text-gray-500 border border-gray-100"
                          }`}
                        >
                          {video.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!hasVideoMetrics && (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm">
                        No video performance metrics found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Sources Sidebar */}
          <div className="lg:col-span-4 bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 mb-1">Traffic Sources</h3>
            <p className="text-gray-400 text-[11px] mb-8">
              Where your audience finds you
            </p>

            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8 sm:mb-10">
              {/* Simplified Donut representing 84% Organic */}
              <div className="w-full h-full rounded-full border-[12px] border-gray-50 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[12px] border-violet-600 border-t-transparent border-r-transparent rotate-45" />
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">
                    {Math.round(organicPercent)}%
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Organic
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {hasTrafficMetrics && safeTrafficSources.map((source, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tighter">
                    <span>{source.label}</span>
                    <span className="text-gray-900">{source.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className={`${source.color} h-full rounded-full transition-all duration-1000`}
                      style={{ width: source.width }}
                    />
                  </div>
                </div>
              ))}
              {!hasTrafficMetrics && (
                <div className="rounded-xl border border-blue-100 bg-white px-4 py-6 text-center text-sm text-slate-500">
                  No traffic source metrics found.
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              className="mt-8 pt-6 border-t border-gray-50 flex justify-center items-center gap-2 text-[10px] font-bold text-violet-600 hover:underline"
            >
              <PlayCircle size={14} /> Watch Retention Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeAnalytics;
