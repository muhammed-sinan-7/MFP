import React from "react";

function StatCard({ title, value, growth, icon, className = "" }) {
  const normalizedGrowth = String(growth ?? "").trim();
  const isPositive = normalizedGrowth.startsWith("+");
  const isNegative =
    normalizedGrowth.startsWith("-") &&
    normalizedGrowth !== "-0" &&
    normalizedGrowth !== "-0%";
  const growthClass = isPositive
    ? "bg-green-50 text-green-600"
    : isNegative
      ? "bg-red-50 text-red-600"
      : "bg-slate-100 text-slate-600";

  return (
    <div className={`bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group ${className}`}>
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        {normalizedGrowth && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${growthClass}`}>
            {normalizedGrowth}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{title}</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h2>
      </div>
    </div>
  );
}

export default StatCard;
