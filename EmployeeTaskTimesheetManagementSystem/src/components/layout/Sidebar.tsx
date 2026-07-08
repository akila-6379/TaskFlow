'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider, Avatar, useMediaQuery, useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import TaskRoundedIcon from '@mui/icons-material/TaskRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout, SIDEBAR_WIDTH } from './MainLayout';

const NAV = [
  { label: 'Dashboard',   icon: <DashboardRoundedIcon />,   path: '/dashboard' },
  { label: 'Employees',   icon: <PeopleRoundedIcon />,      path: '/employees' },
  { label: 'Projects',    icon: <FolderRoundedIcon />,      path: '/projects' },
  { label: 'Tasks',       icon: <TaskRoundedIcon />,        path: '/tasks' },
  { label: 'Timesheets',  icon: <AccessTimeRoundedIcon />,  path: '/timesheets' },
  { label: 'Settings',    icon: <SettingsRoundedIcon />,    path: '/settings' },
];

function SidebarContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Theme-aware tokens
  const bgColor       = isDark ? '#111827' : '#ffffff';
  const textColor     = isDark ? '#F8FAFC' : '#334155';
  const textSecColor  = isDark ? '#CBD5E1' : '#475569';
  const mutedColor    = isDark ? '#94A3B8' : '#64748B';
  const iconColor     = isDark ? '#94A3B8' : '#64748B';
  const borderColor   = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  const profileBg     = isDark ? '#1E293B' : '#f8fafc';
  const profileBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: bgColor,
        color: textColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brand logo section */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 72, position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}
        >
          <TaskRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: isDark ? '#F8FAFC' : '#0f172a', lineHeight: 1.3, letterSpacing: 0.3 }} noWrap>
            TaskFlow
          </Typography>
          <Typography sx={{ fontSize: 10, color: mutedColor, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 500 }}>
            Enterprise
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor, mx: 2.5 }} />

      {/* Navigation Label */}
      <Typography sx={{ px: 3, pt: 3, pb: 1.5, fontSize: 10, fontWeight: 700, color: mutedColor, letterSpacing: 1.5, textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>
        Main Menu
      </Typography>

      {/* Navigation list */}
      <List sx={{ px: 2, flex: 1, pb: 0, position: 'relative', zIndex: 2 }} disablePadding>
        {NAV.map(({ label, icon, path }) => {
          const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
          return (
            <ListItem key={path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => onNavigate(path)}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  px: 1.75,
                  color: active ? '#ffffff' : textSecColor,
                  background: active
                    ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 2px 8px rgba(37,99,235,0.2)'
                    : 'none',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: active
                      ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                      : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                    color: active ? '#ffffff' : (isDark ? '#F8FAFC' : '#0f172a'),
                    transform: 'translateX(3px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? '#ffffff' : iconColor,
                    minWidth: 38,
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 400, letterSpacing: 0.2 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor, mx: 2.5, mt: 1 }} />

      {/* Profile section at bottom */}
      <Box sx={{ p: 2.5, position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.25,
            mb: 1,
            borderRadius: '12px',
            bgcolor: profileBg,
            border: `1px solid ${profileBorder}`,
            boxShadow: 'none',
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F8FAFC' : '#0f172a', lineHeight: 1.3 }} noWrap>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: mutedColor, fontWeight: 400 }} noWrap>
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: '10px',
            py: 1,
            px: 1.5,
            color: '#fc8181',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: 'rgba(252,129,129,0.12)', transform: 'translateX(3px)' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <LogoutRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const { mobileOpen, toggleMobile } = useLayout();

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) toggleMobile();
  };

  const paperSx = {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box' as const,
    borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
    bgcolor: isDark ? '#111827' : '#ffffff',
    backgroundImage: 'none',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        <SidebarContent onNavigate={handleNavigate} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': paperSx,
      }}
    >
      <SidebarContent onNavigate={handleNavigate} />
    </Drawer>
  );
}
