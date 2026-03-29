export default function StatsBar() {
  return (
    <div className="flex justify-between items-center mt-6 bg-white border rounded-xl p-4 shadow-sm">
      {/* <div className="flex gap-8 text-sm text-gray-600">
        <div>12 Published</div>
        <div>4 Pending Review</div>
        <div>28 Scheduled Total</div>
      </div> */}

      <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition">
        + Create Schedule
      </button>
    </div>
  );
}