'use client';
import { createTheme, alpha } from '@mui/material/styles';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND_BLUE   = '#2563EB';
const BRAND_PURPLE = '#7C3AED';

const LIGHT = {
  bg:         '#f6f8fc',
  paper:      '#ffffff',
  paperAlt:   '#f8fafc',
  border:     '#e5e7eb',
  borderFocus:'#94a3b8',
  textPri:    '#0f172a',
  textSec:    '#64748b',
  textMuted:  '#94a3b8',
  inputBg:    '#ffffff',
  hoverBg:    '#f1f5f9',
  rowHover:   '#f8fafd',
  tableHead:  '#f8fafc',
  divider:    '#e8ecf0',
};

const DARK = {
  bg:         '#0f1623',
  paper:      '#1a2236',
  paperAlt:   '#151e2e',
  border:     '#2a3448',
  borderFocus:'#475569',
  textPri:    '#f1f5f9',
  textSec:    '#94a3b8',
  textMuted:  '#64748b',
  inputBg:    '#1e2a3a',
  hoverBg:    '#1e2a3a',
  rowHover:   '#1e2a3a',
  tableHead:  '#151e2e',
  divider:    '#2a3448',
};

export function createAppTheme(mode: 'light' | 'dark' = 'light') {
  const isDark = mode === 'dark';
  const t = isDark ? DARK : LIGHT;

  return createTheme({
    palette: {
      mode,
      primary:    { main: BRAND_BLUE,   light: '#60a5fa', dark: '#1d4ed8' },
      secondary:  { main: BRAND_PURPLE, light: '#a78bfa', dark: '#6d28d9' },
      background: { default: t.bg, paper: t.paper },
      text:       { primary: t.textPri, secondary: t.textSec, disabled: t.textMuted },
      divider:    t.divider,
      success:    { main: '#22c55e' },
      warning:    { main: '#f59e0b' },
      error:      { main: '#ef4444' },
      info:       { main: '#0ea5e9' },
      action: {
        hover:          isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        selected:       isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
        disabled:       isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.26)',
        disabledBackground: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      },
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, color: t.textPri },
      h5: { fontWeight: 700, color: t.textPri },
      h6: { fontWeight: 700, color: t.textPri },
    },

    shape: { borderRadius: 12 },

    components: {
      // ── App-wide baseline ─────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.bg,
            color: t.textPri,
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#2a3448 #0f1623' : '#cbd5e1 #f1f5f9',
            '&::-webkit-scrollbar': { width: 8, height: 8 },
            '&::-webkit-scrollbar-track': { background: isDark ? '#0f1623' : '#f1f5f9' },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#2a3448' : '#cbd5e1',
              borderRadius: 4,
            },
          },
        },
      },

      // ── AppBar / Header ───────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: t.paper,
            color: t.textPri,
            borderBottom: `1px solid ${t.divider}`,
            boxShadow: isDark
              ? '0 1px 8px rgba(0,0,0,0.35)'
              : '0 1px 8px rgba(0,0,0,0.05)',
          },
        },
      },

      // ── Sidebar / Drawer ──────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            // Sidebar keeps its dark gradient identity regardless of theme
            backgroundColor: '#080d1a',
            backgroundImage: 'none',
            color: '#ffffff',
            borderRight: 'none',
          },
        },
      },

      // ── Paper ─────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.paper,
            borderRadius: 16,
          },
        },
      },

      // ── Card ──────────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.paper,
            borderRadius: 16,
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.45)'
              : '0 4px 24px rgba(0,0,0,0.07)',
          },
        },
      },

      // ── Text fields / Inputs ──────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: t.inputBg,
            color: t.textPri,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: t.border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: t.borderFocus,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND_BLUE,
            },
            '&.Mui-disabled': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            },
          },
          input: {
            color: t.textPri,
            '&::placeholder': {
              color: t.textMuted,
              opacity: 1,
            },
            '&::-webkit-calendar-picker-indicator': {
              filter: isDark ? 'invert(1)' : 'none',
              opacity: 0.6,
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: t.textSec,
            '&.Mui-focused': { color: BRAND_BLUE },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: { color: t.textPri },
          input: {
            color: t.textPri,
            '&::placeholder': { color: t.textMuted, opacity: 1 },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: { color: t.textSec },
        },
      },

      // ── Select ────────────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          icon: { color: t.textSec },
        },
      },

      // ── Autocomplete ──────────────────────────────────────────────────────
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: t.paper,
            border: `1px solid ${t.border}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.12)',
          },
          option: {
            color: t.textPri,
            '&[aria-selected="true"]': {
              backgroundColor: alpha(BRAND_BLUE, 0.12),
            },
            '&.Mui-focused': {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
            },
          },
          noOptions: { color: t.textSec },
          clearIndicator: { color: t.textSec },
          popupIndicator: { color: t.textSec },
        },
      },

      // ── Menu / Dropdown ───────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: t.paper,
            border: `1px solid ${t.border}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 24px rgba(0,0,0,0.10)',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: t.textPri,
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: alpha(BRAND_BLUE, 0.12),
              '&:hover': { backgroundColor: alpha(BRAND_BLUE, 0.18) },
            },
          },
        },
      },

      // ── Button ────────────────────────────────────────────────────────────
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
          outlined: {
            borderColor: t.border,
            color: t.textPri,
            '&:hover': {
              borderColor: t.borderFocus,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.04)',
            },
          },
          text: { color: t.textPri },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: { color: t.textSec },
        },
      },

      // ── Divider ───────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.divider },
        },
      },

      // ── Chip ──────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
            color: t.textPri,
          },
        },
      },

      // ── Tooltip ───────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#2a3448' : '#1e293b',
            color: '#f1f5f9',
            fontSize: 12,
            borderRadius: 8,
          },
          arrow: { color: isDark ? '#2a3448' : '#1e293b' },
        },
      },

      // ── Dialog ────────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: t.paper,
            backgroundImage: 'none',
            border: isDark ? `1px solid ${t.border}` : 'none',
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.6)'
              : '0 24px 64px rgba(0,0,0,0.15)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { color: t.textPri },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { color: t.textPri },
        },
      },

      // ── Table ─────────────────────────────────────────────────────────────
      MuiTable: {
        styleOverrides: {
          root: { backgroundColor: t.paper },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: { backgroundColor: t.tableHead },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: t.rowHover,
            },
          },
          head: {
            backgroundColor: t.tableHead,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            color: t.textPri,
            borderColor: t.divider,
          },
          head: {
            color: t.textMuted,
            backgroundColor: t.tableHead,
            fontWeight: 700,
            borderColor: t.divider,
          },
        },
      },

      // ── Tabs ──────────────────────────────────────────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            color: t.textSec,
            '&.Mui-selected': { color: BRAND_BLUE },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: BRAND_BLUE },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
          standardError: {
            backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : undefined,
            color: isDark ? '#fca5a5' : undefined,
          },
        },
      },

      // ── Switch ────────────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          track: {
            backgroundColor: isDark ? '#374151' : undefined,
          },
        },
      },

      // ── Linear progress ───────────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#2a3448' : '#f1f5f9',
          },
        },
      },

      // ── Circular progress ─────────────────────────────────────────────────
      MuiCircularProgress: {
        defaultProps: { color: 'primary' },
      },

      // ── Snackbar ──────────────────────────────────────────────────────────
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#2a3448' : '#1e293b',
            color: '#f1f5f9',
          },
        },
      },

      // ── Pagination ────────────────────────────────────────────────────────
      MuiTablePagination: {
        styleOverrides: {
          root: { color: t.textSec },
          select: { color: t.textPri },
          selectIcon: { color: t.textSec },
          displayedRows: { color: t.textSec },
          actions: { color: t.textSec },
        },
      },

      // ── Backdrop ──────────────────────────────────────────────────────────
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(0,0,0,0.75)'
              : 'rgba(0,0,0,0.5)',
          },
        },
      },
    },
  });
}

const theme = createAppTheme();
export default theme;
