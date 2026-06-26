import React from "react";
import { AppBar, Toolbar, Box, Button, useTheme, Tooltip, Chip, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logoImg from "../assets/CenturyPorts_logo-2.png";

// EXACT MENU CONFIGURATION - Easy to modify for other apps
const MENU_ITEMS = [
  {
    label: "IGM-JSON Converter",
    url: "https://igm-json.web.app/",
    icon: ArticleIcon,
    tooltip: "Convert IGM to JSON and vice versa - Developed by Debasish Debnath (3015)",
    external: false,
  },
  {
    label: "Bapalie Viewer",
    url: "https://baplie-viewer.web.app/",
    icon: ViewComfyIcon,
    tooltip: "BAPLIE (Bayplan with Hatch Sequence) Manifest Viewer",
    external: false,
  },
  {
    label: "IGM Viewer & Generator",
    url: "https://igm-viewer-generator.web.app/",
    icon: SwapHorizIcon,
    tooltip: "View and Generate IGM manifests with advanced features",
    external: false,
  },
  {
    label: "Export Coprar",
    url: "https://exportcoprar.debasishdebnath.in/",
    icon: FileDownloadIcon,
    tooltip: "Export cargo manifests and reports - Port Operations Tool",
    external: true,
    highlighted: true, // Special styling with border
  },
];

export default function NavBar({ themeMode, setThemeMode }) {
  const theme = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // PWA install logic
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstall, setShowInstall] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  // Logo
  const logo = (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <a href="https://igm-json.web.app/" style={{ display: 'inline-block' }}>
        <Box
          component="img"
          src={logoImg}
          alt="CenturyPorts Logo"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain',
            boxShadow: theme.palette.mode === 'dark' ? 3 : 1,
            bgcolor: '#fff',
            borderRadius: 1,
            padding: '2px',
          }}
        />
      </a>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: 1201,
        background: theme.palette.mode === 'dark' ? '#ED1C24' : theme.palette.primary.main,
        color: '#fff',
        borderBottom: theme.palette.mode === 'dark' ? '2px solid #fff' : '2px solid #ED1C24',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 0.5, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 0.25, sm: 1 },
        }}
      >
        {logo}

        {/* MENU ITEMS - Hidden on xs, shown on sm+ */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
            justifyContent: 'center',
          }}
        >
          {MENU_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            const isHighlighted = item.highlighted;

            return (
              <Tooltip key={idx} title={item.tooltip} arrow>
                <Button
                  component="a"
                  href={item.url}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  color="inherit"
                  startIcon={<IconComponent sx={{ fontSize: '1.2rem' }} />}
                  sx={{
                    fontWeight: isHighlighted ? 700 : 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    px: 1,
                    py: 0.6,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ...(isHighlighted && {
                      borderRadius: 1.5,
                      border: '2px solid rgba(255,255,255,0.4)',
                      '&:hover': {
                        border: '2px solid rgba(255,255,255,0.9)',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      },
                    }),
                    ...(!isHighlighted && {
                      '&:hover': { opacity: 0.85 },
                    }),
                  }}
                >
                  {item.label}
                </Button>
              </Tooltip>
            );
          })}
        </Box>

        {/* DEVELOPER BADGE - hidden on xs */}
        <Tooltip title="Debasish Debnath (3015) - Port Operations & Data Solutions" arrow>
          <Chip
            label="By Debasish (3015)"
            size="small"
            variant="outlined"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#fff',
                bgcolor: 'rgba(255,255,255,0.15)',
              },
              mx: { sm: 1 },
            }}
          />
        </Tooltip>

        {/* INSTALL BUTTON - hidden on xs */}
        {showInstall && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mx: 1 }}>
            <Button
              onClick={handleInstallClick}
              variant="contained"
              color="inherit"
              sx={{
                bgcolor: '#fff',
                color: '#ED1C24',
                fontWeight: 700,
                boxShadow: 2,
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                minWidth: 0,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              Install
            </Button>
          </Box>
        )}

        {/* THEME TOGGLE */}
        <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`} arrow>
          <IconButton
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            color="inherit"
            sx={{
              mx: { xs: 0.25, sm: 0.5 },
              minWidth: 0,
              background: theme.palette.mode === 'dark' ? '#FFA500' : '#f0f0f0',
              color: '#000',
              borderRadius: { xs: '8px', sm: '20px' },
              padding: { xs: '6px', sm: '8px 16px' },
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1rem' },
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0, sm: 0.5 },
              '&:hover': {
                background: theme.palette.mode === 'dark' ? '#FFC04D' : '#e0e0e0',
              },
            }}
            aria-label="Toggle dark/light mode"
          >
            {themeMode === 'dark' ? (
              <>
                <span>🌞</span>
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Light</Box>
              </>
            ) : (
              <>
                <span>🌜</span>
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Dark</Box>
              </>
            )}
          </IconButton>
        </Tooltip>

        {/* HAMBURGER MENU - Only on xs */}
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          color="inherit"
          sx={{
            display: { xs: 'flex', sm: 'none' },
            ml: 0.5,
          }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* MOBILE DRAWER MENU */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#f5f5f5',
            width: 280,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#ED1C24' : theme.palette.primary.main,
            color: '#fff',
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Menu
          </Typography>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            color="inherit"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 2 }}>
          {MENU_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            const isHighlighted = item.highlighted;

            return (
              <ListItem
                key={idx}
                component="a"
                href={item.url}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  ...(isHighlighted && {
                    bgcolor: 'rgba(237, 28, 36, 0.1)',
                    borderLeft: '4px solid #ED1C24',
                    fontWeight: 700,
                  }),
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                  },
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isHighlighted ? '#ED1C24' : 'inherit' }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isHighlighted ? 700 : 600,
                    fontSize: '0.95rem',
                  }}
                  secondary={item.tooltip}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ p: 2 }}>
          <Tooltip title="Debasish Debnath (3015) - Port Operations & Data Solutions" arrow>
            <Chip
              label="By Debasish (3015)"
              size="small"
              variant="outlined"
              fullWidth
              sx={{
                mb: 2,
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            />
          </Tooltip>

          {showInstall && (
            <Button
              onClick={() => {
                handleInstallClick();
                setMobileMenuOpen(false);
              }}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#ED1C24',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                mb: 1,
              }}
            >
              Install App
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
