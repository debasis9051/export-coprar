# COPRAR Normalize Export — Codebase Guide

## What This App Does

A **browser-only React application** that normalizes and deduplicates container shipping data in COPRAR (Container Progress Report and Advice of Receipt) format. It supports two major shipping line formats:

- **ONE (Ocean Network Express)** — standard COPRAR Excel template
- **MGI (Mediterranean Shipping Company)** — proprietary MGI Excel format that the app auto-converts to COPRAR

No backend, no server — everything runs in the browser using SheetJS and file-saver.

---

## Directory Structure

```
coprar normalize export/
├── container-cleaner/          # The React app (Vite + MUI)
│   ├── src/
│   │   ├── App.jsx             # Root component, renders layout and wires state
│   │   ├── main.jsx            # React entry point
│   │   ├── theme.js            # MUI theme factory (light/dark)
│   │   ├── components/         # Pure UI components
│   │   │   ├── NavBar.jsx                  # Top nav with theme toggle
│   │   │   ├── Header.jsx                  # Status chips banner
│   │   │   ├── FileUpload.jsx              # File pickers + shipping line selector
│   │   │   ├── ActionButtons.jsx           # Process / Download / Reset buttons
│   │   │   ├── ProcessingSummary.jsx       # 7-card stats grid
│   │   │   ├── ValidationTable.jsx         # Scrollable data preview table
│   │   │   ├── ValidationWarningsPanel.jsx # Row-level warnings panel (MGI weights)
│   │   │   └── LoadingOverlay.jsx          # Full-screen spinner during processing
│   │   ├── hooks/
│   │   │   └── useExcelProcessor.js        # All state management + orchestration
│   │   ├── services/
│   │   │   ├── excelReader.js              # SheetJS file-to-rows parsing
│   │   │   ├── exporter.js                 # CSV download via file-saver
│   │   │   ├── processor.js                # (re-export shim)
│   │   │   └── processors/
│   │   │       ├── processorFactory.js     # Returns ONE or MGI processor by key
│   │   │       ├── oneProcessor.js         # ONE dedup + normalization pipeline
│   │   │       └── mgiProcessor.js         # MGI validation + conversion pipeline
│   │   │   └── validators/
│   │   │       ├── validatorFactory.js     # Returns ONE or MGI header validator
│   │   │       ├── oneValidator.js         # Checks ONE required column headers
│   │   │       ├── mgiValidator.js         # Checks MGI headers + row-level rules
│   │   │       └── sharedValidator.js      # Excel B validator + output schema check
│   │   └── utils/
│   │       ├── constants.js        # COLS_A (COPRAR column names), MANDATORY_FIELDS_A
│   │       ├── mgiConstants.js     # MGI_COLS, MGI_DEFAULTS, SHIPPING_LINES enum
│   │       ├── containerUtils.js   # normalizeContainer() — strip spaces, uppercase
│   │       ├── portUtils.js        # normalizePortCode() — uppercase + append "1"
│   │       ├── statusUtils.js      # normalizeStatus() / normalizeCargoType()
│   │       └── csvUtils.js         # rowsToCsv() / downloadCsv() helpers
│   ├── public/                 # Static logo assets
│   ├── dist/                   # Vite production build output (gitignored)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── input files/                # Sample test data (not shipped)
│   ├── mgi/                    # MGI .xls test files
│   ├── one-test/               # ONE .xlsx test files
│   └── *.csv / *.xlsx          # Reference / output examples
└── guide/
    └── CODEBASE.md             # This file
```

---

## Data Flow

```
User uploads Excel A file(s)
        │
        ▼
excelReader.js  ──►  SheetJS parses rows & headers
        │
        ▼
validatorFactory  ──►  Check required column headers present
        │   (throws error shown in Snackbar if missing)
        ▼
processorFactory  ──►  Select ONE or MGI pipeline
        │
        ▼
   ┌────────────────────────────────┐
   │          PROCESSOR             │
   │                                │
   │  1. Per-file internal dedup    │
   │     (normalizeContainer key)   │
   │  2. Cross-file dedup           │
   │  3. Excel B dedup (optional)   │
   │  4. Normalize fields           │
   │     - status → F / E           │
   │     - cargoType → FCL/LCL/EMP  │
   │     - ports → uppercase + "1"  │
   │     - MGI: kg → MT, set dflt   │
   │  5. Rebuild serial numbers     │
   └────────────────────────────────┘
        │
        ▼
sharedValidator.validateProcessedOutput()
        │   (schema check on final rows)
        ▼
Result object → UI renders summary, tables, download buttons
```

---

## Key Files Explained

### `useExcelProcessor.js`
Central state hub. Holds: file lists, selected shipping line, processing result, warnings, output errors, success/error messages. The `process()` async function runs the full pipeline, catches all errors, and exposes them as state for the UI.

**Important:** When shipping line is changed, all files and results are cleared to prevent cross-format confusion.

