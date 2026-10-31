type CsvCell = string | number | null | undefined;

/**
 * Wraps every value in quotes so commas inside names do not break the file.
 * Text that starts with = + - @ (or tab / CR) is prefixed with ' so Excel never
 * evaluates it as a formula (CSV injection, e.g. from public job applications).
 */
function toCsvCell(value: CsvCell): string {
  let text = String(value ?? "");
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

/** Builds a downloadable CSV file response. */
export function createCsvResponse(fileName: string, headerRow: string[], dataRows: CsvCell[][]): Response {
  const csvText = [headerRow, ...dataRows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  return new Response(csvText, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName.replace(/[^w.-]/g, "_")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
