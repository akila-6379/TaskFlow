'use client';
import {
  Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, LinearProgress, Typography, Box, Divider, useTheme,
} from '@mui/material';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { useEffect, useState } from 'react';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { Project, Task } from '@/types';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Active:        { bg: 'rgba(37,99,235,0.10)',  color: '#2563EB', border: 'rgba(37,99,235,0.20)'  },
  'In Progress': { bg: 'rgba(37,99,235,0.10)',  color: '#2563EB', border: 'rgba(37,99,235,0.20)'  },
  Completed:     { bg: 'rgba(34,197,94,0.10)',  color: '#16a34a', border: 'rgba(34,197,94,0.20)'  },
  'On Hold':     { bg: 'rgba(245,158,11,0.10)', color: '#d97706', border: 'rgba(245,158,11,0.20)' },
  Cancelled:     { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626', border: 'rgba(239,68,68,0.20)'  },
};

const PROGRESS_GRADIENTS: Record<string, string> = {
  Active:        'linear-gradient(90deg, #2563EB 0%, #60a5fa 100%)',
  'In Progress': 'linear-gradient(90deg, #2563EB 0%, #60a5fa 100%)',
  Completed:     'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)',
  'On Hold':     'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)',
  Cancelled:     'linear-gradient(90deg, #dc2626 0%, #f87171 100%)',
};

type ProjectIconCfg = { icon: React.ReactNode; gradient: string; shadow: string };

function getProjectIcon(name: string): ProjectIconCfg {
  const lower = name.toLowerCase();
  if (lower.includes('hospital') || lower.includes('health') || lower.includes('medical')) {
    return {
      icon: <LocalHospitalRoundedIcon sx={{ fontSize: 18 }} />,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #f87171 100%)',
      shadow: 'rgba(239,68,68,0.30)',
    };
  }
  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('warehouse')) {
    return {
      icon: <InventoryRoundedIcon sx={{ fontSize: 18 }} />,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #fcd34d 100%)',
      shadow: 'rgba(245,158,11,0.30)',
    };
  }
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('wage') || lower.includes('hr')) {
    return {
      icon: <ReceiptRoundedIcon sx={{ fontSize: 18 }} />,
      gradient: 'linear-gradient(135deg, #22C55E 0%, #4ade80 100%)',
      shadow: 'rgba(34,197,94,0.30)',
    };
  }
  return {
    icon: <FolderRoundedIcon sx={{ fontSize: 18 }} />,
    gradient: 'linear-gradient(135deg, #2563EB 0%, #60a5fa 100%)',
    shadow: 'rgba(37,99,235,0.30)',
  };
}

export default function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await projectService.getAll();
        const tasksData = await taskService.getAll();
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  // Suppress unused warning — tasks kept for future use
  void tasks;

  const headerBg   = isDark ? theme.palette.background.default : '#f8fafd';
  const rowHoverBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafd';

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? '0 12px 30px rgba(0,0,0,0.40)'
          : '0 12px 30px rgba(0,0,0,0.08)',
        borderRadius: '24px',
        transition: 'all 0.3s ease',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: isDark
            ? '0 20px 48px rgba(0,0,0,0.55)'
            : '0 20px 48px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3.5, pt: 3, pb: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #0891b2 0%, #38bdf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(8,145,178,0.30)',
            flexShrink: 0,
          }}>
            <TableChartRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              Project Progress
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 400, mt: 0.2 }}>
              {projects.length} projects total
            </Typography>
          </Box>
        </Box>

        {/* Live badge */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          px: 1.5, py: 0.6,
          borderRadius: '20px',
          bgcolor: 'rgba(34,197,94,0.10)',
          border: '1px solid rgba(34,197,94,0.22)',
        }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: '#22C55E',
            boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
          }} />
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a' }}>
            Live
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Divider sx={{ mt: 2 }} />
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: headerBg }}>
              <TableCell sx={{
                fontWeight: 700, fontSize: 11, color: 'text.secondary',
                py: 1.75, pl: 3.5, letterSpacing: 0.8, textTransform: 'uppercase',
              }}>
                Project
              </TableCell>
              <TableCell sx={{
                fontWeight: 700, fontSize: 11, color: 'text.secondary',
                py: 1.75, width: 260, letterSpacing: 0.8, textTransform: 'uppercase',
              }}>
                Progress
              </TableCell>
              <TableCell sx={{
                fontWeight: 700, fontSize: 11, color: 'text.secondary',
                py: 1.75, letterSpacing: 0.8, textTransform: 'uppercase',
              }}>
                Status
              </TableCell>
              <TableCell sx={{
                fontWeight: 700, fontSize: 11, color: 'text.secondary',
                py: 1.75, pr: 3.5, letterSpacing: 0.8, textTransform: 'uppercase',
              }}>
                End Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => {
              const cfg = getProjectIcon(p.projectName);
              const statusStyle = STATUS_STYLE[p.status] ?? STATUS_STYLE['Active'];
              const progressGradient = PROGRESS_GRADIENTS[p.status] ?? PROGRESS_GRADIENTS['Active'];

              return (
                <TableRow
                  key={p.id}
                  sx={{
                    '&:last-child td': { border: 0 },
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                    '&:hover': {
                      bgcolor: rowHoverBg,
                      '& .project-name': { color: '#2563EB' },
                    },
                  }}
                >
                  {/* Project name + icon */}
                  <TableCell sx={{ py: 2.5, pl: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <Box sx={{
                        width: 38, height: 38,
                        borderRadius: '11px',
                        background: cfg.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 4px 12px ${cfg.shadow}`,
                        '& svg': { color: '#fff' },
                      }}>
                        {cfg.icon}
                      </Box>
                      <Typography
                        className="project-name"
                        sx={{ fontWeight: 700, color: 'text.primary', fontSize: 13.5, transition: 'color 0.2s ease' }}
                      >
                        {p.projectName}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Progress bar */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Number(p.progress ?? 0)}
                        sx={{
                          flex: 1,
                          height: 9,
                          borderRadius: 10,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 10,
                            background: progressGradient,
                            transition: 'transform 1s cubic-bezier(0.4,0,0.2,1)',
                          },
                        }}
                      />
                      <Typography sx={{
                        minWidth: 36, fontWeight: 800,
                        color: 'text.primary', fontSize: 13,
                        textAlign: 'right',
                      }}>
                        {Number(p.progress ?? 0)}%
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Status chip */}
                  <TableCell>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      px: 1.25, py: 0.55,
                      borderRadius: '20px',
                      bgcolor: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                    }}>
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: statusStyle.color, flexShrink: 0,
                      }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: statusStyle.color }}>
                        {p.status}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* End date */}
                  <TableCell sx={{ py: 2.5, pr: 3.5 }}>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
                      {new Date(p.endDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
