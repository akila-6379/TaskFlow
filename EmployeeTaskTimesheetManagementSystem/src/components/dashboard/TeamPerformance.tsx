'use client';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { taskCompletionTrend } from '@/data/mockData';

export default function TeamPerformance() {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid rgba(232,237,242,0.8)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        borderRadius: '24px',
        bgcolor: '#fff',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&:hover': { boxShadow: '0 20px 48px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' },
      }}
    >
      {/* Custom header */}
      <Box sx={{
        px: 3, pt: 3, pb: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {/* Analytics icon */}
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
            flexShrink: 0,
          }}>
            <BarChartRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Task Completion Trend
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, mt: 0.2 }}>
              Monthly completed vs pending tasks
            </Typography>
          </Box>
        </Box>

        {/* Pill year badge */}
        <Chip
          label="2025"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: 12,
            height: 28,
            borderRadius: '20px',
            bgcolor: 'rgba(37,99,235,0.08)',
            color: '#2563EB',
            border: '1px solid rgba(37,99,235,0.18)',
            letterSpacing: 0.3,
          }}
        />
      </Box>

      <CardContent sx={{ pt: 2, px: 2.5, pb: 2.5 }}>
        <Box sx={{ width: '100%', height: 290 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={taskCompletionTrend}
              margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: '1px solid #e8edf2',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  fontSize: 13,
                }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Bar dataKey="completed" name="Completed" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="pending"   name="Pending"   fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
