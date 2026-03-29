export default function AIInsightsCard({ insights = [] }) {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">

      <h3 className="font-semibold mb-4">AI Marketing Insights</h3>

      {insights.map((item, i) => (
        <div key={i} className="bg-white p-4 rounded-lg mb-3">
          <div className="font-medium">{item.title}</div>
          <p className="text-xs text-gray-500">{item.description}</p>
        </div>
      ))}

    </div>
  );
}