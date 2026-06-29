'use client';
import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/theme/theme';

const THEME_STORAGE_KEY = 'app-dark-mode';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedValue === 'dark' || storedValue === 'light') {
      setMode(storedValue);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const handleThemeModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: 'light' | 'dark' }>;
      const nextMode = customEvent.detail?.mode;

      if (nextMode === 'dark' || nextMode === 'light') {
        setMode(nextMode);
        return;
      }

      const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
      setMode(storedValue === 'dark' ? 'dark' : 'light');
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setMode(event.newValue === 'dark' ? 'dark' : 'light');
      }
    };

    window.addEventListener('app-theme-mode-changed', handleThemeModeChange as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('app-theme-mode-changed', handleThemeModeChange as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
