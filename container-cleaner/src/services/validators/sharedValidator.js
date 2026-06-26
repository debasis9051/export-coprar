import { EXCEL_B_CONTAINER_COL, COLS_A, PORT_COLUMNS_A } from "../../utils/constants";

export const validateExcelB = (headers) => {
  const hasContNo = headers.includes(EXCEL_B_CONTAINER_COL);
  return { valid: hasContNo, missing: hasContNo ? [] : [EXCEL_B_CONTAINER_COL] };
};

export const validateProcessedOutput = (processedRows) => {
  const errors = [];

  processedRows.forEach((row, idx) => {
    const rowErrors = [];
    const rowIndex = idx + 1;

    const status = row[COLS_A.status];
    if (!status || !["F", "E"].includes(String(status).toUpperCase())) {
      rowErrors.push(`STATUS not properly normalized: got \"${status}\" (expected F or E)`);
    }

    const cargoType = row[COLS_A.cargoType];
    if (!cargoType || !["FCL", "LCL", "EMP"].includes(String(cargoType).toUpperCase())) {
      rowErrors.push(`FCL/LCL/EMPTY not properly normalized: got \"${cargoType}\" (expected FCL, LCL, or EMP)`);
    }

    for (const portCol of PORT_COLUMNS_A) {
      const portValue = row[portCol];
      if (portValue && typeof portValue === "string" && !portValue.endsWith("1")) {
        rowErrors.push(`${portCol}: Port code missing \"1\" suffix: \"${portValue}\"`);
      }
    }

    const serialNo = row[COLS_A.serialNo];
    if (!serialNo || Number(serialNo) !== rowIndex) {
      rowErrors.push(`Serial number not properly rebuilt: got ${serialNo}, expected ${rowIndex}`);
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
