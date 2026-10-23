type CsvCell = string | number | null | undefined;

/** Wraps every value in quotes so commas inside names do not break the file. */
function toCsvCell(value: CsvCell): string {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

/** Builds a downloadable CSV file response. */
export function createCsvResponse(fileName: string, headerRow: string[], dataRows: CsvCell[][]): Response {
  const csvText = [headerRow, ...dataRows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  return new Response(csvText, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
