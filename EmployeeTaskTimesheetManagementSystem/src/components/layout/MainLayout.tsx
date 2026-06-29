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
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFD' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LayoutContext.Provider value={{ mobileOpen, toggleMobile }}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar — permanent on desktop, temporary drawer on mobile */}
        <Sidebar />

        {/* Main content area — flex:1 fills remaining space after sidebar */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            // On desktop the permanent Drawer naturally pushes content; no margin needed.
            // On mobile the Drawer is temporary (absolute), so no offset.
            width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          }}
        >
          <Header />
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              overflow: 'auto',
              maxWidth: '100%',
              bgcolor: '#F8FAFD',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </LayoutContext.Provider>
  );
}
