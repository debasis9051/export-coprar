import { useState } from "react";
import {
  Box, Typography, Paper, Grid, Chip, Button, Collapse,
  IconButton, Alert, Snackbar, TableContainer, Table, TableBody,
  TableCell, TableHead, TableRow, Card, CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import { rowsToCsv, downloadCsv } from "../utils/csvUtils";

export default function ValidationWarningsPanel({ warnings }) {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [copyMsg, setCopyMsg] = useState(null);

  if (!warnings || warnings.length === 0) return null;

  const totalErrors = warnings.reduce((sum, w) => sum + w.errors.length, 0);
  const criticalCount = warnings.filter((w) =>
    w.errors.some((e) => e.includes("required") || e.includes("missing"))
  ).length;

  const toggleRow = (rowIndex) => {
    setExpandedRowId(expandedRowId === rowIndex ? null : rowIndex);
  };

  const handleDownloadWarnings = () => {
    const csvData = warnings.flatMap((w) =>
      w.errors.map((err) => ({
        "Row #": w.rowIndex,
        "Container No": w.containerNo,
        "Validation Error": err,
      }))
    );

    const csv = rowsToCsv(
      csvData,
      ["Row #", "Container No", "Validation Error"]
    );
    const filename = `validation_warnings_${new Date().getTime()}.csv`;
    downloadCsv(csv, filename);
    setCopyMsg("Warnings downloaded successfully!");
    setTimeout(() => setCopyMsg(null), 3000);
  };

  return (
    <Box mt={3} mb={3}>
      {/* Header Stats */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          border: "2px solid #ffb74d",
          borderRadius: 2.5,
          p: 2.5,
          mb: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: "#ff6f00",
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ color: "white", fontSize: "1.5rem" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.25 }}>
                Validation Warnings Found
              </Typography>
              <Box display="flex" gap={2}>
                <Typography variant="body2" sx={{ color: "#e65100", fontWeight: 600 }}>
                  {warnings.length} rows affected
                </Typography>
                <Typography variant="body2" sx={{ color: "#e65100", fontWeight: 600 }}>
                  {totalErrors} total errors
                </Typography>
                {criticalCount > 0 && (
                  <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 700 }}>
                    {criticalCount} critical
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadWarnings}
            sx={{ textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Download Report
          </Button>
        </Box>
      </Paper>

      {/* Compact Grid Table */}
      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "600px" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#424242" }}>
                <TableCell
                  sx={{
                    width: "50px",
                    bgcolor: "#424242",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
                <TableCell
                  sx={{
                    bgcolor: "#424242",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    minWidth: "80px",
                  }}
                >
                  Row #
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "#424242",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    minWidth: "140px",
                  }}
                >
                  Container
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "#424242",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    minWidth: "200px",
                  }}
                >
                  Error Type
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "#424242",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warnings.map((warning) => {
                const isExpanded = expandedRowId === warning.rowIndex;
                const errorTypes = warning.errors
                  .map((e) => {
                    if (e.includes("required") || e.includes("missing")) return "Missing/Required";
                    if (e.includes("valid")) return "Format Error";
                    if (e.includes("enum")) return "Invalid Value";
                    return "Validation Error";
                  })
                  .filter((v, i, a) => a.indexOf(v) === i);

                return (
                  <Box key={warning.rowIndex}>
                    {/* Main Row */}
                    <TableRow
                      onClick={() => toggleRow(warning.rowIndex)}
                      sx={{
                        bgcolor: isExpanded ? "#fff5f5" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "#fff5f5" },
                        borderBottom: isExpanded ? "none" : "1px solid #eeeeee",
                      }}
                    >
                      <TableCell sx={{ p: 1, textAlign: "center" }}>
                        <IconButton size="small">
                          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#d32f2f",
                          fontSize: "0.85rem",
                          py: 1.5,
                        }}
                      >
                        {warning.rowIndex}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", py: 1.5, color: "#333" }}>
                        <code
                          style={{
                            bgcolor: "#f5f5f5",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            display: "inline-block",
                          }}
                        >
                          {warning.containerNo}
                        </code>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                        <Box display="flex" gap={0.75} flexWrap="wrap">
                          {errorTypes.map((type) => (
                            <Chip
                              key={type}
                              label={type}
                              size="small"
                              icon={<ErrorIcon />}
                              color={
                                type === "Missing/Required"
                                  ? "error"
                                  : type === "Format Error"
                                  ? "warning"
                                  : "default"
                              }
                              variant="outlined"
                              sx={{ fontSize: "0.65rem", height: "22px" }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600, textAlign: "center", py: 1.5 }}>
                        <Chip
                          label={warning.errors.length}
                          size="small"
                          color="error"
                          sx={{ minWidth: "40px", fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details Row */}
                    <TableRow sx={{ bgcolor: "#fafafa", borderBottom: "1px solid #eeeeee" }}>
                      <TableCell colSpan={5} sx={{ p: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "#424242" }}>
                              Detailed Errors ({warning.errors.length})
                            </Typography>
                            <Grid container spacing={1}>
                              {warning.errors.map((error, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                  <Card
                                    variant="outlined"
                                    sx={{
                                      bgcolor: "#fff3e0",
                                      borderColor: "#ffb74d",
                                      borderRadius: 1,
                                      height: "100%",
                                    }}
                                  >
                                    <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
                                      <Box display="flex" gap={0.75} alignItems="flex-start">
                                        <ErrorIcon sx={{ color: "#ff6f00", fontSize: "1rem", mt: 0.25, flexShrink: 0 }} />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: "0.7rem",
                                            lineHeight: 1.4,
                                            color: "#333",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {error}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Box>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Guidance */}
      <Alert severity="info" sx={{ mt: 2 }} icon={<WarningIcon />}>
        <Typography variant="body2">
          <strong>Next Steps:</strong> Review the errors above, fix the source data in your Excel file, and re-upload
          for reprocessing. Or download the report for offline review.
        </Typography>
      </Alert>

      <Snackbar
        open={!!copyMsg}
        autoHideDuration={3000}
        onClose={() => setCopyMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">{copyMsg}</Alert>
      </Snackbar>
    </Box>
  );
}

