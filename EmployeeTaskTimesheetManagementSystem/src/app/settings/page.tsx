'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button,
  Switch, Avatar, Tab, Tabs, Stack, Chip, IconButton, Snackbar, Alert,
  useTheme,
} from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import InputAdornment from '@mui/material/InputAdornment';

// ─── Default values ──────────────────────────────────────────────────────────
const DEFAULT_NOTIF = {
  emailAlerts: true, taskUpdates: true, projectUpdates: false,
  weeklyReport: true, systemAlerts: false,
};

function loadNotif() {
  try {
    const raw = localStorage.getItem('settings_notifications');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_NOTIF;
}

// Profile is loaded from the AuthContext user object (sourced from the DB via
// the login response). localStorage is NOT used as a profile store.
function loadProfile(user: { name?: string; email?: string; phone?: string; department?: string; bio?: string } | null) {
  return {
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    phone:      user?.phone      ?? '',
    department: user?.department ?? '',
    bio:        user?.bio        ?? '',
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 3, flex: 1, overflowY: 'auto' }}>{children}</Box> : null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tab, setTab] = useState(0);

  // ── Profile state ──────────────────────────────────────────────────────────
  const [savedProfile, setSavedProfile] = useState(() => loadProfile(user));
  const [profile, setProfile]           = useState(() => loadProfile(user));

  // ── Notification state ─────────────────────────────────────────────────────
  const [savedNotif, setSavedNotif]       = useState(loadNotif);
  const [notifications, setNotifications] = useState(loadNotif);

  // ── Profile saving state ───────────────────────────────────────────────────
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Password state ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  // Tracks whether the backend rejected the current password — cleared only when the user changes the current field
  const [pwCurrentRejected, setPwCurrentRejected] = useState(false);

  // ── Validation errors ──────────────────────────────────────────────────────
  const [profileErrors, setProfileErrors] = useState({ name: '', email: '', phone: '', department: '' });

  // ── Snackbar ───────────────────────────────────────────────────────────────
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, message, severity });

  // Sync profile from user when user changes (e.g. on first mount after auth)
  useEffect(() => {
    const loaded = loadProfile(user);
    setSavedProfile(loaded);
    setProfile(loaded);
  }, [user?.name, user?.email]);

  // ── Dirty check ────────────────────────────────────────────────────────────
  const profileDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfile),
    [profile, savedProfile],
  );
  const notifDirty = useMemo(
    () => JSON.stringify(notifications) !== JSON.stringify(savedNotif),
    [notifications, savedNotif],
  );
  const isDirty = profileDirty || notifDirty;

  // ── Profile validity (real-time, mirrors validateProfile logic) ────────────
  const profileValid = useMemo(() =>
    !!profile.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) &&
    /^\d{10}$/.test(profile.phone) &&
    !!profile.department.trim(),
  [profile]);

  // ── Profile validation ─────────────────────────────────────────────────────
  function validateProfile() {
    const errors = { name: '', email: '', phone: '', department: '' };
    let ok = true;
    if (!profile.name.trim()) { errors.name = 'Full name is required.'; ok = false; }
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      errors.email = 'A valid email address is required.'; ok = false;
    }
    if (!/^\d{10}$/.test(profile.phone)) { errors.phone = 'Phone number must contain exactly 10 digits.'; ok = false; }
    if (!profile.department.trim()) { errors.department = 'Department is required.'; ok = false; }
    setProfileErrors(errors);
    return ok;
  }

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateProfile()) return;
    if (!user?.userId) { showSnack('Session error — please log in again.', 'error'); return; }
    setProfileSaving(true);
    try {
      const { data } = await api.put(`/Auth/profile/${user.userId}`, {
        fullName:   profile.name,
        email:      profile.email,
        phone:      profile.phone,
        department: profile.department,
        bio:        profile.bio,
      });
      const updated = {
        name:       data?.fullName   ?? data?.name       ?? profile.name,
        email:      data?.email                          ?? profile.email,
        phone:      data?.phone                          ?? profile.phone,
        department: data?.department                     ?? profile.department,
        bio:        data?.bio                            ?? profile.bio,
      };
      setProfile(updated);
      setSavedProfile(updated);
      localStorage.setItem('settings_notifications', JSON.stringify(notifications));
      setSavedNotif({ ...notifications });
      updateUser({ name: updated.name, email: updated.email, phone: updated.phone, department: updated.department, bio: updated.bio });
      showSnack('Profile updated successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data ?? 'Failed to save profile.';
      showSnack(typeof msg === 'string' ? msg : 'Failed to save profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Discard changes ────────────────────────────────────────────────────────
  const handleDiscard = () => {
    setProfile({ ...savedProfile });
    setNotifications({ ...savedNotif });
    setProfileErrors({ name: '', email: '', phone: '', department: '' });
  };

  // ── Password validation & save ─────────────────────────────────────────────
  const handlePasswordSave = async () => {
    if (!user?.userId) { showSnack('Session error — please log in again.', 'error'); return; }
    setPwSaving(true);
    try {
      await api.put(`/Auth/change-password/${user.userId}`, {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({ current: '', newPw: '', confirm: '' });
      setPwCurrentRejected(false);
      showSnack('Password updated successfully.');
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ??
        err?.response?.data ??
        'Failed to update password.';
      if (typeof msg === 'string' && msg.toLowerCase().includes('current')) {
        setPwErrors(e => ({ ...e, current: msg }));
        setPwCurrentRejected(true);
      } else {
        showSnack(typeof msg === 'string' ? msg : 'Failed to update password.', 'error');
      }
    } finally {
      setPwSaving(false);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } };

  const notificationItems = [
    { key: 'emailAlerts',    title: 'Email Alerts',    description: 'Receive important email alerts.',        icon: <EmailRoundedIcon /> },
    { key: 'taskUpdates',    title: 'Task Updates',    description: 'Stay updated on task changes.',          icon: <PersonRoundedIcon /> },
    { key: 'projectUpdates', title: 'Project Updates', description: 'Track project milestone changes.',       icon: <BusinessRoundedIcon /> },
    { key: 'weeklyReport',   title: 'Weekly Report',   description: 'Get a weekly account summary.',          icon: <DashboardRoundedIcon /> },
    { key: 'systemAlerts',   title: 'System Alerts',   description: 'Receive system and security updates.',   icon: <NotificationsRoundedIcon /> },
  ];

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, md: 2 }, py: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ── Page header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">Settings</Typography>
            <Typography variant="body2" color="text.secondary">Manage your account preferences and workspace experience.</Typography>
          </Box>
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<CloseRoundedIcon />}
              onClick={handleDiscard}
              disabled={!isDirty}
              sx={{ borderRadius: '999px', textTransform: 'none', px: 2, py: 1, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' } }}
            >
              Discard Changes
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSave}
              disabled={!isDirty || !profileValid || profileSaving}
              sx={{
                borderRadius: '999px', textTransform: 'none', px: 2.25, py: 1,
                background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)',
                boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 12px 24px rgba(37,99,235,0.22)',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 16px 30px rgba(37,99,235,0.26)' },
                transition: 'all 0.2s ease',
                '&.Mui-disabled': { background: 'action.disabledBackground', boxShadow: 'none', color: 'action.disabled' },
              }}
            >
              {isDirty ? 'Save Changes' : 'No Changes'}
            </Button>
          </Stack>
        </Box>

        {/* ── Tabs ── */}
        <Card sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mb: 2, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: isDark ? '0 18px 48px rgba(0,0,0,0.35)' : '0 18px 48px rgba(15, 23, 42, 0.06)' }}>
          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: { xs: 2, md: 3 }, py: 1.25 }}>
            <Tabs
              value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: '999px' },
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 48, color: 'text.secondary' },
                '& .Mui-selected': { color: 'primary.main !important' },
              }}
            >
              <Tab label="Profile" />
              <Tab label="Notifications" />
            </Tabs>
          </Box>

          {/* ── Profile tab ── */}
          <TabPanel value={tab} index={0}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Profile Summary Card */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.35)' : '0 14px 36px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
                    <Box sx={{ background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)', p: 3, color: '#ffffff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.9 }}>Profile Summary</Typography>
                          <Typography variant="h6" fontWeight={700} mt={0.5}>{profile.name || user?.name}</Typography>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar sx={{ width: 76, height: 76, fontSize: 30, bgcolor: '#ffffff', color: 'primary.main', fontWeight: 800 }}>
                            {(profile.name || user?.name)?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <IconButton sx={{ position: 'absolute', right: -4, bottom: -4, bgcolor: '#ffffff', color: 'primary.main', width: 32, height: 32, boxShadow: '0 8px 18px rgba(15,23,42,0.16)', '&:hover': { bgcolor: 'action.hover' } }}>
                            <CameraAltRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} color="text.primary">{profile.name || user?.name}</Typography>
                          <Chip label={user?.role ?? 'Manager'} size="small" sx={{ mt: 0.75, bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff', color: 'primary.main', fontWeight: 700, borderRadius: '999px' }} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}><EmailRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.email || user?.email}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}><PhoneRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.phone}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}><BusinessRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.department}</Typography></Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Personal Details + Change Password */}
                <Grid item xs={12} lg={8}>
                  <Card sx={{ borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.35)' : '0 14px 36px rgba(15, 23, 42, 0.06)' }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={2}>Personal Details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Full Name" value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            fullWidth error={!!profileErrors.name} helperText={profileErrors.name}
                            InputProps={{ startAdornment: <PersonRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
                            sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Email Address" value={profile.email}
                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                            fullWidth error={!!profileErrors.email} helperText={profileErrors.email}
                            InputProps={{ startAdornment: <EmailRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
                            sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Phone Number" value={profile.phone}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setProfile({ ...profile, phone: digits });
                              setProfileErrors(prev => ({ ...prev, phone: digits.length > 0 && digits.length < 10 ? 'Phone number must contain exactly 10 digits.' : '' }));
                            }}
                            inputProps={{ inputMode: 'numeric' }}
                            fullWidth error={!!profileErrors.phone} helperText={profileErrors.phone}
                            InputProps={{ startAdornment: <PhoneRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
                            sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Department" value={profile.department}
                            onChange={e => setProfile({ ...profile, department: e.target.value })}
                            fullWidth error={!!profileErrors.department} helperText={profileErrors.department}
                            InputProps={{ startAdornment: <BusinessRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
                            sx={fieldSx}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Bio" value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            fullWidth multiline rows={4}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                          />
                        </Grid>
                      </Grid>

                      {/* Change Password */}
                      <Box sx={{ mt: 3, p: 2.5, borderRadius: '18px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">Change Password</Typography>
                          <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            startIcon={<LockRoundedIcon />}
                            onClick={handlePasswordSave}
                            disabled={pwSaving || !pwForm.current || !pwForm.newPw || !pwForm.confirm || pwForm.newPw !== pwForm.confirm || pwCurrentRejected}
                            sx={{
                              borderRadius: '999px', textTransform: 'none', fontWeight: 600,
                              background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)',
                              '&.Mui-disabled': { background: 'action.disabledBackground', color: 'action.disabled' },
                            }}
                          >
                            Update Password
                          </Button>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Current Password"
                              type={showPw.current ? 'text' : 'password'}
                              value={pwForm.current}
                              onChange={e => { setPwForm({ ...pwForm, current: e.target.value }); setPwErrors(prev => ({ ...prev, current: '' })); setPwCurrentRejected(false); }}
                              error={!!pwErrors.current} helperText={pwErrors.current}
                              fullWidth
                              InputProps={{
                                startAdornment: <LockRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} sx={{ color: 'text.secondary' }}>
                                      {showPw.current ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={fieldSx}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="New Password"
                              type={showPw.newPw ? 'text' : 'password'}
                              value={pwForm.newPw}
                              onChange={e => { setPwForm({ ...pwForm, newPw: e.target.value }); setPwErrors(prev => ({ ...prev, newPw: '', confirm: pwForm.confirm && e.target.value !== pwForm.confirm ? 'Passwords do not match.' : '' })); }}
                              error={!!pwErrors.newPw} helperText={pwErrors.newPw}
                              fullWidth
                              InputProps={{
                                startAdornment: <LockRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, newPw: !p.newPw }))} sx={{ color: 'text.secondary' }}>
                                      {showPw.newPw ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={fieldSx}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Confirm Password"
                              type={showPw.confirm ? 'text' : 'password'}
                              value={pwForm.confirm}
                              onChange={e => { const v = e.target.value; setPwForm({ ...pwForm, confirm: v }); setPwErrors(prev => ({ ...prev, confirm: v && pwForm.newPw !== v ? 'Passwords do not match.' : '' })); }}
                              error={!!pwErrors.confirm} helperText={pwErrors.confirm}
                              fullWidth
                              InputProps={{
                                startAdornment: <LockRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" tabIndex={-1} onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} sx={{ color: 'text.secondary' }}>
                                      {showPw.confirm ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={fieldSx}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* ── Notifications tab ── */}
          <TabPanel value={tab} index={1}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={2}>Notification Preferences</Typography>
              <Stack spacing={1.5}>
                {notificationItems.map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 2, borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper',
                      transition: 'all 0.2s ease', '&:hover': { boxShadow: isDark ? '0 10px 24px rgba(0,0,0,0.25)' : '0 10px 24px rgba(15,23,42,0.04)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', color: 'primary.main' }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      color="primary"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </TabPanel>
        </Card>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ borderRadius: '14px', fontWeight: 600 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
