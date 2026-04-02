import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Eye,
  BarChart3,
  MousePointer2,
  Share2,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  Image as ImageIcon,
} from "lucide-react";
import { exportRowsToCsv } from "../../services/csvExport";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LinkedInAnalytics = ({
  overview,
  growth,
  posts,
  onRefresh,
  isConnected = true,
  analyticsApproved = false,
}) => {
  const navigate = useNavigate();
  const hasGrowthMetrics = (growth || []).length > 0;
  const hasPostMetrics = (posts || []).length > 0;
  // Mock data for the "Top Professional Functions" chart as per the image
  const professionalFunctions = [
    { role: "Engineering", width: "95%", color: "bg-[#7C3AED]" },
    { role: "Sales", width: "80%", color: "bg-[#8B5CF6]" },
    { role: "Marketing", width: "65%", color: "bg-[#A78BFA]" },
    { role: "Operations", width: "45%", color: "bg-[#C4B5FD]" },
    { role: "HR", width: "25%", color: "bg-[#DDD6FE]" },
  ];

  const kpis = [
    {
      label: "Total Connections",
      val: overview?.connections || "0",
      trend: "+12%",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Unique Visitors",
      val: overview?.unique_visitors || "0",
      trend: "+5.4%",
      icon: Eye,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Post Impressions",
      val: overview?.post_impressions || "0",
      trend: "+18.2%",
      icon: BarChart3,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Avg. Click-Through",
      val: `${overview?.click_through_rate || 0}%`,
      trend: "-0.8%",
      icon: MousePointer2,
      color: "text-rose-600",
      bg: "bg-rose-50",
      isNegative: true,
    },
  ];

  const handleRefresh = async () => {
    if (!onRefresh) return;

    try {
      await onRefresh();
      toast.success("LinkedIn analytics refreshed.");
    } catch {
      toast.error("Failed to refresh LinkedIn analytics.");
    }
  };

  const handleExport = () => {
    const rows = (posts || []).map((post) => ({
      title: post.title || "Untitled",
      type: post.type || "",
      impressions: Number(post.impressions || 0),
      clicks: Number(post.clicks || 0),
      ctr: Number(post.ctr || 0),
      status: post.status || "",
    }));

    const exported = exportRowsToCsv("linkedin-post-analytics.csv", rows);
    if (exported) {
      toast.success("LinkedIn analytics CSV downloaded.");
    } else {
      toast.info("No LinkedIn post metrics available to export.");
    }
  };

  const handleOpenPost = (post) => {
    const postUrl = post?.url || post?.permalink || post?.post_url;
    if (!postUrl) {
      toast.info("No public URL is available for this post yet.");
      return;
    }
    window.open(postUrl, "_blank", "noopener,noreferrer");
  };
  if (!analyticsApproved) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="bg-white border border-blue-100 rounded-2xl p-8 sm:p-10 text-center shadow-sm max-w-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            LinkedIn Analytics Coming Soon
          </h2>
          <p className="text-gray-500 text-sm">
            LinkedIn currently restricts analytics access for many apps. We will enable
            full insights once platform approval is granted.
          </p>
          {!isConnected && (
            <p className="mt-3 text-xs text-gray-500">
              Connect your LinkedIn account now so it is ready when analytics access is enabled.
            </p>
          )}
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
          <div className="mt-6 text-xs text-gray-400">
            Once approved, analytics cards and charts will appear here automatically.
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="bg-white border border-blue-100 rounded-2xl p-8 text-center shadow-sm max-w-lg">
          <h2 className="text-lg font-bold text-gray-900">Connect LinkedIn first</h2>
          <p className="mt-2 text-sm text-gray-500">
            Connect your LinkedIn account and schedule at least one post to start collecting data.
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

  return (
    <div className="w-full font-sans text-gray-900">
      <div>
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              LinkedIn Insights
            </h1>
            <p className="text-gray-400 text-sm pt-1 font-small">
              Professional network performance and B2B engagement metrics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm"
            >
              <Share2 size={14} /> Export PDF
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold shadow-md shadow-violet-100 hover:bg-[#6D28D9] transition-all"
            >
              Adjust Filters
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            </div>
          ))}
        </div>

        {/* Growth & Functions Section */}
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8">
          {/* Professional Growth Chart */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm">
            <div className="mb-8 sm:mb-10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="font-bold text-gray-900">Professional Growth</h3>
                <p className="text-gray-400 text-[11px]">
                  Visualizing connection and visitor trends over the last 7
                  days.
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5 text-violet-600">
                  <div className="w-2 h-2 rounded-full bg-violet-600" />{" "}
                  Connections
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-gray-200" /> Visitors
                </div>
              </div>
            </div>
            <div className="h-[260px] sm:h-[320px] lg:h-[350px]">
              {hasGrowthMetrics ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth}>
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
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#7C3AED",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-xl border border-blue-100 bg-white flex items-center justify-center text-sm text-slate-500">
                  No growth metrics found.
                </div>
              )}
            </div>
          </div>

          {/* Top Professional Functions */}
          <div className="lg:col-span-4 bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 mb-1">
              Top Professional Functions
            </h3>
            <p className="text-gray-400 text-[11px] mb-8">
              Audience distribution by job role.
            </p>

            <div className="space-y-6 flex-1">
              {professionalFunctions.map((func, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tighter">
                    <span>{func.role}</span>
                  </div>
                  <div className="h-4 w-full bg-gray-50 rounded-md overflow-hidden">
                    <div
                      className={`${func.color} h-full rounded-md transition-all duration-1000`}
                      style={{ width: func.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 rounded-md">
                  <ArrowUpRight size={14} className="text-gray-400" />
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  Seniority Match
                </span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                High (84%)
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-50 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Recent Post Analytics
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Deep dive into individual content performance metrics.
              </p>
            </div>
            <button
              onClick={() => navigate("/posts")}
              className="text-violet-600 text-xs font-bold flex items-center gap-1 hover:underline"
            >
              View All Posts <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Post Title</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5 text-right">Impressions</th>
                  <th className="px-8 py-5 text-right">Clicks</th>
                  <th className="px-8 py-5 text-right">CTR</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hasPostMetrics && posts?.map((post, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-gray-900 max-w-xs truncate">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                          {post.thumbnail && post.media_type === "VIDEO" ? (
                            <video
                              src={post.thumbnail}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : post.thumbnail ? (
                            <img
                              src={post.thumbnail}
                              alt={post.title || "post media"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={12} className="text-gray-400" />
                          )}
                        </div>
                        <span className="truncate">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-50 text-gray-500 border border-gray-100 capitalize">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                      {post.impressions?.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                      {post.clicks?.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700 text-right">
                      {post.ctr}%
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          post.status === "High Engagement"
                            ? "bg-violet-50 text-violet-600"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button
                        onClick={() => handleOpenPost(post)}
                        className="text-gray-300 group-hover:text-gray-600"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!hasPostMetrics && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-8 py-10 text-center text-slate-500 text-sm"
                    >
                      No post analytics found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAnalytics;
