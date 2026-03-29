function StatCard({ title, value, growth }) {
  const isPositive = growth.includes("+");

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{title}</span>
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {growth}
        </span>
      </div>

      <h2 className="text-2xl font-semibold mt-4 text-gray-900">
        {value}
      </h2>
    </div>
  );
}

export default StatCard;