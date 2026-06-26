import { REQUIRED_COLS_A } from "../../utils/constants";

export const validateExcelAOne = (headers) => {
  const missing = REQUIRED_COLS_A.filter((col) => !headers.includes(col));
  return { valid: missing.length === 0, missing };
};
