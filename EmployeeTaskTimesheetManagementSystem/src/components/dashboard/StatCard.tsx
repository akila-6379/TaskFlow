import { Card, CardContent, Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  trend?: string;
  trendColor?: string;
}

const CARD_GRADIENTS: Record<string, { card: string; icon: string; glow: string; wave: string }> = {
  '#2563EB': {
    card: 'linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)',
    icon: 'linear-gradient(135deg, #2563EB 0%, #60a5fa 100%)',
    glow: 'rgba(37,99,235,0.18)',
    wave: '#2563EB',
  },
  '#1976d2': {
    card: 'linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)',
    icon: 'linear-gradient(135deg, #2563EB 0%, #60a5fa 100%)',
    glow: 'rgba(37,99,235,0.18)',
    wave: '#2563EB',
  },
  '#7C3AED': {
    card: 'linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%)',
    icon: 'linear-gradient(135deg, #7C3AED 0%, #c084fc 100%)',
    glow: 'rgba(124,58,237,0.18)',
    wave: '#7C3AED',
  },
  '#7c3aed': {
    card: 'linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%)',
    icon: 'linear-gradient(135deg, #7C3AED 0%, #c084fc 100%)',
    glow: 'rgba(124,58,237,0.18)',
    wave: '#7C3AED',
  },
  '#F59E0B': {
    card: 'linear-gradient(145deg, #ffffff 0%, #fffbf0 100%)',
    icon: 'linear-gradient(135deg, #F59E0B 0%, #fcd34d 100%)',
    glow: 'rgba(245,158,11,0.18)',
    wave: '#F59E0B',
  },
  '#d97706': {
    card: 'linear-gradient(145deg, #ffffff 0%, #fffbf0 100%)',
    icon: 'linear-gradient(135deg, #F59E0B 0%, #fcd34d 100%)',
    glow: 'rgba(245,158,11,0.18)',
    wave: '#F59E0B',
  },
  '#0891b2': {
    card: 'linear-gradient(145deg, #ffffff 0%, #f0fbff 100%)',
    icon: 'linear-gradient(135deg, #0891b2 0%, #38bdf8 100%)',
    glow: 'rgba(8,145,178,0.18)',
    wave: '#0891b2',
  },
};

export default function StatCard({ title, value, icon, color, subtitle, trend, trendColor }: StatCardProps) {
  const cfg = CARD_GRADIENTS[color] ?? {
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fafd 100%)',
    icon: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
    glow: `${color}30`,
    wave: color,
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: cfg.card,
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: `0 12px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6)`,
        borderRadius: '24px',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(12px)',
        '&:hover': {
          boxShadow: `0 20px 48px rgba(0,0,0,0.13), 0 0 0 1px rgba(255,255,255,0.8)`,
          transform: 'translateY(-6px)',
        },
        /* Top-right decorative glow blob */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: '56px !important', position: 'relative', zIndex: 1 }}>

        {/* Top row: label + icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {title}
          </Typography>

          {/* Large gradient icon */}
          <Box sx={{
            width: 54,
            height: 54,
            borderRadius: '16px',
            background: cfg.icon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 8px 20px ${cfg.glow}`,
            '& svg': { fontSize: 28, color: '#fff' },
          }}>
            {icon}
          </Box>
        </Box>

        {/* Value */}
        <Typography sx={{
          fontSize: 38, fontWeight: 900, color: '#0f172a',
          lineHeight: 1, mb: 1, letterSpacing: -1.5,
        }}>
          {value}
        </Typography>

        {/* Subtitle + trend badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {subtitle && (
            <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 0.9,
              py: 0.2,
              borderRadius: '20px',
              bgcolor: `${trendColor ?? '#22C55E'}18`,
              border: `1px solid ${trendColor ?? '#22C55E'}30`,
            }}>
              <Typography sx={{
                fontSize: 11, fontWeight: 700,
                color: trendColor ?? '#22C55E',
                lineHeight: 1.6,
              }}>
                {trend} vs last month
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Decorative SVG wave */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, overflow: 'hidden', zIndex: 0 }}>
        <svg
          viewBox="0 0 500 50"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path
            d="M0,25 C60,45 120,5 200,25 C280,45 360,10 440,22 C470,28 490,20 500,25 L500,50 L0,50 Z"
            fill={cfg.wave}
            fillOpacity="0.07"
          />
          <path
            d="M0,35 C80,20 160,42 260,32 C340,24 420,38 500,30 L500,50 L0,50 Z"
            fill={cfg.wave}
            fillOpacity="0.05"
          />
        </svg>
      </Box>
    </Card>
  );
}
