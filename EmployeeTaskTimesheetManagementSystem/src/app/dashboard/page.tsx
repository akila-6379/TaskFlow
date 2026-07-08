'use client';
import Grid from '@mui/material/Grid2';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { Box, Typography } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import ProjectProgress from '@/components/dashboard/ProjectProgress';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import ProjectStatusChart from '@/components/dashboard/ProjectStatusChart';
import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalTasks: 0,
    hoursLogged: 0,
    employeesLoggedToday: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      }
    };
    loadStats();
  }, []);

  const STAT_CARDS = [
    {
      title: 'Employees Logged Today',
      value: stats.employeesLoggedToday,
      icon: <PeopleRoundedIcon />,
      color: '#2563EB',
      subtitle: 'Unique employees logged today',
      trend: '↑ 8%',
      trendColor: '#22C55E',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: <FolderRoundedIcon />,
      color: '#7C3AED',
      subtitle: 'Currently in progress',
      trend: '↑ 12%',
      trendColor: '#22C55E',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <AssignmentRoundedIcon />,
      color: '#F59E0B',
      subtitle: 'All tasks',
      trend: '↑ 5%',
      trendColor: '#22C55E',
    },
    {
      title: 'Hours Logged',
      value: stats.hoursLogged,
      icon: <AccessTimeRoundedIcon />,
      color: '#0891b2',
      subtitle: 'Total hours across all entries',
      trend: '↑ 3%',
      trendColor: '#22C55E',
    },
  ];

  return (
    <MainLayout>
      {/* Page wrapper */}
      <Box sx={{
        minHeight: '100%',
        bgcolor: 'background.default',
        mx: -3,
        mt: -3,
        px: 3,
        pt: 3,
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
        /* Subtle radial blue glow behind charts */
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.045) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}>

        {/* Welcome banner */}
        <Box sx={{ mb: 3.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 5, height: 32, borderRadius: 4,
              background: 'linear-gradient(180deg, #2563EB 0%, #7C3AED 100%)',
              flexShrink: 0,
            }} />
            <Box>
              <Typography sx={{
                fontSize: 22, fontWeight: 800, color: 'text.primary', lineHeight: 1.2, letterSpacing: -0.5,
              }}>
                Welcome back, Admin 👋
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', fontWeight: 400, mt: 0.3 }}>
                Here&apos;s your project overview for today.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Row 1 — 4 KPI cards */}
        <Grid container spacing={2.5} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
          {STAT_CARDS.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* Row 2 — trend chart + project donut */}
        <Grid container spacing={2.5} sx={{ mb: 3, position: 'relative', zIndex: 1 }} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8 }}>
            <TeamPerformance />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ProjectStatusChart />
          </Grid>
        </Grid>

        {/* Row 3 — project progress full width */}
        <Grid container spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid size={{ xs: 12 }}>
            <ProjectProgress />
          </Grid>
        </Grid>

      </Box>
    </MainLayout>
  );
}
