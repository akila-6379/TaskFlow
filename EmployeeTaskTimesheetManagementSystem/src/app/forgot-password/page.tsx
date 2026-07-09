'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress, Link, useTheme,
} from '@mui/material';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/Auth/forgot-password', { email });
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d1525 0%, #0f1a2e 100%)'
    : 'linear-gradient(180deg, #F8FBFF 0%, #EEF5FF 100%)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E8EEF8';
  const cardShadow = isDark ? '0 15px 40px rgba(0,0,0,0.45)' : '0 15px 40px rgba(0,0,0,0.08)';

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
            Forgot Password?
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14 }}>
            Enter your email and we&apos;ll send you a reset link.
          </Typography>

          {success ? (
            <Alert severity="success">
              If that email is registered, a reset link has been sent. Check your inbox.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.75, fontSize: 13 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 3 }}
                  InputProps={{ sx: { borderRadius: '4px', fontSize: 14 } }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  disableElevation
                  sx={{
                    py: 1, borderRadius: '4px', fontSize: 14, fontWeight: 600,
                    textTransform: 'none', backgroundColor: '#2563EB',
                    '&:hover': { backgroundColor: '#1D4ED8' },
                    '&:disabled': { backgroundColor: isDark ? '#1d4ed8' : '#93c5fd', color: '#fff' },
                  }}
                >
                  {loading ? <CircularProgress size={18} thickness={4} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
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
