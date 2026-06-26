import {
  Card, CardContent, CardHeader, Box, Button, Typography,
  IconButton, Tooltip, Divider, List, ListItem, ListItemText,
  ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TableViewIcon from "@mui/icons-material/TableView";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import { SHIPPING_LINES } from "../utils/mgiConstants";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
};

// ── Excel A Upload ──────────────────────────────────────────────────────────
function ExcelAUpload({ files, onAdd, onRemove }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onAdd(file);
    e.target.value = "";
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={<TableViewIcon color="primary" />}
        title="Excel A — Operational Files"
        subheader="Main data files to process (XLSX / CSV, one or more)"
        titleTypographyProps={{ fontWeight: 600, variant: "subtitle1" }}
      />
      <Divider />
      <CardContent>
        {files.length === 0 ? (
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "primary.light",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 2,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: "primary.light", mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              No files added yet
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ mb: 1.5 }}>
            {files.map((file, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <Tooltip title="Remove file">
                    <IconButton edge="end" size="small" onClick={() => onRemove(idx)} color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  bgcolor: "rgba(46,125,50,0.07)",
                  border: "1px solid",
                  borderColor: "success.light",
                  borderRadius: 1.5,
                  mb: 0.75,
                  pr: 6,
                }}
              >
                <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 18, flexShrink: 0 }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatBytes(file.size)}
                  primaryTypographyProps={{ variant: "body2", fontWeight: 600, noWrap: true }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Button
          component="label"
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          fullWidth
        >
          Add Excel A File
          <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleChange} />
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Excel B Upload ──────────────────────────────────────────────────────────
function ExcelBUpload({ file, onSet }) {
  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onSet(f);
    e.target.value = "";
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        avatar={<UploadFileIcon color="secondary" />}
        title="Excel B — Reference File"
        subheader="Duplicate container lookup (CSV / XLSX) — Optional: Skip if not checking duplicates"
        titleTypographyProps={{ fontWeight: 600, variant: "subtitle1" }}
      />
      <Divider />
      <CardContent>
        {file ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "rgba(46,125,50,0.07)",
              border: "1px solid",
              borderColor: "success.light",
              borderRadius: 1.5,
              p: 1.5,
              mb: 2,
            }}
          >
            <CheckCircleIcon color="success" sx={{ flexShrink: 0 }} />
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(file.size)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "secondary.light",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 2,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: "secondary.light", mb: 1 }} />
            <Typography color="text.secondary" variant="body2">
              No file uploaded yet
            </Typography>
          </Box>
        )}

        <Button
          component="label"
          variant="outlined"
          color="secondary"
          startIcon={<UploadFileIcon />}
          fullWidth
        >
          {file ? "Replace Excel B File" : "Upload Excel B File"}
          <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleChange} />
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Shipping Line Selector ──────────────────────────────────────────────────
function ShippingLineSelector({ value, onChange }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsBoatIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              Shipping Line
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, v) => { if (v) onChange(v); }}
            size="small"
            color="primary"
          >
            <ToggleButton value={SHIPPING_LINES.ONE} sx={{ fontWeight: 700, px: 3 }}>
              ONE
            </ToggleButton>
            <ToggleButton value={SHIPPING_LINES.MGI} sx={{ fontWeight: 700, px: 3 }}>
              MGI
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary">
            {value === SHIPPING_LINES.ONE
              ? "Standard ONE COPRAR format (Excel A template)"
              : "MGI format — auto-converts columns to COPRAR standard"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Public Component ────────────────────────────────────────────────────────
export default function FileUpload({ excelAFiles, excelBFile, onAddA, onRemoveA, onSetB, shippingLine, onShippingLineChange }) {
  return (
    <Box>
      <ShippingLineSelector value={shippingLine} onChange={onShippingLineChange} />
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={2}
        alignItems="stretch"
      >
        <ExcelAUpload files={excelAFiles} onAdd={onAddA} onRemove={onRemoveA} />
        <ExcelBUpload file={excelBFile} onSet={onSetB} />
      </Box>
    </Box>
  );
}
