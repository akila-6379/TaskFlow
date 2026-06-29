'use client';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  InputBase,
  Menu,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useEffect, useMemo, useState, MouseEvent } from 'react';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import { taskService } from '@/services/taskService';
import { Task } from '@/types';

const STATUS_OPTIONS = ['Active', 'Completed', 'On Hold', 'Cancelled'] as const;
const FILTER_OPTIONS = ['All', 'Active', 'On Hold', 'Completed'] as const;

const STATUS_CHIP: Record<string, { bg: string; color: string; border: string }> = {
  Active:    { bg: '#dbeafe', color: '#1d4ed8', border: 'rgba(59,130,246,0.20)' },
  Completed: { bg: '#dcfce7', color: '#15803d', border: 'rgba(34,197,94,0.20)' },
  'On Hold': { bg: '#ffedd5', color: '#c2410c', border: 'rgba(245,158,11,0.20)' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c', border: 'rgba(239,68,68,0.20)' },
};

const EMPTY: Omit<Project, 'id'> = {
  projectName: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  progress: 0,
};

const getStatusStyles = (status: string) => STATUS_CHIP[status] ?? STATUS_CHIP.Active;
const getProgressColor = (progress: number) => {
  if (progress <= 40) return '#2563EB';
  if (progress <= 70) return '#f59e0b';
  return '#16a34a';
};

const getProjectIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('hospital') || lower.includes('health') || lower.includes('medical')) {
    return {
      icon: <LocalHospitalRoundedIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg, #2563EB 0%, #60a5fa 100%)',
      shadow: 'rgba(37,99,235,0.22)',
    };
  }
  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('warehouse') || lower.includes('supply')) {
    return {
      icon: <InventoryRoundedIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      shadow: 'rgba(245,158,11,0.22)',
    };
  }
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('wage')) {
    return {
      icon: <AttachMoneyRoundedIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
      shadow: 'rgba(34,197,94,0.22)',
    };
  }
  if (lower.includes('crm') || lower.includes('customer') || lower.includes('client')) {
    return {
      icon: <PeopleRoundedIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      shadow: 'rgba(139,92,246,0.22)',
    };
  }
  if (lower.includes('hr') || lower.includes('human resource') || lower.includes('people')) {
    return {
      icon: <PersonRoundedIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      shadow: 'rgba(59,130,246,0.22)',
    };
  }
  return {
    icon: <FolderRoundedIcon sx={{ fontSize: 20 }} />,
    gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    shadow: 'rgba(100,116,139,0.22)',
  };
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY);
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<(typeof FILTER_OPTIONS)[number]>('All');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [animate, setAnimate] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      const tasksData = await taskService.getAll();
      setProjects(data);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimate(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchValue, filterStatus, pageSize]);

  const openAdd = () => { setEditData(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p: Project) => { setEditData(p); setForm(p); setOpen(true); };

  const handleSave = async () => {
    try {
      if (editData) {
        await projectService.update(Number(editData.id), { ...form, id: editData.id });
      } else {
        await projectService.create(form);
      }
      await loadProjects();
      setOpen(false);
      setEditData(null);
      setForm(EMPTY);
    } catch (error) {
      console.error('Error saving project', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await projectService.remove(id);
      await loadProjects();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  const handleFilterClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (value: (typeof FILTER_OPTIONS)[number]) => {
    setFilterStatus(value);
    handleFilterClose();
  };

  const filteredProjects = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
      if (!matchesStatus) return false;

      if (!query) return true;
      const combined = [
        project.projectName,
        project.description,
        project.status,
        formatDate(project.startDate),
        formatDate(project.endDate),
      ].join(' ').toLowerCase();
      return combined.includes(query);
    });
  }, [projects, searchValue, filterStatus]);

  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const visibleProjects = filteredProjects.slice(page * pageSize, page * pageSize + pageSize);

  const handleExport = () => {
    const rows = filteredProjects.map((project) => [
      project.projectName,
      project.description,
      project.status,
      formatDate(project.startDate),
      formatDate(project.endDate),
      `${project.progress}%`,
    ]);

    const header = ['Project Name', 'Description', 'Status', 'Start Date', 'End Date', 'Progress (%)'];
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const fileName = `Projects_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}_${String(new Date().getDate()).padStart(2, '0')}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Project Management"
        subtitle={`${projects.length} projects total`}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openAdd}
            disableElevation
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: 14,
              px: 2.5,
              py: 1.1,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
                transform: 'translateY(-2px) scale(1.03)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            Add Project
          </Button>
        }
      />

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px', boxShadow: '0 18px 45px rgba(15,23,42,0.08)', bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 340 }, px: 2, py: 1.1,
                borderRadius: '20px', boxShadow: '0 12px 28px rgba(15,23,42,0.06)', bgcolor: '#fff', border: '1px solid #e2e8f0',
              }}
            >
              <SearchRoundedIcon sx={{ color: '#94a3b8' }} />
              <InputBase
                placeholder="Search projects, status, or dates"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                fullWidth
                sx={{ fontSize: 14, color: '#334155' }}
              />
            </Paper>

            <Button
              variant="outlined"
              startIcon={<FilterAltRoundedIcon />}
              onClick={handleFilterClick}
              sx={{
                borderRadius: '20px', textTransform: 'none', borderColor: '#cbd5e1', color: '#1d4ed8', fontWeight: 600,
                boxShadow: '0 10px 24px rgba(59,130,246,0.08)',
              }}
            >
              Filter: {filterStatus}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleFilterClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              disableRestoreFocus
              PaperProps={{ sx: { borderRadius: '16px', minWidth: 180 } }}
            >
              {FILTER_OPTIONS.map((option) => (
                <MenuItem
                  key={option}
                  selected={filterStatus === option}
                  onClick={() => handleFilterSelect(option)}
                  sx={{ textTransform: 'none' }}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end', width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleExport}
              sx={{ borderRadius: '20px', textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 600 }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0', mb: 3 }} />

        {loading ? (
          <Typography sx={{ color: '#64748b', textAlign: 'center', py: 8 }}>Loading projects...</Typography>
        ) : visibleProjects.length === 0 ? (
          <Typography sx={{ color: '#64748b', textAlign: 'center', py: 8 }}>No projects match your search or filter.</Typography>
        ) : (
          <Stack spacing={2}>
            {visibleProjects.map((project) => {
              const iconConfig = getProjectIcon(project.projectName);
              const statusStyle = getStatusStyles(project.status);
              const progressValue = animate ? Number(project.progress ?? 0) : 0;

              return (
                <Paper
                  key={project.id}
                  sx={{
                    p: 3,
                    borderRadius: '20px',
                    bgcolor: '#fff',
                    boxShadow: '0 15px 30px rgba(15,23,42,0.06)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 22px 42px rgba(14,95,255,0.12)',
                      bgcolor: '#f8fbff',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '18px',
                        background: iconConfig.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 18px 38px ${iconConfig.shadow}`,
                        flexShrink: 0,
                      }}>
                        {iconConfig.icon}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, mb: 0.5 }}>
                          {project.projectName}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.description || 'No description available'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => openEdit(project)}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '14px',
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: '#dbeafe', transform: 'translateY(-1px)' },
                          }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => setDeleteId(project.id)}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '14px',
                            bgcolor: '#fef2f2',
                            color: '#dc2626',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: '#fecaca', transform: 'translateY(-1px)' },
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#e2e8f0', my: 3 }} />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                          Progress
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{
                          height: 12,
                          borderRadius: 999,
                          bgcolor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            bgcolor: getProgressColor(Number(project.progress ?? 0)),
                            transition: 'all 1s ease',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          borderRadius: '20px',
                          fontWeight: 700,
                          px: 1.75,
                          py: 0.7,
                          boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
                          bgcolor: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      />
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                        End date {formatDate(project.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography sx={{ color: '#64748b', fontSize: 13 }}>
              {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} found
            </Typography>
            <TextField
              select
              size="small"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              sx={{ width: 110, borderRadius: '16px' }}
              InputProps={{ sx: { borderRadius: '16px', bgcolor: '#f8fafc' } }}
            >
              <MenuItem value={10}>10 rows</MenuItem>
              <MenuItem value={25}>25 rows</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ChevronLeftRoundedIcon />}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              sx={{ textTransform: 'none', borderRadius: '14px', minWidth: 96 }}
            >
              Prev
            </Button>
            <Typography sx={{ color: '#475569', fontSize: 13 }}>
              Page {Math.min(page + 1, pageCount)} of {pageCount}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ChevronRightRoundedIcon />}
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
              disabled={page >= pageCount - 1}
              sx={{ textTransform: 'none', borderRadius: '14px', minWidth: 96 }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth closeAfterTransition={false} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editData ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              size="small"
              label="Project Name"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'none' }}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Progress (%)"
              type="number"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disableElevation sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            {editData ? 'Save Changes' : 'Add Project'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={() => handleDelete(Number(deleteId))}
        onCancel={() => setDeleteId(null)}
      />
    </MainLayout>
  );
}
