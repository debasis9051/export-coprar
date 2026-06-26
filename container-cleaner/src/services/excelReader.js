import * as XLSX from "xlsx";
import { EXCEL_B_SKIP_ROWS } from "../utils/constants";

const readFileBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });

/**
 * Convert a raw matrix (array-of-arrays from sheet_to_json header:1)
 * into { headers, rows } where each row is a keyed object.
 */
const matrixToRows = (raw) => {
  const headers = (raw[0] ?? []).map((h) =>
    h === null || h === undefined ? "" : String(h).trim()
  );
  const rows = raw
    .slice(1)
    .filter((r) => r.some((c) => c !== null && c !== undefined && c !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = r[i] ?? null;
      });
      return obj;
    });
  return { headers, rows };
};

/**
 * Read an Excel A file (.xlsx / .xls / .csv).
 * Returns { rows, headers, sheetName, fileName }
 */
export const readExcelA = async (file) => {
  const buffer = await readFileBuffer(file);
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const { headers, rows } = matrixToRows(raw);
  return { rows, headers, sheetName, fileName: file.name };
};

/**
 * Read an Excel B file (.csv / .xlsx / .xls).
 * Skips EXCEL_B_SKIP_ROWS (3) metadata rows before the actual header row.
 * Returns { rows, headers, sheetName, fileName }
 */
export const readExcelB = async (file) => {
  const buffer = await readFileBuffer(file);
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    range: EXCEL_B_SKIP_ROWS,
    defval: null,
  });
  const { headers, rows } = matrixToRows(raw);
  return { rows, headers, sheetName, fileName: file.name };
};
