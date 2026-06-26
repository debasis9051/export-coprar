export const MGI_COLS = {
  serialNo: "SR NO",
  coprarNo: "COPRAR NO.",
  cha: "CHA",
  shipper: "SHIPPER",
  status: "STATUS",
  containerNo: "CONTAINER NO",
  cargoType: "FCL/LCL",
  isoCode: "ISO CODE",
  tareWtKg: "TARE WT",
  grossWtKg: "GROSS WT",
  pol: "POL",
  pod: "POD",
};

export const MGI_REQUIRED_COLS = [
  MGI_COLS.status,
  MGI_COLS.containerNo,
  MGI_COLS.cargoType,
  MGI_COLS.isoCode,
  MGI_COLS.tareWtKg,
  MGI_COLS.grossWtKg,
  MGI_COLS.pol,
  MGI_COLS.pod,
];

export const MGI_DEFAULTS = {
  typeOfCargo: "A",
  agentCode: "MGI",
  lineCode: "MGI",
  disposalMode: "V",
  arrivalMode: "T",
};

export const SHIPPING_LINES = {
  ONE: "ONE",
  MGI: "MGI",
};
