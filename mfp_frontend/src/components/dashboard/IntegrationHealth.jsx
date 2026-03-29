export default function IntegrationHealth({ integrations }) {
  const entries = Object.entries(integrations || {});

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold mb-4">Integration Health</h3>

      {!entries.length && (
        <p className="text-sm text-slate-500">No integrations found.</p>
      )}

      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm mb-2">
          <span className="capitalize">{key}</span>
          <span className={value ? "text-green-500" : "text-red-500"}>
            {value ? "Connected" : "Not Connected"}
          </span>
        </div>
      ))}
    </div>
  );
}
