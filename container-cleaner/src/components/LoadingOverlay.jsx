import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";

export default function LoadingOverlay({ open }) {
  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress color="inherit" size={56} thickness={4} />
      <Typography variant="h6" fontWeight={600}>
        Processing files…
      </Typography>
    </Backdrop>
  );
}
