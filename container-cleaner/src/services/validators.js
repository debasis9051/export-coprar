import { REQUIRED_COLS_A, EXCEL_B_CONTAINER_COL, MANDATORY_FIELDS_A, COLS_A, PORT_COLUMNS_A } from "../utils/constants";

export const validateExcelA = (headers) => {
  const missing = REQUIRED_COLS_A.filter((col) => !headers.includes(col));
  return { valid: missing.length === 0, missing };
};

export const validateExcelB = (headers) => {
  const hasContNo = headers.includes(EXCEL_B_CONTAINER_COL);
  return { valid: hasContNo, missing: hasContNo ? [] : [EXCEL_B_CONTAINER_COL] };
};

/**
 * Validate a single row against mandatory field rules.
 * Returns array of validation errors. Empty array = row is valid.
 *
 * @param {object} row - Data row from Excel
 * @param {number} rowIndex - 1-based row number for reporting
 * @returns {Array} Array of error messages for this row
 */
export const validateRow = (row, rowIndex) => {
  const errors = [];

  for (const [colName, rule] of Object.entries(MANDATORY_FIELDS_A)) {
    const value = row[colName];
    const isEmpty = value === null || value === undefined || value === "";
    const fieldLabel = rule.label;

    // Check if field is empty
    if (isEmpty) {
      errors.push(`${fieldLabel}: ${rule.errorMsg}`);
      continue;
    }

    // Validate based on rule type
    switch (rule.type) {
      case "enum": {
        const normalized = String(value).toUpperCase().trim();
        if (!rule.validValues.includes(normalized)) {
          errors.push(
            `${fieldLabel}: ${rule.errorMsg} (got: "${value}")`
          );
        }
        break;
      }

      case "numeric": {
        const num = parseFloat(value);
        if (isNaN(num) || num < (rule.min ?? 0)) {
          errors.push(
            `${fieldLabel}: ${rule.errorMsg} (got: "${value}")`
          );
        }
        break;
      }

      case "port": {
        const normalized = String(value).trim().toUpperCase();
        // Basic port validation: non-empty string, alphanumeric
        if (!normalized || !/^[A-Z0-9]+$/.test(normalized)) {
          errors.push(
            `${fieldLabel}: ${rule.errorMsg} (got: "${value}")`
          );
        }
        break;
      }

      case "required":
      default: {
        const normalized = String(value).trim();
        if (!normalized) {
          errors.push(`${fieldLabel}: ${rule.errorMsg}`);
        }
        break;
      }
    }
  }

  return errors;
};

/**
 * Batch validate multiple rows and return warnings for each.
 * Warnings do NOT block processing.
 *
 * @param {Array} rows - All data rows
 * @param {number} startIndex - Starting row index for reporting (default: 0)
 * @returns {Array} Array of { rowIndex, containerNo, errors } objects
 */
export const validateRows = (rows, startIndex = 0) => {
  const warnings = [];

  rows.forEach((row, idx) => {
    const errors = validateRow(row, startIndex + idx + 1);
    if (errors.length > 0) {
      warnings.push({
        rowIndex: startIndex + idx + 1,
        containerNo: row[COLS_A.containerNo] || "(missing)",
        errors,
      });
    }
  });

  return warnings;
};

/**
 * Validate the PROCESSED/NORMALIZED output for data quality.
 * This is a SYSTEM VALIDATION — if issues found, it indicates a processing failure.
 * Returns critical errors that should block export.
 *
 * @param {Array} processedRows - Normalized rows from processor
 * @returns {Array} Array of { rowIndex, containerNo, errors, severity } objects
 */
export const validateProcessedOutput = (processedRows) => {
  const errors = [];

  processedRows.forEach((row, idx) => {
    const rowErrors = [];
    const rowIndex = idx + 1;

    // ── Critical checks: These MUST be present and valid after normalization ──
    
    // Check STATUS is normalized (should be F or E only)
    const status = row[COLS_A.status];
    if (!status || !["F", "E"].includes(String(status).toUpperCase())) {
      rowErrors.push(
        `STATUS not properly normalized: got "${status}" (expected F or E)`
      );
    }

    // Check CARGO TYPE is normalized (should be FCL, LCL, or EMP only)
    const cargoType = row[COLS_A.cargoType];
    if (!cargoType || !["FCL", "LCL", "EMP"].includes(String(cargoType).toUpperCase())) {
      rowErrors.push(
        `FCL/LCL/EMPTY not properly normalized: got "${cargoType}" (expected FCL, LCL, or EMP)`
      );
    }

    // Check port codes have been normalized (should contain "1" suffix)
    for (const portCol of PORT_COLUMNS_A) {
      const portValue = row[portCol];
      if (portValue && typeof portValue === "string") {
        if (!portValue.endsWith("1")) {
          rowErrors.push(
            `${COLS_A[Object.keys(COLS_A).find(k => COLS_A[k] === portCol)] || portCol}: Port code missing "1" suffix: "${portValue}"`
          );
        }
      }
    }

    // Check serial number was rebuilt
    const serialNo = row[COLS_A.serialNo];
    if (!serialNo || Number(serialNo) !== rowIndex) {
      rowErrors.push(
        `Serial number not properly rebuilt: got ${serialNo}, expected ${rowIndex}`
      );
    }

    if (rowErrors.length > 0) {
      errors.push({
        rowIndex,
        containerNo: row[COLS_A.containerNo] || "(missing)",
        errors: rowErrors,
        severity: "critical",
      });
    }
  });

  return errors;
};

