'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar,
  Menu, MenuItem, Box, Divider, Tooltip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from './MainLayout';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e8edf2',
        color: 'text.primary',
        zIndex: (t) => t.zIndex.drawer - 1,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, sm: 70 }, px: { xs: 2, sm: 3 } }}>
        {/* Mobile hamburger */}
        <IconButton
          onClick={toggleMobile}
          edge="start"
          sx={{ display: { md: 'none' }, color: '#374151' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Page title */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" lineHeight={1.2} fontSize={{ xs: 16, sm: 18 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="#94a3b8" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 12, fontWeight: 400 }}>
            {today}
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              color: '#6b7280',
              bgcolor: '#f8fafd',
              border: '1px solid #e8edf2',
              borderRadius: '10px',
              width: 38,
              height: 38,
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              transition: 'all 0.2s ease',
            }}
          >
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

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
            border: '1px solid #e8edf2',
            bgcolor: '#f8fafd',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
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
            <Typography variant="body2" fontWeight={700} lineHeight={1.2} color="#111827" fontSize={13}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="#94a3b8" fontSize={11}>
              {user?.role}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: '#9ca3af', display: { xs: 'none', sm: 'block' } }} />
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
              border: '1px solid #e8edf2',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => { setAnchorEl(null); router.push('/settings'); }}
            sx={{ gap: 1.5, fontSize: 14, py: 1.2 }}
          >
            <AccountCircleOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
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
