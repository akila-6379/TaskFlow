'use client';
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  Link, InputAdornment, IconButton, useTheme,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import api from '@/services/api';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/Auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data ?? 'Invalid or expired reset token.';
      setError(typeof msg === 'string' ? msg : 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d1525 0%, #0f1a2e 100%)'
    : 'linear-gradient(180deg, #F8FBFF 0%, #EEF5FF 100%)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E8EEF8';
  const cardShadow = isDark ? '0 15px 40px rgba(0,0,0,0.45)' : '0 15px 40px rgba(0,0,0,0.08)';

  const eyeAdornment = (show: boolean, toggle: () => void) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={toggle} edge="end" tabIndex={-1} sx={{ color: 'text.secondary' }}>
          {show ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </InputAdornment>
    ),
  });

  return (
    <Box sx={{ height: '100vh', background: pageBg, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 4 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            background: theme.palette.background.paper,
            borderRadius: '20px',
            p: 5,
            boxShadow: cardShadow,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Reset Password
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14 }}>
            Enter your new password below.
          </Typography>

          {success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset successfully. You can now sign in.
              </Alert>
              <Button
                fullWidth variant="contained" disableElevation
                onClick={() => router.push('/login')}
                sx={{
                  py: 1, borderRadius: '4px', fontSize: 14, fontWeight: 600,
                  textTransform: 'none', backgroundColor: '#2563EB',
                  '&:hover': { backgroundColor: '#1D4ED8' },
                }}
              >
                Go to Sign In
              </Button>
            </>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.75, fontSize: 13 }}>
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 2.5 }}
                  InputProps={{ sx: { borderRadius: '4px', fontSize: 14 }, ...eyeAdornment(showNew, () => setShowNew(!showNew)) }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.75, fontSize: 13 }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 3 }}
                  InputProps={{ sx: { borderRadius: '4px', fontSize: 14 }, ...eyeAdornment(showConfirm, () => setShowConfirm(!showConfirm)) }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !token}
                  disableElevation
                  sx={{
                    py: 1, borderRadius: '4px', fontSize: 14, fontWeight: 600,
                    textTransform: 'none', backgroundColor: '#2563EB',
                    '&:hover': { backgroundColor: '#1D4ED8' },
                    '&:disabled': { backgroundColor: isDark ? '#1d4ed8' : '#93c5fd', color: '#fff' },
                  }}
                >
                  {loading ? <CircularProgress size={18} thickness={4} sx={{ color: '#fff' }} /> : 'Reset Password'}
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component="button"
              onClick={() => router.push('/login')}
              underline="hover"
              sx={{ fontSize: 13, color: '#2563EB', cursor: 'pointer' }}
            >
              ← Back to Sign In
            </Link>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '100%', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#d1d5db'}`, bgcolor: 'background.paper', py: 1.5 }}>
        <Typography variant="caption" display="block" textAlign="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
          © 2026 Employee Task &amp; Timesheet Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
