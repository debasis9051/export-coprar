import { createTheme } from "@mui/material/styles";

/**
 * Factory function to create theme with red primary colors.
 * Supports both light and dark modes.
 */
export const createAppTheme = (mode = "light") => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#D32F2F",
        dark: "#B71C1C",
        light: "#E57373",
      },
      secondary: {
        main: "#F57C00",
        dark: "#E65100",
      },
      success: {
        main: "#2E7D32",
        light: "#43A047",
      },
      warning: {
        main: "#F57F17",
        light: "#FBC02D",
      },
      error: {
        main: "#C62828",
      },
      info: {
        main: "#1976D2",
        light: "#1E88E5",
      },
      background: {
        default: isLight ? "#F5F5F5" : "#121212",
        paper: isLight ? "#FFFFFF" : "#1E1E1E",
      },
      text: {
        primary: isLight ? "#1A202C" : "#FFFFFF",
        secondary: isLight ? "#4A5568" : "#B0B0B0",
      },
      divider: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: "-0.5px" },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? "0 2px 12px rgba(0,0,0,0.07)"
              : "0 2px 12px rgba(0,0,0,0.3)",
            border: isLight
              ? "1px solid rgba(0,0,0,0.07)"
              : "1px solid rgba(255,255,255,0.10)",
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, padding: "8px 20px" },
          containedPrimary: {
            background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #E53935 0%, #D32F2F 100%)",
            },
          },
          containedSuccess: {
            background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
            },
          },
          outlined: isLight
            ? {}
            : {
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { padding: "6px 10px" },
          head: {
            backgroundColor: isLight ? "#D32F2F" : "#B71C1C",
            color: "#FFFFFF",
            fontWeight: 700,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: isLight ? "none" : "none",
          },
        },
      },
    },
  });
};

// Default light theme
const theme = createAppTheme("light");

export default theme;
