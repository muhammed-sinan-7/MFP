import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CalendarGrid from "./CalenderGrid";
import { toast } from "sonner";

export default function CalendarSection({
  currentMonth,
  onPrev,
  onNext,
  events,
  filterStatus,
  onFilterChange,
  onRefresh,
  selectedDate,
  onDateSelect,
}) {
  return (
    <div className="flex flex-col p-3 sm:p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Content Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Orchestrate your cross-platform social strategy.</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
          <button onClick={() => toast.info("Already in month view.")} className="px-4 py-1.5 text-sm font-medium bg-white rounded-md shadow-sm">Month</button>
          <button onClick={() => toast.info("Week view coming soon.")} className="px-4 py-1.5 text-sm text-gray-600">Week</button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm w-fit">
            <button onClick={onPrev} className="p-2 hover:bg-gray-50 rounded-l-lg"><ChevronLeftIcon className="w-4 h-4" /></button>
            <div className="px-4 py-2 text-sm font-medium text-gray-800 border-x border-gray-200">{format(currentMonth, "MMMM yyyy")}</div>
            <button onClick={onNext} className="p-2 hover:bg-gray-50 rounded-r-lg"><ChevronRightIcon className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={(e) => onFilterChange?.(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg shadow-sm outline-none">
              <option value="all">All</option>
              <option value="pending">Scheduled</option>
              <option value="processing">Processing</option>
              <option value="success">Published</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={onRefresh} className="px-4 py-2 text-sm border border-gray-200 bg-white rounded-lg shadow-sm hover:bg-gray-50">Refresh</button>
          </div>
        </div>
      </div>

      {/* CALENDAR CONTAINER - ALLOWS HORIZONTAL SCROLL ON TINY SCREENS */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <CalendarGrid currentMonth={currentMonth} events={events} selectedDate={selectedDate} onDateSelect={onDateSelect} />
        </div>
      </div>
    </div>
  );
}