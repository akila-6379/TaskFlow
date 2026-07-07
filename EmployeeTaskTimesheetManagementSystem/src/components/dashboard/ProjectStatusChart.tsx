'use client';
import { Card, CardContent, Box, Typography } from '@mui/material';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';

const COLORS: Record<string, string> = {
  'In Progress': '#2563EB',
  Completed: '#22C55E',
  'On Hold': '#F59E0B',
  Cancelled: '#EF4444',
};

export default function ProjectStatusChart() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadProjects();
  }, []);

  const data = [
    { name: 'In Progress', value: projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'Cancelled').length },
  ];

  const total = projects.length;

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
        display: 'flex',
        flexDirection: 'column',
        '&:hover': { boxShadow: '0 20px 48px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' },
      }}
    >
      {/* Custom header */}
      <Box sx={{ px: 3, pt: 3, pb: 0, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #7C3AED 0%, #a78bfa 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
          flexShrink: 0,
        }}>
          <DonutLargeRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
            Project Status
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, mt: 0.2 }}>
            Distribution by status
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ pt: 1, px: 2, pb: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '100%', height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="44%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: '1px solid #e8edf2',
                  fontSize: 13,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={9}
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => (
                  <span style={{ color: '#374151', fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <Box sx={{
            position: 'absolute',
            top: '43%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <Typography sx={{ fontSize: 30, fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: -1 }}>
              {total}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Projects
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
