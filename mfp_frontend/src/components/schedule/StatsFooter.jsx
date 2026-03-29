export default function StatsFooter({onCreate}) {
  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-between px-10 shadow-sm">
      <div className="flex gap-8 text-sm text-gray-600">
        <span>12 Published</span>
        <span>4 Pending Review</span>
        <span>28 Scheduled Total</span>
      </div>

      <button  onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-full shadow-lg font-medium">
        + Create Schedule
      </button>
    </div>
  );
}