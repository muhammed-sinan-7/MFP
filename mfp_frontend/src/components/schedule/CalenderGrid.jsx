import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import CalendarCell from "./CalenderCell";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarGrid({
  currentMonth,
  events,
  selectedDate,
  onDateSelect,
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  let day = new Date(startDate);
  const rows = [];

  while (day <= endDate) {
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const clone = new Date(day);
      cells.push(
        <CalendarCell
          key={clone.toISOString()}
          day={clone}
          monthStart={monthStart}
          events={events}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
      );
      day = addDays(day, 1);
    }
    rows.push(
      /* FIXED: Added a minimum height so cells don't collapse on mobile */
      <div key={day.toISOString()} className="flex min-h-[90px] sm:min-h-[120px] border-b border-gray-100 last:border-0">
        {cells}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 shrink-0">
        {days.map((d) => (
          <div key={d} className="py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-500 border-r border-gray-200 last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col">{rows}</div>
    </div>
  );
}