### `oneProcessor.js`
1. Builds Excel B set (normalized container keys)
2. For each file: collects internal duplicates, merges unique rows
3. Cross-file and Excel-B dedup on the merged set
4. Normalizes: status, cargoType, port codes
5. Rebuilds serial numbers
6. Runs output validation

### `mgiProcessor.js`
Same dedup logic but with extra steps:
- Row-level validation via `validateMGIRow()` before dedup (invalid rows go into `validationRemoved`)
- Weight conversion: if value ≤ 99.99 it's already MT; if > 99.99 divide by 1000 (kg → MT)
- Issues weight warnings (tare > 10 MT, gross > 50 MT) — shown in `ValidationWarningsPanel`
- Gross weight must be ≥ tare weight; violation removes the row
- Maps MGI columns to COPRAR columns, fills defaults (agentCode: "MGI", arrivalMode: "T", etc.)

### `containerUtils.js — normalizeContainer()`
```js
String(value).replace(/\s+/g, "").trim().toUpperCase()
```
Strips **all internal and trailing whitespace**, uppercases. Used as the dedup key for both processors and the Excel B lookup set. This ensures "MSCU 123456 7" and "MSCU1234567" deduplicate correctly.

### `sharedValidator.js — validateProcessedOutput()`
Post-normalization schema check on every output row:
- STATUS must be `F` or `E`
- FCL/LCL/EMPTY must be `FCL`, `LCL`, or `EMP`
- All port columns must end with `"1"` suffix
- Serial numbers must be sequential starting at 1

Violations are reported as `outputErrors` (warning, not blocking — download still works).

---

## Shipping Line Selector

Located in `FileUpload.jsx` as `ShippingLineSelector`. Uses MUI `ToggleButtonGroup` with `exclusive` mode:

```jsx
onChange={(_, v) => { if (v) onChange(v); }}
```

The `if (v)` guard prevents deselecting the current option (MUI returns `null` when clicking the already-active button). Changing the shipping line clears all files and results, ensuring no cross-format state leaks.

---

## Error Handling Summary

| Scenario | Handling |
|---|---|
| Wrong/missing Excel A columns | Throws `Error`, caught in `process()`, shown in error Snackbar (8 s auto-hide) |
| Excel B missing `CONT_NO` column | Same — throws and shows Snackbar |
| MGI row: invalid container format | Row moved to `validationRemoved` with reason; counts in stats |
| MGI row: bad weight, gross < tare | Row moved to `validationRemoved` |
| MGI row: unusual weight (>10 / >50 MT) | Warning added; shown in `ValidationWarningsPanel` |
| Post-normalization schema issues | Shown in inline `Alert` warning block in results section |
| Successful processing | Success Snackbar (5 s auto-hide) |

---

## Validation Layers

### Layer 1 — Header Validation (before processing)
- ONE: checks `REQUIRED_COLS_A` list against parsed headers
- MGI: checks `MGI_REQUIRED_COLS` list

### Layer 2 — Row Validation (MGI only, during processing)
`validateMGIRow()` checks each row for:
- Container number: present + matches `^[A-Z]{4}[0-9]{7}$`
- STATUS: must be F / E / FULL / EMPTY
- FCL/LCL: must be FCL / LCL / EMPTY / EMP
- ISO CODE, POL, POD: required (non-empty)

### Layer 3 — Output Validation (both, after normalization)
`validateProcessedOutput()` — described above.

---

## Duplicate & Space-Stripping Logic

**Deduplication key:** `normalizeContainer(row[containerNoColumn])`  
Removes all whitespace and uppercases before comparison — ensures spacing variants of the same container number are treated as identical.

**Three dedup passes:**
1. **Internal** — within each file, first occurrence wins
2. **Excel B** — skip any container found in the reference file
3. **Cross-file** — across all Excel A files, first occurrence wins

All three removed sets are merged into `removedDuplicates` and available for download with their `_reason` field.

---

## Technology Stack

| Tool | Version | Role |
|---|---|---|
| React | 19.2.6 | UI framework |
| MUI (Material UI) | 9.0.1 | Component library |
| Emotion | 11.x | CSS-in-JS for MUI |
| SheetJS (xlsx) | 0.18.5 | Excel/CSV parsing |
| file-saver | 2.0.5 | Client-side CSV download |
| Vite | 8.x | Build tool / dev server |
| ESLint | 10.x | Code linting |

---

## Running Locally

```bash
cd container-cleaner
npm install
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

---

## Known Limitations

- No backend — all processing is in-browser; large files (>50 k rows) may be slow
- Excel B must have a column named exactly `CONT_NO` (case-sensitive)
- MGI format assumes weight column headers `TARE WT` / `GROSS WT` are in kg when values exceed 99.99
- Preview table is capped at 200 rows (`PREVIEW_ROWS` constant) for performance
