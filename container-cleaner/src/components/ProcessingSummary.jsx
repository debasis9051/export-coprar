import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CheckCircleOutlineIcon from "@mui/icons-material/TaskAlt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LayersIcon from "@mui/icons-material/Layers";
import WarningIcon from "@mui/icons-material/Warning";

const PALETTE = {
  primary:   { bg: "rgba(21,101,192,0.10)",  text: "#1565C0" },
  info:      { bg: "rgba(2,119,189,0.10)",   text: "#0277BD" },
  warning:   { bg: "rgba(245,127,23,0.12)",  text: "#F57F17" },
  error:     { bg: "rgba(198,40,40,0.10)",   text: "#C62828" },
  secondary: { bg: "rgba(230,81,0,0.10)",    text: "#E65100" },
  success:   { bg: "rgba(46,125,50,0.10)",   text: "#2E7D32" },
};

function StatCard({ title, value, subtitle, icon, color = "primary" }) {
  const pal = PALETTE[color] ?? PALETTE.primary;
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              lineHeight={1.2}
              my={0.5}
              sx={{ color: pal.text }}
            >
              {Number(value).toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: pal.bg,
              color: pal.text,
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ProcessingSummary({ stats, outputErrors }) {
  if (!stats) return null;

  const outputErrorCount = outputErrors ? outputErrors.length : 0;

  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Processing Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Total Input Rows"
            value={stats.totalInputRows}
            icon={<FileCopyIcon />}
            color="primary"
            subtitle="All Excel A rows"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Excel B Rows"
            value={stats.excelBRows}
            icon={<LayersIcon />}
            color="info"
            subtitle="Reference containers"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Internal Dups"
            value={stats.internalDuplicatesRemoved}
            icon={<ContentCopyIcon />}
            color="warning"
            subtitle="Within each A file"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Removed vs B"
            value={stats.removedByExcelB}
            icon={<DeleteSweepIcon />}
            color="error"
            subtitle="Found in Excel B"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Cross-file Dups"
            value={stats.crossFileDuplicates}
            icon={<CompareArrowsIcon />}
            color="secondary"
            subtitle="Across A files"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Final Output"
            value={stats.finalRows}
            icon={<CheckCircleOutlineIcon />}
            color="success"
            subtitle="Unique clean rows"
          />
        </Grid>

        {/* Output Validation Issues Card */}
        {outputErrorCount > 0 && (
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Output Issues"
              value={outputErrorCount}
              icon={<WarningIcon />}
              color="warning"
              subtitle="See details below"
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
