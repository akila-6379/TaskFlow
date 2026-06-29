'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button,
  Switch, Avatar, Tab, Tabs, Stack, Chip, IconButton,
} from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
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

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: '+1-555-0100', department: 'Management', bio: '' });
  const [notifications, setNotifications] = useState({ emailAlerts: true, taskUpdates: true, projectUpdates: false, weeklyReport: true, systemAlerts: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleDiscard = () => {
    setProfile({ name: user?.name ?? '', email: user?.email ?? '', phone: '+1-555-0100', department: 'Management', bio: '' });
    setNotifications({ emailAlerts: true, taskUpdates: true, projectUpdates: false, weeklyReport: true, systemAlerts: false });
  };

  const notificationItems = [
    { key: 'emailAlerts', title: 'Email Alerts', description: 'Receive important email alerts.', icon: <EmailRoundedIcon /> },
    { key: 'taskUpdates', title: 'Task Updates', description: 'Stay updated on task changes.', icon: <PersonRoundedIcon /> },
    { key: 'projectUpdates', title: 'Project Updates', description: 'Track project milestone changes.', icon: <BusinessRoundedIcon /> },
    { key: 'weeklyReport', title: 'Weekly Report', description: 'Get a weekly account summary.', icon: <DashboardRoundedIcon /> },
    { key: 'systemAlerts', title: 'System Alerts', description: 'Receive system and security updates.', icon: <NotificationsRoundedIcon /> },
  ];

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a">Settings</Typography>
            <Typography variant="body2" color="text.secondary">Manage your account preferences and workspace experience.</Typography>
          </Box>
          <Stack direction="row" spacing={1.25}>
            <Button variant="outlined" startIcon={<CloseRoundedIcon />} onClick={handleDiscard} sx={{ borderRadius: '999px', textTransform: 'none', px: 2, py: 1, borderColor: '#e2e8f0', color: '#475569' }}>
              Discard Changes
            </Button>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave} sx={{ borderRadius: '999px', textTransform: 'none', px: 2.25, py: 1, background: 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)', boxShadow: '0 12px 24px rgba(37,99,235,0.22)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 16px 30px rgba(37,99,235,0.26)' }, transition: 'all 0.2s ease' }}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>

        <Card sx={{ mb: 3, borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)' }}>
          <Box sx={{ borderBottom: '1px solid #e2e8f0', px: { xs: 2, md: 3 }, py: 1.25 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '999px' }, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 48, color: '#64748b' }, '& .Mui-selected': { color: '#2563EB !important' } }}>
              <Tab label="Profile" />
              <Tab label="Notifications" />
            </Tabs>
          </Box>

          <TabPanel value={tab} index={0}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={4}>
                  <Card sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)', p: 3, color: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.9 }}>Profile Summary</Typography>
                          <Typography variant="h6" fontWeight={700} mt={0.5}>{profile.name || user?.name}</Typography>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar sx={{ width: 76, height: 76, fontSize: 30, bgcolor: '#fff', color: '#2563EB', fontWeight: 800 }}>
                            {user?.name?.charAt(0)}
                          </Avatar>
                          <IconButton sx={{ position: 'absolute', right: -4, bottom: -4, bgcolor: '#fff', color: '#2563EB', width: 32, height: 32, boxShadow: '0 8px 18px rgba(15,23,42,0.16)', '&:hover': { bgcolor: '#f8fafc' } }}>
                            <CameraAltRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} color="#0f172a">{profile.name || user?.name}</Typography>
                          <Chip label={user?.role ?? 'Manager'} size="small" sx={{ mt: 0.75, bgcolor: '#eff6ff', color: '#2563EB', fontWeight: 700, borderRadius: '999px' }} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}><EmailRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.email || user?.email}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}><PhoneRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.phone}</Typography></Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}><BusinessRoundedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{profile.department}</Typography></Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={8}>
                  <Card sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06)' }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={2}>Personal Details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField label="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} fullWidth InputProps={{ startAdornment: <PersonRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField label="Email Address" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} fullWidth InputProps={{ startAdornment: <EmailRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField label="Phone Number" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} fullWidth InputProps={{ startAdornment: <PhoneRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField label="Department" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} fullWidth InputProps={{ startAdornment: <BusinessRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Bio" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} fullWidth multiline rows={4} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3, p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#0f172a" mb={2}>Change Password</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField label="Current Password" type="password" fullWidth InputProps={{ startAdornment: <LockRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField label="New Password" type="password" fullWidth InputProps={{ startAdornment: <LockRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField label="Confirm Password" type="password" fullWidth InputProps={{ startAdornment: <LockRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', minHeight: 48 } }} />
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={2}>Notification Preferences</Typography>
              <Stack spacing={1.5}>
                {notificationItems.map((item) => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#fff', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 10px 24px rgba(15,23,42,0.04)' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', color: '#2563EB' }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                      </Box>
                    </Box>
                    <Switch checked={notifications[item.key as keyof typeof notifications]} onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })} color="primary" />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </TabPanel>
        </Card>
      </Box>
    </MainLayout>
  );
}
