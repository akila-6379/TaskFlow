'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('The email or password you entered is incorrect.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#F7FAFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Center content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          py: 3,
          background: 'linear-gradient(180deg, #F8FBFF 0%, #EEF5FF 100%)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 420px' },
            gap: 6,
            alignItems: 'center',
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{ color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 0.75 }}
            >
              TASKFLOW ENTERPRISE
            </Typography>

            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, mb: 1.5 }}
            >
              Employee Task &amp;
              <br />
              Timesheet
              <br />
              Management System
            </Typography>

            <Typography
              sx={{ color: '#64748b', fontSize: 17, maxWidth: 500, lineHeight: 1.8, mb: 3 }}
            >
              Manage employees, projects, tasks and work logs from one modern platform.
              Built for productivity, collaboration and efficient project tracking.
            </Typography>

            <Image
              src="/image/login-team.png"
              alt="Team"
              width={510}
              height={382}
              style={{ width: '100%', maxWidth: 510, height: 'auto' }}
              priority
            />
          </Box>

          {/* Right side — form card */}
          <Box
            sx={{
              background: '#ffffff',
              borderRadius: '20px',
              p: 5,
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
              border: '1px solid #E8EEF8',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
              Welcome Back 👋
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              Sign in to continue to TaskFlow Enterprise.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Email */}
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: '#374151', mb: 0.75, fontSize: 13 }}
              >
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
                sx={{ mb: 2.5 }}
                InputProps={{
                  sx: { borderRadius: '4px', fontSize: 14, backgroundColor: '#ffffff' },
                }}
              />

              {/* Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', fontSize: 13 }}>
                  Password
                </Typography>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ fontSize: 13, color: '#2563EB', fontWeight: 400, cursor: 'pointer' }}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: '4px', fontSize: 14, backgroundColor: '#ffffff' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        sx={{ color: '#9ca3af' }}
                      >
                        {showPassword
                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                          : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Remember me */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#2563EB' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: 13, color: '#374151' }}>
                    Remember me
                  </Typography>
                }
                sx={{ mb: 2.5, ml: -0.5 }}
              />

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                disableElevation
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: '#2563EB',
                  '&:hover': { backgroundColor: '#1D4ED8' },
                  '&:disabled': { backgroundColor: '#93c5fd' },
                }}
              >
                {loading
                  ? <CircularProgress size={18} thickness={4} sx={{ color: '#fff' }} />
                  : 'Sign In'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          borderTop: '1px solid #d1d5db',
          backgroundColor: '#ffffff',
          py: 1.5,
        }}
      >
        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          sx={{ color: '#9ca3af', fontSize: 12 }}
        >
          © 2026 Employee Task &amp; Timesheet Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
