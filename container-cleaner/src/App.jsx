import { useState } from "react";
import { Box, Container, Grid, Snackbar, Alert, Typography, Link, Divider } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import { useExcelProcessor } from "./hooks/useExcelProcessor";
import NavBar from "./components/NavBar";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import ActionButtons from "./components/ActionButtons";
import ProcessingSummary from "./components/ProcessingSummary";
import ValidationTable from "./components/ValidationTable";
import ValidationWarningsPanel from "./components/ValidationWarningsPanel";
import LoadingOverlay from "./components/LoadingOverlay";

export default function App() {
  const [themeMode, setThemeMode] = useState("light");
  const appTheme = createAppTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const {
    excelAFiles,
    excelBFile,
    shippingLine,
    setShippingLine,
    isProcessing,
    result,
    warnings,
    outputErrors,
    error,
    successMsg,
    canProcess,
    addExcelAFile,
    removeExcelAFile,
    setExcelB,
    process,
    downloadProcessed,
    downloadRemoved,
    reset,
    setError,
    setSuccessMsg,
  } = useExcelProcessor();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <NavBar themeMode={themeMode} setThemeMode={setThemeMode} />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3 }}>
        <Container maxWidth="xl">
          <Header
            excelACount={excelAFiles.length}
            excelBReady={!!excelBFile}
            processed={!!result}
            themeMode={themeMode}
            onToggleTheme={toggleTheme}
          />
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={9}>
              <FileUpload
                excelAFiles={excelAFiles}
                excelBFile={excelBFile}
                onAddA={addExcelAFile}
                onRemoveA={removeExcelAFile}
                onSetB={setExcelB}
                shippingLine={shippingLine}
                onShippingLineChange={setShippingLine}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <ActionButtons
                canProcess={canProcess}
                hasResult={!!result}
                isProcessing={isProcessing}
                onProcess={process}
                onDownloadProcessed={downloadProcessed}
                onDownloadRemoved={downloadRemoved}
                onReset={reset}
              />
            </Grid>
          </Grid>
          {result && (
            <>
              <ProcessingSummary stats={result.stats} outputErrors={outputErrors} />
              {warnings && warnings.length > 0 && (
                <ValidationWarningsPanel warnings={warnings} />
              )}
              {outputErrors && outputErrors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    ⚠️ Output Validation Issues ({outputErrors.length} rows)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    The following rows in the processed output do not match the required schema. You can still download, but please verify:
                  </Typography>
                  <Box sx={{ bgcolor: "rgba(0,0,0,0.05)", p: 1.5, borderRadius: 1, maxHeight: "300px", overflowY: "auto" }}>
                    {outputErrors.slice(0, 10).map((err, idx) => (
                      <Typography key={idx} variant="caption" component="div" sx={{ mb: 0.75, fontFamily: "monospace", fontSize: "0.7rem" }}>
                        <strong>Row {err.rowIndex}:</strong> {err.errors[0]}
                      </Typography>
                    ))}
                    {outputErrors.length > 10 && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                        ... and {outputErrors.length - 10} more
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}
              <ValidationTable
                title="Processed Output Preview"
                rows={result.processedRows}
                headers={result.headers}
                showReason={false}
              />
              <ValidationTable
                title="Removed Duplicates Preview"
                rows={result.removedDuplicates}
                headers={result.headers}
                showReason={true}
              />
            </>
          )}

          {/* ── Footer ── */}
          <Box
            component="footer"
            sx={{
              mt: 5,
              py: 2.5,
              px: 3,
              background:
                themeMode === 'light'
                  ? 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)'
                  : 'linear-gradient(135deg, #5D1818 0%, #7D2525 100%)',
              borderRadius: 3,
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95 }}>
              Export COPRAR NORMALIZATION
            </Typography>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.20)", my: 1 }} />
            <Typography variant="caption" sx={{ opacity: 0.80 }}>
              Developed by{" "}
              <Link
                href="https://debasishdebnath.in"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "white", fontWeight: 700 }}
              >
                Debasish Debnath (E-3015)
              </Link>
              {" "}·{" "}
              <Link
                href="https://debasishdebnath.in"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                debasishdebnath.in
              </Link>
              {" "}·{" "}
              <Link
                href="mailto:support@debasishdebnath.in"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                support@debasishdebnath.in
              </Link>
            </Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.55, mt: 0.5 }}>
              © {new Date().getFullYear()} · All rights reserved · v1.0.0
              {" "}·{" "}Released:{" "}
              {new Date(__BUILD_DATE__).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </Typography>
          </Box>
        </Container>
      </Box>
      <LoadingOverlay open={isProcessing} />
      <Snackbar
        open={!!successMsg}
        autoHideDuration={5000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
