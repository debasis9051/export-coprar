import { Box, Typography, Chip, Paper, Divider, IconButton, Tooltip } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Header({ excelACount, excelBReady, processed, themeMode = "light", onToggleTheme }) {
  return (
    <Paper
      elevation={0}
      sx={{
        background:
          themeMode === "light"
            ? "linear-gradient(135deg, #B71C1C 0%, #D32F2F 55%, #E53935 100%)"
            : "linear-gradient(135deg, #5D1818 0%, #7D2525 55%, #9C3131 100%)",
        borderRadius: 3,
        p: { xs: 3, md: 4 },
        mb: 3,
        color: "white",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={1}>
        <Box display="flex" alignItems="center" gap={2}>
          <LocalShippingIcon sx={{ fontSize: 48, opacity: 0.9 }} />
          <Box>
            <Typography variant="h4" fontWeight={700} lineHeight={1.1} letterSpacing="-0.5px">
              Export COPRAR NORMALIZATION
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.82, mt: 0.5 }}>
              Container Deduplication · Data Normalization · CSV Export — fully in-browser
            </Typography>
          </Box>
        </Box>
        <Tooltip title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}>
          <IconButton
            onClick={onToggleTheme}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            {themeMode === "light" ? (
              <DarkModeIcon />
            ) : (
              <LightModeIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.20)", my: 1.5 }} />
      <Typography variant="caption" sx={{ opacity: 0.65, letterSpacing: 0.5 }}>
        Upload Excel A operational files + Excel B reference file → process → download clean CSV output
      </Typography>

      <Box display="flex" gap={1} mt={2.5} flexWrap="wrap">
        <Chip
          label={`Excel A: ${excelACount} file${excelACount !== 1 ? "s" : ""} loaded`}
          size="small"
          sx={{
            bgcolor: excelACount > 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)",
            color: "white",
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        />
        <Chip
          label={excelBReady ? "Excel B: Ready" : "Excel B: Not uploaded"}
          size="small"
          sx={{
            bgcolor: excelBReady ? "rgba(46,125,50,0.50)" : "rgba(255,255,255,0.10)",
            color: "white",
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        />
        {processed && (
          <Chip
            label="✓ Processing Complete"
            size="small"
            sx={{
              bgcolor: "rgba(46,125,50,0.55)",
              color: "white",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.28)",
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
