import { useEffect, useMemo, useState } from "react";
import { fetchAuditLogs } from "../services/auditService";
import AuditTable from "../components/audit/AuditTable";
import {
  FunnelIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { exportRowsToCsv } from "../services/csvExport";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({ page, search });
      setLogs(data.results);
      setCount(data.count);
    } catch (error) {
      console.error("Audit fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, search]);

  const displayedLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      if (quickFilter === "today") {
        const created = new Date(log.created_at);
        return (
          created.getDate() === now.getDate() &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }

      if (quickFilter === "past7") {
        const created = new Date(log.created_at);
        const daysAgo7 = new Date();
        daysAgo7.setDate(now.getDate() - 7);
        return created >= daysAgo7;
      }

      if (quickFilter === "system") {
        return !log.actor_email || String(log.actor_email).toLowerCase() === "system";
      }

      return true;
    });
  }, [logs, quickFilter]);

  const handleExport = () => {
    const rows = displayedLogs.map((log) => ({
      timestamp: new Date(log.created_at).toLocaleString(),
      actor: log.actor_email || "System",
      action: log.action || "",
      target: log.target || "",
    }));

    const ok = exportRowsToCsv("audit-logs.csv", rows);
    if (ok) toast.success("Audit logs CSV downloaded.");
    else toast.info("No audit logs available to export.");
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor platform activity and administrative changes.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => toast.info("Use search and quick filters to refine logs.")}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm"
          >
            <FunnelIcon className="w-4 h-4" />
            Advanced Filters
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV/PDF
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <input
            type="text"
            placeholder="Search by action, target, or IP address..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-96 border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={() =>
                setQuickFilter((prev) => (prev === "today" ? "all" : "today"))
              }
              className={`px-3 py-2 border rounded-lg text-xs ${quickFilter === "today" ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-300"}`}
            >
              Today
            </button>
            <button
              onClick={() =>
                setQuickFilter((prev) => (prev === "past7" ? "all" : "past7"))
              }
              className={`px-3 py-2 border rounded-lg text-xs ${quickFilter === "past7" ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-300"}`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() =>
                setQuickFilter((prev) => (prev === "system" ? "all" : "system"))
              }
              className={`px-3 py-2 border rounded-lg text-xs ${quickFilter === "system" ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-300"}`}
            >
              System Events
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading audit logs...
          </div>
        ) : (
          <AuditTable logs={displayedLogs} />
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between pb-5 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm text-gray-500">
          Showing page {page} · {count} total records
        </span>

        <button
          disabled={logs.length < 20}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>

     

    </div>
  );
}

export default AuditLogs;
