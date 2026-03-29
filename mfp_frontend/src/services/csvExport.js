export const exportRowsToCsv = (filename, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return false;

  const normalizedRows = rows.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) return row;
    return { value: row };
  });

  const headers = Array.from(
    normalizedRows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set()),
  );

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const lines = [
    headers.join(","),
    ...normalizedRows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  return true;
};
