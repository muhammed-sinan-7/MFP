import { format, isSameMonth, isToday, isSameDay, isBefore, startOfDay } from "date-fns";
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";

export default function CalendarCell({
  day,
  monthStart,
  events,
  selectedDate,
  onDateSelect,
}) {
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  const isPastDate = isBefore(startOfDay(day), startOfDay(new Date()));
  const dayKey = [
    day.getFullYear(),
    String(day.getMonth() + 1).padStart(2, "0"),
    String(day.getDate()).padStart(2, "0"),
  ].join("-");
  const dayProviders = events?.[dayKey] || [];

  const providerIcons = {
    instagram: <FaInstagram className="text-pink-600" size={11} />,
    linkedin: <FaLinkedin className="text-blue-700" size={11} />,
    youtube: <FaYoutube className="text-red-600" size={11} />,
    meta: <FaFacebook className="text-sky-700" size={11} />,
    twitter: <FaTwitter className="text-cyan-600" size={11} />,
  };

  return (
    <div
      onClick={() => {
        if (!isPastDate) onDateSelect(day);
      }}
     className={`flex-1 border-r border-b border-gray-200 p-3 flex flex-col transition
  ${
    isPastDate
      ? "bg-gray-50 text-gray-300 cursor-not-allowed"
      : isSelected
      ? "bg-blue-200"
      : !isSameMonth(day, monthStart)
      ? "bg-gray-50 text-gray-400"
      : "bg-white hover:bg-blue-50 cursor-pointer"
  }
`}
    >
      <div
        className={`text-sm font-medium ${
          isToday(day)
            ? "bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full"
            : ""
        }`}
      >
        {format(day, "d")}
      </div>

      {!!dayProviders.length && (
        <div className="mt-2 flex flex-wrap gap-1">
          {dayProviders.slice(0, 3).map((provider) => (
            <div
              key={provider}
              className="w-5 h-5 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center"
              title={provider}
            >
              {providerIcons[provider] || (
                <span className="text-[9px] font-semibold text-gray-600">
                  {provider.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {dayProviders.length > 3 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              +{dayProviders.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
