import { useState } from "react";

function AuditRow({ log }) {
  const [open, setOpen] = useState(false);

  const formattedDate = new Date(log.created_at).toLocaleString();

  return (
    <>
      <tr className="hover:bg-gray-50 transition">

        <td className="px-6 py-4 text-gray-700">
          {formattedDate}
        </td>

        <td className="px-6 py-4 text-gray-700">
          {log.actor_email || "System"}
        </td>

        <td className="px-6 py-4">
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-600">
            {log.action}
          </span>
        </td>

        <td className="px-6 py-4 text-gray-600">
          {log.target || "-"}
        </td>

        <td className="px-6 py-4">
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-blue-600 hover:underline"
          >
            {open ? "Hide" : "View"}
          </button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan="5" className="px-6 py-4 bg-gray-50">
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export default AuditRow;