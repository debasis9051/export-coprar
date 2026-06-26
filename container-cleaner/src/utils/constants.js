// Excel A column names — exact match to spreadsheet headers
export const COLS_A = {
  serialNo:       "SR NO(OPTIONAL)",
  status:         "STATUS (F-> Full /E-> Empty) (MANDATORY)",
  containerNo:    "CONTAINER NO (MANDATORY)",
  cargoType:      "FCL/LCL/EMPTY (FCL-> FCL /LCL->LCL /EMP ->EMPTY (MANDATORY)",
  isoCode:        "ISO CODE (MANDATORY)",
  tareWt:         "TARE WT(in MT) (MANDATORY)",
  grossWt:        "GROSS WT(in MT) (MANDATORY)",
  customSeal:     "CUSTOM SEAL NO (OPTIONAL)",
  agentSeal:      "AGENT SEAL NO (OPTIONAL)",
  portOfOrigin:   "PORT OF ORIGIN (MANDATORY)",
  pol:            "POL (MANDATORY)",
  placeOfStuffin: "PLACE OF STUFFIN (OPTIONAL)",
  cargoDesc:      "CARGO DESCRIPTION (OPTIONAL)",
  blNo:           "BL NO (OPTIONAL)",
  houseBl:        "HOUSE BL NO (OPTIONAL)",
  igmNo:          "IGM NO (OPTIONAL)",
  itemNo:         "ITEM NO (OPTIONAL)",
  subItemNo:      "SUB ITEM NO (OPTIONAL)",
  typeOfCargo:    "TYPE OF CARGO (MANDATORY)",
  agentCode:      "AGENT CODE (MANDATORY)",
  lineCode:       "LINE CODE (MANDATORY)",
  imoClass:       "IMO CLASS(IMO (2.1 -9.9)) (OPTIONAL)",
  unNo:           "UN NO (OPTIONAL)",
  pod:            "POD (MANDATORY)",
  fpd:            "FPD (MANDATORY)",
  disposalMode:   "DISPOSAL MOVEMENT MODE (R - Rail, T-Truck, V - Vessel) (MANDATORY)",
  icdCont:        "ICD CONT? (If ICD Cont-Y, else N) (OPTIONAL)",
  arrivalMode:    "ARRIVAL MODE (Arrival type (R - Rail, T - Truck , V - Vessel) (MANDATORY)",
  shippersOwn:    "Shippers OwnContainer (OPTIONAL)",
  unitOfTemp:     "UNIT OF TEMP (OPTIONAL)",
  maxTemp:        "MAX TEMP (OPTIONAL)",
  minTemp:        "MIN TEMP (OPTIONAL)",
  dimensionCode:  "DIMENSION CODE (OPTIONAL)",
  oogLength:      "OOG LENGTH (OPTIONAL)",
  oogWidth:       "OOG WIDTH (OPTIONAL)",
  oogHeight:      "OOG HEIGHT (OPTIONAL)",
};

// Port columns in Excel A that need normalisation (append "1")
export const PORT_COLUMNS_A = [
  COLS_A.portOfOrigin,
  COLS_A.pol,
  COLS_A.pod,
  COLS_A.fpd,
];

// Mandatory columns that must exist in every Excel A file
export const REQUIRED_COLS_A = [
  COLS_A.status,
  COLS_A.containerNo,
  COLS_A.cargoType,
  COLS_A.portOfOrigin,
  COLS_A.pol,
  COLS_A.pod,
  COLS_A.fpd,
];

// Excel B config
export const EXCEL_B_CONTAINER_COL = "CONT_NO";
export const EXCEL_B_SKIP_ROWS = 3; // 3 metadata rows before actual headers

// ══════════════════════════════════════════════════════════════════════════════
// ROW-LEVEL VALIDATION RULES (Mandatory Fields)
// ══════════════════════════════════════════════════════════════════════════════

export const MANDATORY_FIELDS_A = {
  [COLS_A.status]: {
    type: "enum",
    label: "STATUS",
    validValues: ["F", "E"],
    errorMsg: "Must be 'F' (Full) or 'E' (Empty)",
  },
  [COLS_A.containerNo]: {
    type: "required",
    label: "CONTAINER NO",
    errorMsg: "Container number is required and cannot be empty",
  },
  [COLS_A.cargoType]: {
    type: "enum",
    label: "FCL/LCL/EMPTY",
    validValues: ["FCL", "LCL", "EMP"],
    errorMsg: "Must be 'FCL', 'LCL', or 'EMP'",
  },
  [COLS_A.isoCode]: {
    type: "required",
    label: "ISO CODE",
    errorMsg: "ISO code is required and cannot be empty",
  },
  [COLS_A.tareWt]: {
    type: "numeric",
    label: "TARE WT",
    min: 0,
    errorMsg: "Tare weight must be a valid number >= 0",
  },
  [COLS_A.grossWt]: {
    type: "numeric",
    label: "GROSS WT",
    min: 0,
    errorMsg: "Gross weight must be a valid number >= 0",
  },
  [COLS_A.portOfOrigin]: {
    type: "port",
    label: "PORT OF ORIGIN",
    errorMsg: "Port of origin is required and cannot be empty",
  },
  [COLS_A.pol]: {
    type: "port",
    label: "POL",
    errorMsg: "Port of loading is required and cannot be empty",
  },
  [COLS_A.pod]: {
    type: "port",
    label: "POD",
    errorMsg: "Port of discharge is required and cannot be empty",
  },
  [COLS_A.fpd]: {
    type: "port",
    label: "FPD",
    errorMsg: "Final port of discharge is required and cannot be empty",
  },
  [COLS_A.typeOfCargo]: {
    type: "required",
    label: "TYPE OF CARGO",
    errorMsg: "Type of cargo is required and cannot be empty",
  },
  [COLS_A.agentCode]: {
    type: "required",
    label: "AGENT CODE",
    errorMsg: "Agent code is required and cannot be empty",
  },
  [COLS_A.lineCode]: {
    type: "required",
    label: "LINE CODE",
    errorMsg: "Line code is required and cannot be empty",
  },
  [COLS_A.disposalMode]: {
    type: "enum",
    label: "DISPOSAL MOVEMENT MODE",
    validValues: ["R", "T", "V"],
    errorMsg: "Must be 'R' (Rail), 'T' (Truck), or 'V' (Vessel)",
  },
  [COLS_A.arrivalMode]: {
    type: "enum",
    label: "ARRIVAL MODE",
    validValues: ["R", "T", "V"],
    errorMsg: "Must be 'R' (Rail), 'T' (Truck), or 'V' (Vessel)",
  },
};

// UI
export const PREVIEW_ROWS = 200;
