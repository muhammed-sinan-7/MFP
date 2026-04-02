export default function StatsFooter({onCreate}) {
  return (
    <div className="bg-white border-t border-gray-200 px-3 py-3 shadow-sm sm:px-5 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 sm:flex sm:gap-6 sm:text-sm">
          <span>12 Published</span>
          <span>4 Pending</span>
          <span>28 Scheduled</span>
        </div>

        <button
          onClick={onCreate}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition text-white px-5 sm:px-7 py-2.5 rounded-full shadow-md font-medium text-sm"
        >
          + Create Schedule
        </button>
      </div>
    </div>
  );
}
