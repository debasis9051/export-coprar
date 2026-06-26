import { useState, useCallback } from "react";
import { readExcelA, readExcelB } from "../services/excelReader";
import { exportProcessedFile, exportRemovedDuplicates } from "../services/exporter";
import { validateExcelB } from "../services/validators";
import { getProcessor } from "../services/processors/processorFactory";
import { getExcelAValidator } from "../services/validators/validatorFactory";
import { SHIPPING_LINES } from "../utils/mgiConstants";

export const useExcelProcessor = () => {
  const [excelAFiles, setExcelAFiles] = useState([]);
  const [excelBFile, setExcelBFile] = useState(null);
  const [shippingLine, setShippingLine] = useState(SHIPPING_LINES.ONE);
  const [isProcessing, setIsProcessing] = useState(false);

  const changeShippingLine = useCallback((line) => {
    setShippingLine(line);
    setExcelAFiles([]);
    setExcelBFile(null);
    setResult(null);
    setWarnings(null);
    setOutputErrors(null);
    setError(null);
    setSuccessMsg(null);
  }, []);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState(null);
  const [outputErrors, setOutputErrors] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const addExcelAFile = useCallback((file) => {
    setExcelAFiles((prev) => [...prev, file]);
    setResult(null);
  }, []);

  const removeExcelAFile = useCallback((index) => {
    setExcelAFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
    setWarnings(null);
    setOutputErrors(null);
  }, []);

  const setExcelB = useCallback((file) => {
    setExcelBFile(file);
    setResult(null);
    setWarnings(null);
    setOutputErrors(null);
  }, []);

  const process = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    setWarnings(null);
    setOutputErrors(null);

    try {
      // Read all Excel A files in parallel
      const allExcelAData = await Promise.all(excelAFiles.map(readExcelA));

      // Validate each Excel A using the correct validator for the selected shipping line
      const validateExcelA = getExcelAValidator(shippingLine);
      for (const { headers, fileName } of allExcelAData) {
        const { valid, missing } = validateExcelA(headers);
        if (!valid) {
          throw new Error(
            `"${fileName}" is missing required columns:\n${missing.join("\n")}`
          );
        }
      }

      // Read & validate Excel B (optional)
      let excelBData = { rows: [], headers: {} };
      if (excelBFile) {
        excelBData = await readExcelB(excelBFile);
        const { valid: bValid, missing: bMissing } = validateExcelB(excelBData.headers);
        if (!bValid) {
          throw new Error(`Excel B is missing required column: ${bMissing.join(", ")}`);
        }
      }

      // Run pipeline using the correct processor for the selected shipping line
      const processExcelA = getProcessor(shippingLine);
      const processed = processExcelA(allExcelAData, excelBData.rows);
      const headers = processed.headers || allExcelAData[0].headers;

      // ── Set output errors if any (informational, not blocking) ──────────
      if (processed.outputErrors && processed.outputErrors.length > 0) {
        setOutputErrors(processed.outputErrors);
      }

      // ── Set row-level warnings (e.g. unusual weights for MGI) ────────────
      if (processed.warnings && processed.warnings.length > 0) {
        setWarnings(processed.warnings);
      }

      setResult({
        ...processed,
        headers,
        fileNames: excelAFiles.map((f) => f.name),
      });

      // Set success message
      if (processed.outputErrors && processed.outputErrors.length > 0) {
        setSuccessMsg(
          `✓ Processing completed. ${processed.outputErrors.length} row(s) have output validation issues (see below).`
        );
      } else {
        setSuccessMsg("✓ Processing completed successfully!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [excelAFiles, excelBFile, shippingLine]);

  const downloadProcessed = useCallback(() => {
    if (!result) return;
    exportProcessedFile(result.processedRows, result.headers, result.fileNames);
  }, [result]);

  const downloadRemoved = useCallback(() => {
    if (!result) return;
    exportRemovedDuplicates(result.removedDuplicates, result.headers, result.fileNames);
  }, [result]);

  const reset = useCallback(() => {
    setExcelAFiles([]);
    setExcelBFile(null);
    setResult(null);
    setWarnings(null);
    setOutputErrors(null);
    setError(null);
    setSuccessMsg(null);
  }, []);

  return {
    excelAFiles,
    excelBFile,
    shippingLine,
    setShippingLine: changeShippingLine,
    isProcessing,
    result,
    warnings,
    outputErrors,
    error,
    successMsg,
    canProcess: excelAFiles.length > 0,
    addExcelAFile,
    removeExcelAFile,
    setExcelB,
    process,
    downloadProcessed,
    downloadRemoved,
    reset,
    setError,
    setSuccessMsg,
  };
};
