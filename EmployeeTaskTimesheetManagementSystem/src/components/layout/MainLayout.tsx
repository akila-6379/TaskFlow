'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

export const SIDEBAR_WIDTH = 280;

interface LayoutCtx { mobileOpen: boolean; toggleMobile: () => void; }
const LayoutContext = createContext<LayoutCtx>({ mobileOpen: false, toggleMobile: () => {} });
export const useLayout = () => useContext(LayoutContext);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen(p => !p), []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // close mobile drawer on route change (desktop resize)
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  if (loading || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LayoutContext.Provider value={{ mobileOpen, toggleMobile }}>
      {/* Outermost shell — full viewport, no gap, no padding */}
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
        {/* Sidebar — permanent on desktop, temporary drawer on mobile */}
        <Sidebar />

        {/* Right column: Header + scrollable page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
            overflow: 'hidden',
          }}
        >
          {/* Sticky header — sits flush at the top, full width of this column */}
          <Header />

          {/* Scrollable page content with consistent internal padding */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              overflowY: 'auto',
              overflowX: 'hidden',
              bgcolor: 'background.default',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </LayoutContext.Provider>
  );
}
