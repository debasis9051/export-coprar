import { MGI_REQUIRED_COLS, MGI_COLS } from "../../utils/mgiConstants";

export const validateExcelAMGI = (headers) => {
  const missing = MGI_REQUIRED_COLS.filter((col) => !headers.includes(col));
  return { valid: missing.length === 0, missing };
};

export const validateMGIRow = (row, rowIndex) => {
  const errors = [];

  const normalizedContainer = String(row[MGI_COLS.containerNo] ?? "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "");

  if (!normalizedContainer) {
    errors.push("CONTAINER NO: Container number is required");
  } else if (!/^[A-Z]{4}[0-9]{7}$/.test(normalizedContainer)) {
    errors.push(`CONTAINER NO: Invalid format at row ${rowIndex} (got: \"${row[MGI_COLS.containerNo]}\")`);
  }

  const statusRaw = String(row[MGI_COLS.status] ?? "").trim().toUpperCase();
  const normalizedStatus = statusRaw === "FULL" ? "F" : statusRaw === "EMPTY" ? "E" : statusRaw;
  if (!["F", "E"].includes(normalizedStatus)) {
    errors.push(`STATUS: Must be F/E/FULL/EMPTY (got: \"${row[MGI_COLS.status]}\")`);
  }

  const cargoRaw = String(row[MGI_COLS.cargoType] ?? "").trim().toUpperCase();
  const normalizedCargo = cargoRaw === "EMPTY" ? "EMP" : cargoRaw;
  if (!["FCL", "LCL", "EMP"].includes(normalizedCargo)) {
    errors.push(`FCL/LCL: Must be FCL/LCL/EMPTY/EMP (got: \"${row[MGI_COLS.cargoType]}\")`);
  }

  const isoCode = String(row[MGI_COLS.isoCode] ?? "").trim();
  if (!isoCode) errors.push("ISO CODE: Required");

  const pol = String(row[MGI_COLS.pol] ?? "").trim();
  if (!pol) errors.push("POL: Required");

  const pod = String(row[MGI_COLS.pod] ?? "").trim();
  if (!pod) errors.push("POD: Required");

  return errors;
};
