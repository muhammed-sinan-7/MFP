export default function DailyAgenda({ posts = [], selectedDate }) {
  const activeDate = selectedDate || new Date();

  const formatDate = activeDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const agendaItems = (posts || [])
    .flatMap((post) =>
      (post.platforms || []).map((platform) => ({
        postId: post.id,
        platformId: platform.id,
        caption: platform.caption || post.caption || "",
        provider: platform.provider || "unknown",
        publishStatus: platform.publish_status || "pending",
        scheduledTime: platform.scheduled_time,
      })),
    )
    .filter((item) => {
      if (!item.scheduledTime) return false;
      const date = new Date(item.scheduledTime);
      return (
        date.getDate() === activeDate.getDate() &&
        date.getMonth() === activeDate.getMonth() &&
        date.getFullYear() === activeDate.getFullYear()
      );
    })
    .sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime(),
    );

  return (
    <div className="h-full overflow-y-auto p-6 bg-transparent rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Daily Agenda</h2>
        <span className="text-xs text-gray-500">{formatDate}</span>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        You have {agendaItems.length} posts scheduled for this day.
      </p>

      <div className="space-y-4">
        {agendaItems.length === 0 ? (
          <div className="text-sm text-gray-400">No posts scheduled</div>
        ) : (
          agendaItems.map((item) => {
              const date = new Date(item.scheduledTime);

              const time = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={`${item.postId}-${item.platformId}`}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                >
                  <div className="text-xs text-gray-500">{time}</div>
                  <div className="mt-1 font-medium text-gray-900">
                    {item.caption.slice(0, 100) || "Untitled Post"}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-xs text-blue-600 mt-1">
                      {item.publishStatus}
                    </div>
                    <div className="flex text-xs justify-end text-blue-600 mt-1">
                      {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl text-sm">
        <div className="font-semibold text-blue-700 mb-1">
          AI Optimization Tip
        </div>
        Posting at 11:30 AM typically sees 15% more engagement.
      </div>
    </div>
  );
}
