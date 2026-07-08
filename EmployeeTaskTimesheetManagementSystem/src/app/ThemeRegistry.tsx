'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/theme/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeRegistry');
  }
  return context;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemActiveMode, setSystemActiveMode] = useState<'light' | 'dark'>('light');

  // Load initial theme from localStorage and setup media query listener on mount
  useEffect(() => {
    const saved = window.localStorage.getItem('theme-pref') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setModeState(saved);
    } else {
      // Set default as system
      window.localStorage.setItem('theme-pref', 'system');
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemActiveMode(mq.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemActiveMode(e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    window.localStorage.setItem('theme-pref', newMode);
  };

  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return systemActiveMode;
    }
    return mode;
  }, [mode, systemActiveMode]);

  // Update body class for CSS selectors
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${resolvedMode}`);
    }
  }, [resolvedMode]);

  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  const contextValue = useMemo(() => ({
    mode,
    resolvedMode,
    setMode,
  }), [mode, resolvedMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
