import AuditRow from "./AuditRow";

function AuditTable({ logs }) {
  if (!logs.length) {
    return (
      <div className="p-10 text-center text-gray-500">
        No audit activity recorded.
      </div>
    );
  }

  return (
    <table className="min-w-full text-sm">

      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-gray-500 font-medium">
            Timestamp
          </th>
          <th className="px-6 py-4 text-left text-gray-500 font-medium">
            Actor
          </th>
          <th className="px-6 py-4 text-left text-gray-500 font-medium">
            Action
          </th>
          <th className="px-6 py-4 text-left text-gray-500 font-medium">
            Target
          </th>
          <th className="px-6 py-4 text-left text-gray-500 font-medium">
            Details
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {logs.map((log) => (
          <AuditRow key={log.id} log={log} />
        ))}
      </tbody>

    </table>
  );
}

export default AuditTable;