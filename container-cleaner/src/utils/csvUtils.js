import { saveAs } from "file-saver";

/**
 * Convert rows array to CSV string.
 * Handles special characters and quotes properly.
 */
export const rowsToCsv = (rows, headers) => {
  if (!rows || rows.length === 0) return "";

  // CSV header
  const escapeCsvField = (field) => {
    const str = field === null || field === undefined ? "" : String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCsvField).join(",");
  
  // CSV data rows
  const dataLines = rows.map((row) =>
    headers.map((col) => {
      const val = row[col] ?? "";
      return escapeCsvField(val);
    }).join(",")
  );

  // CRLF line endings + trailing newline (required by legacy port/customs systems)
  // No BOM — saves as UTF-8 without BOM for maximum compatibility
  return [headerLine, ...dataLines].join("\r\n") + "\r\n";
};

/**
 * Copy CSV text to clipboard
 */
export const copyToClipboard = async (csvText) => {
  try {
    await navigator.clipboard.writeText(csvText);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};

/**
 * Download CSV file
 */
export const downloadCsv = (csvText, filename) => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

/**
 * Safe filename from title
 */
export const sanitizeFilename = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 50);
};
