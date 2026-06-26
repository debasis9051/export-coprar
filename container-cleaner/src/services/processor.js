import { normalizeContainer } from "../utils/containerUtils";
import { normalizePortCode } from "../utils/portUtils";
import { normalizeStatus, normalizeCargoType } from "../utils/statusUtils";
import { COLS_A, EXCEL_B_CONTAINER_COL, PORT_COLUMNS_A } from "../utils/constants";
import { validateRows, validateProcessedOutput } from "./validators";

/**
 * Full processing pipeline with row-level validation.
 *
 * @param {Array<{rows, headers, fileName}>} allExcelAData - one entry per uploaded Excel A file
 * @param {Array<object>} excelBRows - rows from Excel B (reference / dedup list), optional
 * @returns {{ processedRows, removedDuplicates, warnings, outputErrors, stats }}
 */
export const processFiles = (allExcelAData, excelBRows = []) => {
  // ── Build Excel B container lookup (optional) ──────────────────────────
  const excelBSet = new Set(
    (excelBRows || []).map((r) => normalizeContainer(r[EXCEL_B_CONTAINER_COL]))
  );

  // ── Step 1: Per-file internal dedup, then merge ─────────────────────────
  const internalDuplicates = [];
  const merged = [];

  for (const { rows, fileName } of allExcelAData) {
    const seenInFile = new Set();
    for (const row of rows) {
      const key = normalizeContainer(row[COLS_A.containerNo]);
      if (!key) continue;

      if (seenInFile.has(key)) {
        internalDuplicates.push({ ...row, [COLS_A.containerNo]: key, _reason: "Internal duplicate", _sourceFile: fileName });
      } else {
        seenInFile.add(key);
        merged.push({ ...row, [COLS_A.containerNo]: key, _sourceFile: fileName });
      }
    }
  }

  // ── Step 2: Cross-file dedup + Excel B dedup (Excel B optional) ────────
  const removedExternal = [];
  const seenGlobal = new Set();
  const passedRows = [];

  for (const row of merged) {
    const key = normalizeContainer(row[COLS_A.containerNo]);

    // Check Excel B if provided
    if (excelBSet.size > 0 && excelBSet.has(key)) {
      removedExternal.push({ ...row, _reason: "Found in Excel B" });
    } else if (seenGlobal.has(key)) {
      removedExternal.push({ ...row, _reason: "Cross-file duplicate" });
    } else {
      seenGlobal.add(key);
      passedRows.push({ ...row });
    }
  }

  // ── Step 3: Skip input validation warnings (not shown to user) ───────────
  const warnings = [];

  // ── Step 4: Normalize remaining rows ────────────────────────────────────
  const normalizedRows = passedRows.map((row) => {
    const r = { ...row };
    r[COLS_A.containerNo] = normalizeContainer(row[COLS_A.containerNo]);
    r[COLS_A.status] = normalizeStatus(row[COLS_A.status]);
    r[COLS_A.cargoType] = normalizeCargoType(row[COLS_A.cargoType]);
    for (const col of PORT_COLUMNS_A) {
      if (r[col] != null && r[col] !== "") {
        r[col] = normalizePortCode(r[col]);
      }
    }
    return r;
  });

  // ── Step 5: Rebuild serial numbers ──────────────────────────────────────
  normalizedRows.forEach((row, i) => {
    row[COLS_A.serialNo] = i + 1;
  });

  // ── Step 6: Quality check on PROCESSED output ────────────────────────────
  const outputErrors = validateProcessedOutput(normalizedRows);

  // ── Assemble result ──────────────────────────────────────────────────────
  const removedDuplicates = [...internalDuplicates, ...removedExternal];

  const stats = {
    totalInputRows: merged.length + internalDuplicates.length,
    excelBRows: (excelBRows || []).length,
    internalDuplicatesRemoved: internalDuplicates.length,
    removedByExcelB: removedExternal.filter((r) => r._reason === "Found in Excel B").length,
    crossFileDuplicates: removedExternal.filter((r) => r._reason === "Cross-file duplicate").length,
    totalRemoved: removedDuplicates.length,
    finalRows: normalizedRows.length,
    outputErrorCount: outputErrors.length,
  };

  return { processedRows: normalizedRows, removedDuplicates, warnings, outputErrors, stats };
};
