/**
 * Normalise a port code:
 * strip spaces, uppercase, then append "1" if not already ending in "1".
 */
export const normalizePortCode = (value) => {
  if (!value) return "";
  const cleaned = String(value).replace(/\s+/g, "").trim().toUpperCase();
  return cleaned.endsWith("1") ? cleaned : `${cleaned}1`;
};
