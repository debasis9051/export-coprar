import { Box, Button, Card, CardContent, Divider, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function ActionButtons({
  canProcess,
  hasResult,
  isProcessing,
  onProcess,
  onDownloadProcessed,
  onDownloadRemoved,
  onReset,
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Tooltip
            title={!canProcess ? "Upload at least one Excel A file and one Excel B file first" : ""}
            placement="left"
          >
            <span>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={onProcess}
                disabled={!canProcess || isProcessing}
                sx={{ py: 1.5, fontSize: "1rem" }}
              >
                Process Files
              </Button>
            </span>
          </Tooltip>

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={onDownloadProcessed}
            disabled={!hasResult}
            sx={{ py: 1.2 }}
          >
            Download Processed File
          </Button>

          <Button
            variant="outlined"
            color="warning"
            fullWidth
            startIcon={<FileDownloadIcon />}
            onClick={onDownloadRemoved}
            disabled={!hasResult}
            sx={{ py: 1.2 }}
          >
            Download Removed Duplicates
          </Button>

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{ color: "text.secondary", borderColor: "divider" }}
          >
            Reset All
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
