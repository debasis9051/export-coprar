import { normalizeContainer } from "../../utils/containerUtils";
import { normalizePortCode } from "../../utils/portUtils";
import { normalizeStatus, normalizeCargoType } from "../../utils/statusUtils";
import { COLS_A, EXCEL_B_CONTAINER_COL, PORT_COLUMNS_A } from "../../utils/constants";
import { validateProcessedOutput } from "../validators/sharedValidator";

export const processONE = (allExcelAData, excelBRows = []) => {
  const excelBSet = new Set(
    (excelBRows || []).map((r) => normalizeContainer(r[EXCEL_B_CONTAINER_COL]))
  );

  const internalDuplicates = [];
  const merged = [];

  for (const { rows, fileName } of allExcelAData) {
    const seenInFile = new Set();
    for (const row of rows) {
      const key = normalizeContainer(row[COLS_A.containerNo]);
      if (!key) continue;

      if (seenInFile.has(key)) {
        internalDuplicates.push({ ...row, _reason: "Internal duplicate", _sourceFile: fileName });
      } else {
        seenInFile.add(key);
        merged.push({ ...row, _sourceFile: fileName });
      }
    }
  }

  const removedExternal = [];
  const seenGlobal = new Set();
  const passedRows = [];

  for (const row of merged) {
    const key = normalizeContainer(row[COLS_A.containerNo]);

    if (excelBSet.size > 0 && excelBSet.has(key)) {
      removedExternal.push({ ...row, _reason: "Found in Excel B" });
    } else if (seenGlobal.has(key)) {
      removedExternal.push({ ...row, _reason: "Cross-file duplicate" });
    } else {
      seenGlobal.add(key);
      passedRows.push({ ...row });
    }
  }

  const warnings = [];

  const normalizedRows = passedRows.map((row) => {
    const r = { ...row };
    r[COLS_A.status] = normalizeStatus(row[COLS_A.status]);
    r[COLS_A.cargoType] = normalizeCargoType(row[COLS_A.cargoType]);
    for (const col of PORT_COLUMNS_A) {
      if (r[col] != null && r[col] !== "") {
        r[col] = normalizePortCode(r[col]);
      }
    }
    return r;
  });

  normalizedRows.forEach((row, i) => {
    row[COLS_A.serialNo] = i + 1;
  });

  const outputErrors = validateProcessedOutput(normalizedRows);
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

  return {
    processedRows: normalizedRows,
    removedDuplicates,
    warnings,
    outputErrors,
    stats,
    headers: allExcelAData[0]?.headers || Object.values(COLS_A),
  };
};
