import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/** Build a safe base filename from one or more source file names. */
const toSafeBase = (fileNames) =>
  fileNames
    .map((n) => n.replace(/\.[^.]+$/, ""))
    .join("+")
    .replace(/[<>:"/\\|?*]/g, "_")
    .slice(0, 80);

/** Strip internal tracking fields (_reason, _sourceFile) from headers / rows. */
const cleanHeaders = (headers) => headers.filter((h) => !h.startsWith("_"));

const buildOrderedRows = (rows, headers) =>
  rows.map((row) => {
    const obj = {};
    headers.forEach((h) => {
      obj[h] = row[h] ?? "";
    });
    return obj;
  });

/** Convert a JSON array to CSV string via SheetJS and trigger download. */
const downloadCsv = (data, cols, filename) => {
  const ws = XLSX.utils.json_to_sheet(data, { header: cols });
  // sheet_to_csv produces LF — replace with CRLF for max compatibility
  // No BOM — UTF-8 without BOM avoids encoding bugs in legacy portal systems
  // Trailing \r\n ensures the last record is not dropped by EOF-sensitive parsers
  const csv = XLSX.utils.sheet_to_csv(ws).replace(/\n/g, "\r\n").trimEnd() + "\r\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

/**
 * Export the cleaned / processed rows to a .csv file.
 * Filename: <sourceFiles>_processed_output.csv
 */
export const exportProcessedFile = (rows, headers, fileNames) => {
  const base = toSafeBase(fileNames);
  const cols = cleanHeaders(headers);
  const data = buildOrderedRows(rows, cols);
  downloadCsv(data, cols, `${base}_processed_output.csv`);
};

/**
 * Export the removed-duplicates report to a .csv file.
 * Adds "Reason" and "Source File" columns at the end.
 * Filename: <sourceFiles>_removed_duplicates.csv
 */
export const exportRemovedDuplicates = (rows, headers, fileNames) => {
  const base = toSafeBase(fileNames);
  const cols = cleanHeaders(headers);
  const extCols = [...cols, "Reason", "Source File"];
  const data = rows.map((row) => {
    const obj = {};
    cols.forEach((h) => {
      obj[h] = row[h] ?? "";
    });
    obj["Reason"] = row._reason ?? "";
    obj["Source File"] = row._sourceFile ?? "";
    return obj;
  });
  downloadCsv(data, extCols, `${base}_removed_duplicates.csv`);
};
