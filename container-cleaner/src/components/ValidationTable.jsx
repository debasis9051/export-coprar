import { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Snackbar, Alert,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { PREVIEW_ROWS } from "../utils/constants";
import { rowsToCsv, copyToClipboard, downloadCsv, sanitizeFilename } from "../utils/csvUtils";

const REASON_COLOR = {
  "Internal duplicate":  "warning",
  "Found in Excel B":    "error",
  "Cross-file duplicate": "secondary",
};

export default function ValidationTable({ title, rows, headers, showReason = false }) {
  const [copyMsg, setCopyMsg] = useState(null);

  if (!rows || rows.length === 0) return null;

  const displayRows  = rows.slice(0, PREVIEW_ROWS);
  const cleanHeaders = headers.filter((h) => !h.startsWith("_"));
  const allCols      = showReason ? [...cleanHeaders, "Reason", "Source File"] : cleanHeaders;

  // Prepare data for CSV (all rows, not just preview)
  const csvData = rows.map((row) => {
    const obj = {};
    allCols.forEach((col) => {
      if (col === "Reason") {
        obj[col] = row._reason ?? "";
      } else if (col === "Source File") {
        obj[col] = row._sourceFile ?? "";
      } else {
        obj[col] = row[col] ?? "";
      }
    });
    return obj;
  });

  const handleCopy = async () => {
    const csv = rowsToCsv(csvData, allCols);
    const success = await copyToClipboard(csv);
    if (success) {
      setCopyMsg(`${csvData.length} rows copied to clipboard!`);
      setTimeout(() => setCopyMsg(null), 3000);
    }
  };

  const handleDownload = () => {
    const csv = rowsToCsv(csvData, allCols);
    const filename = `${sanitizeFilename(title)}_${new Date().getTime()}.csv`;
    downloadCsv(csv, filename);
  };

  return (
    <Box mt={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5} mb={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Chip
            label={
              rows.length > PREVIEW_ROWS
                ? `${rows.length.toLocaleString()} rows (showing first ${PREVIEW_ROWS})`
                : `${rows.length.toLocaleString()} rows`
            }
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileCopyIcon />}
            onClick={handleCopy}
            sx={{ fontSize: "0.75rem" }}
          >
            Copy All
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ fontSize: "0.75rem" }}
          >
            Download CSV
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {allCols.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      bgcolor: "primary.dark",
                      color: "white",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      fontSize: "0.70rem",
                      py: 1.2,
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {displayRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "rgba(211,47,47,0.03)" },
                    "&:hover":            { bgcolor: "rgba(211,47,47,0.07)" },
                  }}
                >
                  {allCols.map((col) => {
                    if (col === "Reason") {
                      const reason = row._reason ?? "";
                      return (
                        <TableCell key={col} sx={{ whiteSpace: "nowrap" }}>
                          <Chip
                            label={reason}
                            size="small"
                            color={REASON_COLOR[reason] ?? "default"}
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                        </TableCell>
                      );
                    }
                    if (col === "Source File") {
                      return (
                        <TableCell
                          key={col}
                          sx={{ whiteSpace: "nowrap", fontSize: "0.72rem", color: "text.secondary" }}
                        >
                          {row._sourceFile ?? ""}
                        </TableCell>
                      );
                    }
                    const val = row[col];
                    return (
                      <TableCell key={col} sx={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                        {val === null || val === undefined ? "" : String(val)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Snackbar
        open={!!copyMsg}
        autoHideDuration={3000}
        onClose={() => setCopyMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setCopyMsg(null)} sx={{ width: "100%" }}>
          {copyMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
