/**
 * Normalise container status.
 *  FULL | TANK  → "F"
 *  EMPTY        → "E"
 *  anything else → pass through as-is
 */
export const normalizeStatus = (value) => {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "full" || v === "tank") return "F";
  if (v === "empty") return "E";
  return String(value ?? "");
};

/**
 * Normalise FCL/LCL/EMPTY cargo-type column.
 *  FCL | TANK  → "FCL"
 *  LCL         → "LCL"
 *  EMPTY       → "EMP"
 *  anything else → pass through as-is
 */
export const normalizeCargoType = (value) => {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "fcl" || v === "tank") return "FCL";
  if (v === "lcl") return "LCL";
  if (v === "empty") return "EMP";
  return String(value ?? "");
};
