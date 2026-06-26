/**
 * Normalise a container number:
 * remove all whitespace, trim, uppercase.
 */
export const normalizeContainer = (value) => {
  if (!value) return "";
  return String(value).replace(/\s+/g, "").trim().toUpperCase();
};
