'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar,
  Menu, MenuItem, Box, Divider, Tooltip, useTheme,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from './MainLayout';
import { useAppTheme } from '@/app/ThemeRegistry';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/employees':  'Employee Management',
  '/projects':   'Project Management',
  '/tasks':      'Task Management',
  '/timesheets': 'Timesheet Management',
  '/reports':    'Reports & Analytics',
  '/settings':   'Settings',
};

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleMobile } = useLayout();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, setMode } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const controlBg    = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafd';
  const controlBorder= isDark ? 'rgba(255,255,255,0.10)' : '#e8edf2';
  const controlHover = isDark ? 'rgba(255,255,255,0.10)' : '#f1f5f9';
  const borderHover  = isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1';

  return (
    <AppBar
      position="sticky"
      elevation={0}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, sm: 70 }, px: { xs: 2, sm: 3 } }}>
        {/* Mobile hamburger */}
        <IconButton
          onClick={toggleMobile}
          edge="start"
          sx={{ display: { md: 'none' }, color: 'text.secondary' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Page title */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1.2} fontSize={{ xs: 16, sm: 18 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 12, fontWeight: 400 }}>
            {today}
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              color: 'text.secondary',
              bgcolor: controlBg,
              border: `1px solid ${controlBorder}`,
              borderRadius: '10px',
              width: 38,
              height: 38,
              '&:hover': { bgcolor: controlHover, borderColor: borderHover },
              transition: 'all 0.2s ease',
            }}
          >
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={`Theme Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}>
          <IconButton
            onClick={(e) => setThemeAnchorEl(e.currentTarget)}
            sx={{
              color: 'text.secondary',
              bgcolor: controlBg,
              border: `1px solid ${controlBorder}`,
              borderRadius: '10px',
              width: 38,
              height: 38,
              '&:hover': { bgcolor: controlHover, borderColor: borderHover },
              transition: 'all 0.2s ease',
            }}
          >
            {mode === 'light' && <LightModeRoundedIcon sx={{ fontSize: 19 }} />}
            {mode === 'dark' && <DarkModeRoundedIcon sx={{ fontSize: 19 }} />}
            {mode === 'system' && <SettingsBrightnessRoundedIcon sx={{ fontSize: 19 }} />}
          </IconButton>
        </Tooltip>

        {/* Theme Selection Menu */}
        <Menu
          anchorEl={themeAnchorEl}
          open={Boolean(themeAnchorEl)}
          onClose={() => setThemeAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          disableRestoreFocus
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 130,
              borderRadius: '10px',
            },
          }}
        >
          <MenuItem
            selected={mode === 'light'}
            onClick={() => { setMode('light'); setThemeAnchorEl(null); }}
            sx={{ gap: 1.5, fontSize: 13, py: 1 }}
          >
            <LightModeRoundedIcon fontSize="small" />
            Light
          </MenuItem>
          <MenuItem
            selected={mode === 'dark'}
            onClick={() => { setMode('dark'); setThemeAnchorEl(null); }}
            sx={{ gap: 1.5, fontSize: 13, py: 1 }}
          >
            <DarkModeRoundedIcon fontSize="small" />
            Dark
          </MenuItem>
          <MenuItem
            selected={mode === 'system'}
            onClick={() => { setMode('system'); setThemeAnchorEl(null); }}
            sx={{ gap: 1.5, fontSize: 13, py: 1 }}
          >
            <SettingsBrightnessRoundedIcon fontSize="small" />
            System
          </MenuItem>
        </Menu>

        {/* User menu trigger */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            borderRadius: '12px',
            px: 1.5,
            py: 0.75,
            border: `1px solid ${controlBorder}`,
            bgcolor: controlBg,
            '&:hover': { bgcolor: controlHover, borderColor: borderHover },
            transition: 'all 0.2s ease',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={700} lineHeight={1.2} color="text.primary" fontSize={13}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={11}>
              {user?.role}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          disableRestoreFocus
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: '10px',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => { setAnchorEl(null); router.push('/settings'); }}
            sx={{ gap: 1.5, fontSize: 14, py: 1.2 }}
          >
            <AccountCircleOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            Profile & Settings
          </MenuItem>
          <MenuItem
            onClick={() => { setAnchorEl(null); logout(); }}
            sx={{ gap: 1.5, fontSize: 14, py: 1.2, color: 'error.main' }}
          >
            <LogoutRoundedIcon fontSize="small" />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
