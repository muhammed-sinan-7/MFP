import { useDashboardData } from "../../hooks/useDashboardData";
import StatCard from "../../components/dashboard/StatCard";
import IntegrationHealth from "../../components/dashboard/IntegrationHealth";
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  Zap,
  Newspaper,
  Image as ImageIcon,
  RefreshCcw,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

const growthLabel = (value) => {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
};

const statusPill = (status) => {
  if (status === "success") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

function Overview() {
  const { data, loading, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-500 font-medium">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700"
        >
          <RefreshCcw size={14} />
          Retry
        </button>
      </div>
    );
  }

  const updatedAt = data?.updated_at
    ? new Date(data.updated_at).toLocaleString()
    : "Now";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live business snapshot from connected channels.
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">Last updated: {updatedAt}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Reach (Last 7 Days)"
          value={formatNumber(data?.stats?.reach)}
          icon={<TrendingUp size={18} className="text-blue-600" />}
          growth={growthLabel(data?.trend?.reach_pct)}
        />
        <StatCard
          title="Engagement Rate"
          value={formatPercent(data?.stats?.engagement_rate)}
          icon={<Zap size={18} className="text-fuchsia-600" />}
          growth={growthLabel(data?.trend?.engagement_rate_delta)}
        />
        <StatCard
          title="Scheduled Posts"
          value={formatNumber(data?.posts?.scheduled)}
          icon={<Calendar size={18} className="text-emerald-600" />}
          growth={growthLabel(data?.trend?.engagement_pct)}
        />
        <StatCard
          title="Failed (30 Days)"
          value={formatNumber(data?.posts?.failed_30d)}
          icon={<AlertCircle size={18} className="text-rose-600" />}
          growth={data?.posts?.failed_30d > 0 ? `${data.posts.failed_30d}` : "0"}
          className={data?.posts?.failed_30d > 0 ? "border-rose-200" : ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Top Performing Posts</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {(data?.top_posts || []).length === 0 && (
                <div className="p-6 text-sm text-slate-500">No post analytics available yet.</div>
              )}
              {(data?.top_posts || []).map((post, i) => (
                <div key={`${post.title}-${i}`} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500 capitalize">
                      {post.platform} · {formatNumber(post.engagement)} engagements ·{" "}
                      {formatPercent(post.engagement_rate)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-semibold text-slate-900">{formatNumber(post.impressions)}</p>
                    <p>Reach</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Recent Publishing Activity</h3>
              </div>
              <div className="space-y-3">
                {(data?.recent_posts || []).length === 0 && (
                  <p className="text-sm text-slate-500">No recent activity yet.</p>
                )}
                {(data?.recent_posts || []).map((post, i) => (
                  <div key={`${post.title}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{post.title || "Untitled Post"}</p>
                      <p className="text-xs capitalize text-slate-500">{post.platform}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold capitalize ${statusPill(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Newspaper size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Industry Feed</h3>
              </div>
              <div className="space-y-3">
                {(data?.news || []).length === 0 && (
                  <p className="text-sm text-slate-500">No industry updates available.</p>
                )}
                {(data?.news || []).map((item, i) => (
                  <a
                    key={`${item.title}-${i}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <IntegrationHealth integrations={data?.integrations || {}} />
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700" />
              <p className="text-sm font-semibold text-emerald-900">Publishing Snapshot</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-xs text-slate-500">Published (30d)</p>
                <p className="text-lg font-semibold text-slate-900">{formatNumber(data?.posts?.published_30d)}</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-xs text-slate-500">Processing</p>
                <p className="text-lg font-semibold text-slate-900">{formatNumber(data?.posts?.processing)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
