'use client';
import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark' = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#60a5fa' : '#1976d2', light: isDark ? '#93c5fd' : '#42a5f5', dark: isDark ? '#3b82f6' : '#1565c0' },
      secondary: { main: isDark ? '#c084fc' : '#9c27b0' },
      background: { default: isDark ? '#0f172a' : '#f5f7fa', paper: isDark ? '#111827' : '#ffffff' },
      success: { main: '#2e7d32' },
      warning: { main: '#ed6c02' },
      error: { main: '#d32f2f' },
      text: { primary: isDark ? '#f8fafc' : '#0f172a', secondary: isDark ? '#cbd5e1' : '#475569' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.08)' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#020617' : '#0f1724',
            color: '#ffffff',
            borderRight: 'none',
          },
        },
      },
    },
  });
}

const theme = createAppTheme();
export default theme;
