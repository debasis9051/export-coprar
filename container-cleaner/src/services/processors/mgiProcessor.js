import { normalizeContainer } from "../../utils/containerUtils";
import { COLS_A, EXCEL_B_CONTAINER_COL } from "../../utils/constants";
import { MGI_COLS, MGI_DEFAULTS } from "../../utils/mgiConstants";
import { validateProcessedOutput } from "../validators/sharedValidator";
import { validateMGIRow } from "../validators/mgiValidator";

const normalizeMGIStatus = (value) => {
  const v = String(value ?? "").trim().toUpperCase();
  if (v === "FULL") return "F";
  if (v === "EMPTY") return "E";
  return v;
};

const normalizeMGICargoType = (value) => {
  const v = String(value ?? "").trim().toUpperCase();
  if (v === "EMPTY") return "EMP";
  return v;
};

const normalizePort = (port) => {
  const p = String(port ?? "").trim().toUpperCase();
  if (!p) return "";
  if (p.length === 5) return `${p}1`;
  return p;
};

const parseNumeric = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  const cleaned = String(value).replace(/,/g, "").trim();
  return Number(cleaned);
};

// Normalize each field independently:
// <= 99.99 => already MT, > 99.99 => KG to MT
const normalizeWeightToMT = (value) => {
  const num = parseNumeric(value);
  if (!Number.isFinite(num) || num <= 0) {
    return { value: "", error: `Invalid numeric value: \"${value}\"` };
  }

  const mt = num <= 99.99 ? num : num / 1000;
  return { value: Number(mt.toFixed(3)), error: null };
};

const toStandardRow = (mgiRow, weight = {}) => {
  const row = {};

  for (const header of Object.values(COLS_A)) {
    row[header] = "";
  }

  row[COLS_A.status] = normalizeMGIStatus(mgiRow[MGI_COLS.status]);
  row[COLS_A.containerNo] = normalizeContainer(mgiRow[MGI_COLS.containerNo]);
  row[COLS_A.cargoType] = normalizeMGICargoType(mgiRow[MGI_COLS.cargoType]);
  row[COLS_A.isoCode] = mgiRow[MGI_COLS.isoCode] ?? "";
  row[COLS_A.tareWt] = weight.tareMt ?? "";
  row[COLS_A.grossWt] = weight.grossMt ?? "";
  row[COLS_A.portOfOrigin] = normalizePort(mgiRow[MGI_COLS.pol]);
  row[COLS_A.pol] = normalizePort(mgiRow[MGI_COLS.pol]);
  row[COLS_A.pod] = normalizePort(mgiRow[MGI_COLS.pod]);
  row[COLS_A.fpd] = normalizePort(mgiRow[MGI_COLS.pod]);

  row[COLS_A.typeOfCargo] = MGI_DEFAULTS.typeOfCargo;
  row[COLS_A.agentCode] = MGI_DEFAULTS.agentCode;
  row[COLS_A.lineCode] = MGI_DEFAULTS.lineCode;
  row[COLS_A.disposalMode] = MGI_DEFAULTS.disposalMode;
  row[COLS_A.arrivalMode] = MGI_DEFAULTS.arrivalMode;

  return row;
};

export const processMGI = (allExcelAData, excelBRows = []) => {
  const excelBSet = new Set(
    (excelBRows || []).map((r) => normalizeContainer(r[EXCEL_B_CONTAINER_COL]))
  );

  const internalDuplicates = [];
  const removedExternal = [];
  const validationRemoved = [];
  const warnings = [];
  const merged = [];

  for (const { rows, fileName } of allExcelAData) {
    const seenInFile = new Set();

    rows.forEach((row, idx) => {
      const validationErrors = validateMGIRow(row, idx + 1);
      const normalizedContainer = normalizeContainer(row[MGI_COLS.containerNo]);
      const tare = normalizeWeightToMT(row[MGI_COLS.tareWtKg]);
      const gross = normalizeWeightToMT(row[MGI_COLS.grossWtKg]);

      const weightErrors = [];
      if (tare.error) weightErrors.push(`TARE WT: ${tare.error}`);
      if (gross.error) weightErrors.push(`GROSS WT: ${gross.error}`);
      if (!tare.error && !gross.error && gross.value < tare.value) {
        weightErrors.push(`GROSS WT: Gross MT (${gross.value}) must be >= Tare MT (${tare.value})`);
      }

      const weightWarnings = [];
      if (!tare.error && tare.value > 10) {
        weightWarnings.push(`Unusually high tare weight: ${tare.value} MT`);
      }
      if (!gross.error && gross.value > 50) {
        weightWarnings.push(`Unusually high gross weight: ${gross.value} MT`);
      }

      if (!normalizedContainer) {
        validationRemoved.push({
          ...toStandardRow(row, { tareMt: tare.value, grossMt: gross.value }),
          _reason: "Missing container number",
          _sourceFile: fileName,
        });
        return;
      }

      const allErrors = [...validationErrors, ...weightErrors];
      if (allErrors.length > 0) {
        validationRemoved.push({
          ...toStandardRow(row, { tareMt: tare.value, grossMt: gross.value }),
          _reason: allErrors[0],
          _sourceFile: fileName,
        });
        return;
      }

      const normalizedRow = toStandardRow(row, { tareMt: tare.value, grossMt: gross.value });
      normalizedRow._sourceFile = fileName;

      if (weightWarnings.length > 0) {
        warnings.push({
          rowIndex: idx + 1,
          containerNo: normalizedContainer,
          errors: weightWarnings,
          severity: "warning",
        });
      }

      if (seenInFile.has(normalizedContainer)) {
        internalDuplicates.push({ ...normalizedRow, _reason: "Internal duplicate" });
      } else {
        seenInFile.add(normalizedContainer);
        merged.push(normalizedRow);
      }
    });
  }

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

  passedRows.forEach((row, i) => {
    row[COLS_A.serialNo] = i + 1;
  });

  const outputErrors = validateProcessedOutput(passedRows);
  const removedDuplicates = [...internalDuplicates, ...removedExternal, ...validationRemoved];

  const stats = {
    totalInputRows: rowsCount(allExcelAData),
    excelBRows: (excelBRows || []).length,
    internalDuplicatesRemoved: internalDuplicates.length,
    removedByExcelB: removedExternal.filter((r) => r._reason === "Found in Excel B").length,
    crossFileDuplicates: removedExternal.filter((r) => r._reason === "Cross-file duplicate").length,
    totalRemoved: removedDuplicates.length,
    finalRows: passedRows.length,
    outputErrorCount: outputErrors.length,
  };

  return {
    processedRows: passedRows,
    removedDuplicates,
    warnings,
    outputErrors,
    stats,
    headers: Object.values(COLS_A),
  };
};

const rowsCount = (allExcelAData) =>
  allExcelAData.reduce((sum, item) => sum + (item.rows?.length || 0), 0);
