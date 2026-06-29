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

const sidebarBg   = '#080d1a';
const activeColor = '#2563EB';
const textMuted   = '#7b8fa6';

function SidebarContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(170deg, #080d1a 0%, #0d1225 40%, #0f1635 70%, #0a0f20 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        /* Pulsing blue orb — top-right */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 65%)',
          animation: 'sbPulseBlue 6s ease-in-out infinite',
          pointerEvents: 'none',
        },
        /* Pulsing purple orb — mid-right */
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '38%',
          right: -50,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
          animation: 'sbPulsePurple 8s ease-in-out infinite',
          pointerEvents: 'none',
        },
        '@keyframes sbPulseBlue': {
          '0%,100%': { transform: 'scale(1)',    opacity: 1   },
          '50%':      { transform: 'scale(1.28)', opacity: 0.6 },
        },
        '@keyframes sbPulsePurple': {
          '0%,100%': { transform: 'scale(1)',    opacity: 1   },
          '50%':      { transform: 'scale(1.35)', opacity: 0.5 },
        },
      }}
    >
      {/* ── Strong radial glow — bottom-left corner ── */}
      <Box sx={{
        position: 'absolute',
        bottom: -40, left: -40,
        width: 220, height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.38) 0%, transparent 68%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Brand */}
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
            boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
          }}
        >
          <TaskRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.3, letterSpacing: 0.3 }} noWrap>
            TaskFlow
          </Typography>
          <Typography sx={{ fontSize: 10, color: textMuted, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 500 }}>
            Enterprise
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2.5 }} />

      {/* Nav section label */}
      <Typography sx={{ px: 3, pt: 3, pb: 1.5, fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 1.5, textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>
        Main Menu
      </Typography>

      {/* Nav items */}
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
                  color: active ? '#fff' : textMuted,
                  background: active
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.92) 0%, rgba(124,58,237,0.88) 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 0 0 1px rgba(255,255,255,0.10), 0 4px 20px rgba(37,99,235,0.50), 0 8px 36px rgba(124,58,237,0.28)'
                    : 'none',
                  border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: active
                      ? 'linear-gradient(135deg, rgba(37,99,235,0.97) 0%, rgba(124,58,237,0.93) 100%)'
                      : 'rgba(255,255,255,0.07)',
                    boxShadow: active
                      ? '0 0 0 1px rgba(255,255,255,0.15), 0 6px 28px rgba(37,99,235,0.60), 0 12px 42px rgba(124,58,237,0.32)'
                      : '0 0 20px rgba(99,102,241,0.22)',
                    color: '#fff',
                    transform: 'translateX(3px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? '#fff' : textMuted,
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

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2.5, mt: 1 }} />

      {/* User profile + logout */}
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
            bgcolor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
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
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }} noWrap>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: textMuted, fontWeight: 400 }} noWrap>
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
            transition: 'all 0.3s ease',
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
  const { mobileOpen, toggleMobile } = useLayout();

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) toggleMobile();
  };

  const paperSx = {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box' as const,
    border: 'none',
    bgcolor: sidebarBg,
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
