'use client';
import { capDateYear } from '@/utils/dateUtils';
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
  Menu,
  Avatar,
  InputAdornment,
  Slider,
  Fade,
  useTheme,
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
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useEffect, useMemo, useState, MouseEvent } from 'react';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import { taskService } from '@/services/taskService';
import { Task } from '@/types';

const STATUS_OPTIONS = ['In Progress', 'Completed', 'On Hold', 'Cancelled'] as const;
const FILTER_OPTIONS = ['All', 'In Progress', 'On Hold', 'Completed'] as const;

const STATUS_CHIP: Record<string, { bg: string; color: string; border: string }> = {
  'In Progress': { bg: '#dbeafe', color: '#1d4ed8', border: 'rgba(59,130,246,0.20)' },
  Completed: { bg: '#dcfce7', color: '#15803d', border: 'rgba(34,197,94,0.20)' },
  'On Hold': { bg: '#ffedd5', color: '#c2410c', border: 'rgba(245,158,11,0.20)' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c', border: 'rgba(239,68,68,0.20)' },
};

const EMPTY: Omit<Project, 'id'> = {
  projectName: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'In Progress',
  progress: 0,
};

const getStatusStyles = (status: string) => STATUS_CHIP[status] ?? STATUS_CHIP['In Progress'];
// Case 3: progress bar color is driven by project status, not the percentage value
const getProgressColorByStatus = (status: string) => {
  switch (status) {
    case 'In Progress': return '#2563EB';  // blue
    case 'Completed':   return '#16a34a';  // green
    case 'On Hold':     return '#f59e0b';  // orange
    case 'Cancelled':   return '#ef4444';  // red
    default:            return '#2563EB';
  }
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

// Bug 9: use a single consistent display format (dd-mm-yyyy) across all project cards
const formatDate = (value: string) => {
  if (!value) return '';
  // Handles both 'YYYY-MM-DD' and ISO 'YYYY-MM-DDTHH:mm:ss' strings
  const dateStr = value.substring(0, 10); // take YYYY-MM-DD part
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
};

// Bug 2 & 3: the backend returns ISO datetime strings (e.g. "2024-01-15T00:00:00").
// HTML <input type="date"> requires exactly "YYYY-MM-DD".  This helper trims the time part.
const toDateInputValue = (value: string): string => {
  if (!value) return '';
  return value.substring(0, 10); // keep only YYYY-MM-DD
};

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    minHeight: 52,
    backgroundColor: 'background.paper',
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'text.disabled' },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputLabel-root': { color: 'text.secondary', fontWeight: 600 },
  '& .MuiInputBase-input': { fontSize: '15px', fontWeight: 500, color: 'text.primary' },
  '& .MuiOutlinedInput-input': { fontSize: '15px', fontWeight: 500, color: 'text.primary' },
  '& .MuiSelect-select': { fontSize: '15px', fontWeight: 500, color: 'text.primary' },
};

export default function ProjectsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Bug 4 & 5: prevents duplicate submissions from rapid button clicks
  const [isSaving, setIsSaving] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Bug 13: Project Name required
    if (!form.projectName || !form.projectName.trim()) {
      errs.projectName = 'Project Name is required.';
    } else {
      // Bug 6: Duplicate project name check (allow same name for the project being edited)
      const duplicate = projects.some(
        (p) =>
          p.projectName.trim().toLowerCase() === form.projectName.trim().toLowerCase() &&
          p.id !== editData?.id
      );
      if (duplicate) {
        errs.projectName = 'Project name already exists.';
      }
    }

    // Bug 13: Start Date required
    if (!form.startDate) {
      errs.startDate = 'Start Date is required.';
    }

    // Bug 13: End Date required + End Date cannot be before Start Date
    if (!form.endDate) {
      errs.endDate = 'End Date is required.';
    } else if (form.startDate && form.endDate < form.startDate) {
      errs.endDate = 'End Date cannot be earlier than Start Date.';
    }

    // Bug 13: Description required
    if (!form.description || !form.description.trim()) {
      errs.description = 'Description is required.';
    }

    // Bug 13: Progress must be 0–100
    const prog = Number(form.progress);
    if (isNaN(prog) || prog < 0 || prog > 100) {
      errs.progress = 'Progress must be between 0 and 100.';
    }

    // Bug 12: Completed project must always have Progress = 100
    if (form.status === 'Completed' && prog !== 100) {
      errs.progress = 'Completed projects must have 100% progress.';
    }

    return errs;
  }, [form, projects, editData]);

  // Bug 4 & 5: also disabled while a save is in-flight to prevent double-click duplicates
  const isSaveDisabled = Object.keys(validationErrors).length > 0 || isSaving;

  const handleFieldChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      const mappedProjects = data.map((p: Project) => ({
        ...p,
        status: (p.status as string) === 'Active' ? 'In Progress' : p.status,
      }));
      // Case 14: Newest Project ID first
      mappedProjects.sort((a, b) => Number(b.id) - Number(a.id));
      
      const tasksData = await taskService.getAll();
      setProjects(mappedProjects);
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

  const openAdd = () => {
    // Bug 1: always reset to a fresh EMPTY state so progress, dates, etc. start clean
    setEditData(null);
    setForm({ ...EMPTY, progress: 0 }); // explicit spread prevents any accidental mutation
    setTouched({});
    setIsSaving(false);
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditData(p);
    setForm({
      ...p,
      status: (p.status as string) === 'Active' ? 'In Progress' : p.status,
      // Bug 2 & 3: trim ISO datetime to YYYY-MM-DD so <input type="date"> renders correctly
      startDate: toDateInputValue(p.startDate),
      endDate: toDateInputValue(p.endDate),
    });
    // Bug 7: mark ALL fields touched so validation errors show immediately on open
    setTouched({
      projectName: true,
      startDate: true,
      endDate: true,
      description: true,
      progress: true,
      status: true,
    });
    setIsSaving(false);
    setOpen(true);
  };

  const handleSave = async () => {
    // Bug 4 & 5: isSaving guards against concurrent calls from rapid double-clicks
    if (isSaveDisabled) {
      return;
    }
    setIsSaving(true);
    try {
      if (editData) {
        await projectService.update(Number(editData.id), { ...form, id: editData.id });
      } else {
        await projectService.create(form);
      }
      // Bug 11: re-fetch the authoritative list from the server (no local duplication)
      await loadProjects();
      setOpen(false);
      setEditData(null);
      setForm({ ...EMPTY, progress: 0 });
      setTouched({});
      // isSaving intentionally NOT reset here — dialog closes on success
    } catch (error) {
      console.error('Error saving project', error);
      // Bug 5: re-enable Save button only on failure so user can retry
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const hasLinkedTasks = tasks.some(t => Number(t.projectId) === id);
    if (hasLinkedTasks) {
      setAlertMessage("This project cannot be deleted because it contains linked tasks.");
      setAlertOpen(true);
      setDeleteId(null);
      return;
    }
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
              background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 4px 12px rgba(37,99,235,0.25)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: isDark ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 6px 18px rgba(37,99,235,0.35)',
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

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '20px', boxShadow: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Search projects, status, or dates"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '10px',
                  fontSize: 13,
                  height: 40,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.disabled' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
              }}
              sx={{ width: { xs: '100%', sm: 340 } }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterAltRoundedIcon />}
              onClick={handleFilterClick}
              sx={{
                borderRadius: '10px', textTransform: 'none', borderColor: filterStatus !== 'All' ? 'primary.main' : 'divider',
                color: filterStatus !== 'All' ? 'primary.main' : 'text.primary', fontWeight: 600, fontSize: 13,
                height: 40, px: 2,
                bgcolor: filterStatus !== 'All' ? 'action.selected' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled', transform: 'translateY(-1px)' },
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
              PaperProps={{ sx: { borderRadius: '16px', minWidth: 180, border: '1px solid', borderColor: 'divider' } }}
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
              variant="contained"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleExport}
              disableElevation
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 14,
                height: 44,
                px: 2.5,
                background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 4px 12px rgba(37,99,235,0.18)',
                '&:hover': {
                  background: isDark ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                  boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 6px 16px rgba(37,99,235,0.28)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>Loading projects...</Typography>
        ) : visibleProjects.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>No projects match your search or filter.</Typography>
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
                    p: 2.25,
                    borderRadius: '20px',
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 3,
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '18px',
                        background: iconConfig.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'none' : `0 18px 38px ${iconConfig.shadow}`,
                        flexShrink: 0,
                      }}>
                        {iconConfig.icon}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.25 }}>
                          {project.projectName}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.secondary', mb: 0.75 }}>
                          {project.projectId}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                            color: isDark ? '#60a5fa' : '#1d4ed8',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: isDark ? 'rgba(37,99,235,0.25)' : '#dbeafe', transform: 'translateY(-1px)' },
                          }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => {
                            const hasLinkedTasks = tasks.some(t => Number(t.projectId) === Number(project.id));
                            if (hasLinkedTasks) {
                              setAlertMessage("This project cannot be deleted because it contains linked tasks.");
                              setAlertOpen(true);
                            } else {
                              setDeleteId(project.id);
                            }
                          }}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '14px',
                            bgcolor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                            color: isDark ? '#f87171' : '#dc2626',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca', transform: 'translateY(-1px)' },
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.75 }} />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%', minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary' }}>
                          Progress
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{
                          height: 12,
                          borderRadius: 999,
                          bgcolor: 'divider',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            bgcolor: getProgressColorByStatus(project.status),
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
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
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
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} found
            </Typography>
            <TextField
              select
              size="small"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              sx={{ width: 110, borderRadius: '16px' }}
              InputProps={{ sx: { borderRadius: '16px', bgcolor: 'action.hover' } }}
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
              sx={{ textTransform: 'none', borderRadius: '14px', minWidth: 96, borderColor: 'divider', color: 'text.primary', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' } }}
            >
              Prev
            </Button>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              Page {Math.min(page + 1, pageCount)} of {pageCount}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ChevronRightRoundedIcon />}
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
              disabled={page >= pageCount - 1}
              sx={{ textTransform: 'none', borderRadius: '14px', minWidth: 96, borderColor: 'divider', color: 'text.primary', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' } }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ── Add / Edit Project Dialog ── */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        closeAfterTransition={false}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 180 }}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: 24,
            background: 'background.paper',
            overflow: 'hidden',
            maxWidth: 860,
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3.5, pt: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', borderRadius: '14px' }}>
              <FolderRoundedIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'text.primary' }}>
                {editData ? 'Edit Project' : 'Add New Project'}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, color: 'text.secondary', mt: 0.4 }}>
                {editData ? 'Update project details and save your changes.' : 'Create a new project and track its progress.'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              width: 40, height: 40,
              borderRadius: '12px',
              bgcolor: 'action.hover',
              color: 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'action.selected', transform: 'translateY(-1px)' },
            }}
            aria-label="Close project dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* ── Form Body ── */}
        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

            {/* LEFT col, row 1 — Project ID (Read-only) */}
            <TextField
              size="small"
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                  <BadgeRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  <span>Project ID</span>
                </Box>
              }
              value={editData ? (form.projectId ?? '') : 'Auto-generated'}
              disabled={true}
              fullWidth
              sx={[fieldStyles, { gridColumn: { xs: '1', md: '1' }, gridRow: { md: '1' } }]}
            />

            {/* RIGHT col, row 1 — Project Name */}
            <TextField
              size="small"
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                  <FolderRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  <span>Project Name</span>
                </Box>
              }
              placeholder="e.g. E-Commerce Platform"
              value={form.projectName}
              onChange={e => handleFieldChange('projectName', e.target.value)}
              onBlur={() => handleBlur('projectName')}
              error={Boolean(touched.projectName && validationErrors.projectName)}
              helperText={touched.projectName && validationErrors.projectName ? validationErrors.projectName : ''}
              fullWidth
              sx={[fieldStyles, { gridColumn: { xs: '1', md: '2' }, gridRow: { md: '1' } }]}
            />

            {/* LEFT col, row 2 — Start Date */}
            <TextField
              size="small"
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                  <CalendarMonthRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  <span>Start Date</span>
                </Box>
              }
              type="date"
              value={form.startDate}
              onChange={e => handleFieldChange('startDate', capDateYear(e.target.value))}
              onBlur={() => handleBlur('startDate')}
              error={Boolean(touched.startDate && validationErrors.startDate)}
              helperText={touched.startDate && validationErrors.startDate ? validationErrors.startDate : ''}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: '9999-12-31' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: { xs: '1', md: '1' }, gridRow: { md: '2' } }]}
            />

            {/* RIGHT col, row 2 — End Date */}
            <TextField
              size="small"
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                  <CalendarMonthRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  <span>End Date</span>
                </Box>
              }
              type="date"
              value={form.endDate}
              onChange={e => handleFieldChange('endDate', capDateYear(e.target.value))}
              onBlur={() => handleBlur('endDate')}
              error={Boolean(touched.endDate && validationErrors.endDate)}
              helperText={touched.endDate && validationErrors.endDate ? validationErrors.endDate : ''}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: '9999-12-31' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: { xs: '1', md: '2' }, gridRow: { md: '2' } }]}
            />

            {/* LEFT col, row 3 — Status & Description grouped together to eliminate empty space */}
            <Box sx={{
              gridColumn: { xs: '1', md: '1' },
              gridRow: { md: '3' },
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              <TextField
                size="small"
                select
                label={
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                    <TrendingUpRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                    <span>Status</span>
                  </Box>
                }
                value={form.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Project['status'];
                  const newProgress = newStatus === 'Completed' ? 100 : form.progress;
                  setForm({ ...form, status: newStatus, progress: newProgress });
                }}
                fullWidth
                SelectProps={{
                  renderValue: (val: unknown) => {
                    const v = val as string;
                    const dotMap: Record<string, string> = {
                      'In Progress': '#2563EB', Completed: '#16a34a', 'On Hold': '#f59e0b', Cancelled: '#ef4444',
                    };
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotMap[v] ?? '#94a3b8', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: 'text.primary' }}>{v}</Typography>
                      </Box>
                    );
                  },
                }}
                sx={fieldStyles}
              >
                {STATUS_OPTIONS.map((s) => {
                  const dotMap: Record<string, string> = {
                    'In Progress': '#2563EB', Completed: '#16a34a', 'On Hold': '#f59e0b', Cancelled: '#ef4444',
                  };
                  return (
                    <MenuItem key={s} value={s} sx={{ py: 1.25, minHeight: 48 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotMap[s], flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{s}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                size="small"
                label={
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                    <span>Description</span>
                  </Box>
                }
                placeholder="Briefly describe the project scope and goals…"
                value={form.description}
                onChange={(e) => {
                  handleFieldChange('description', e.target.value);
                  const ta = e.target as HTMLTextAreaElement;
                  ta.style.height = 'auto';
                  ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
                  ta.style.overflowY = ta.scrollHeight > 160 ? 'auto' : 'hidden';
                }}
                onBlur={() => handleBlur('description')}
                error={Boolean(touched.description && validationErrors.description)}
                helperText={touched.description && validationErrors.description ? validationErrors.description : ''}
                fullWidth
                multiline
                sx={[
                  fieldStyles,
                  {
                    '& .MuiInputBase-root': { padding: '8px 14px', alignItems: 'flex-start' },
                    '& textarea': {
                      resize: 'none',
                      minHeight: '1.4375em',
                      height: '1.4375em',
                      overflowY: 'hidden',
                      transition: 'height 0.15s ease',
                      boxSizing: 'content-box',
                    },
                  },
                ]}
              />
            </Box>

            {/* RIGHT col, row 3 — Progress (numeric + slider) */}
            <Box sx={{
              gridColumn: { xs: '1', md: '2' },
              gridRow: { md: '3' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                minHeight: 52,
                backgroundColor: 'background.paper',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'text.disabled' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
              '& .MuiInputLabel-root': { color: 'text.secondary', fontWeight: 600 },
              '& .MuiInputBase-input': { fontSize: '15px', fontWeight: 500, color: 'text.primary' },
            }}>
              <TextField
                size="small"
                label={
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                    <TrendingUpRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                    <span>Progress (%)</span>
                  </Box>
                }
                type="number"
                value={form.progress}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === '' ? 0 : Number(raw);
                  const v = Math.min(100, Math.max(0, parsed));
                  setForm(prev => ({ ...prev, progress: v }));
                  setTouched(prev => ({ ...prev, progress: true }));
                }}
                onBlur={() => handleBlur('progress')}
                error={Boolean(touched.progress && validationErrors.progress)}
                helperText={touched.progress && validationErrors.progress ? validationErrors.progress : ''}
                fullWidth
                disabled={!editData}
                inputProps={{ min: 0, max: 100 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>%</Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ px: 0.5, mt: 1.5 }}>
                <Slider
                  value={Number(form.progress)}
                  onChange={(_e, v) => {
                    setForm(prev => ({ ...prev, progress: v as number }));
                    setTouched(prev => ({ ...prev, progress: true }));
                  }}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!editData}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ]}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 18, height: 18,
                      boxShadow: 'none',
                    },
                    '& .MuiSlider-track': { height: 6, borderRadius: 999 },
                    '& .MuiSlider-rail': { height: 6, borderRadius: 999, bgcolor: 'divider' },
                    '& .MuiSlider-markLabel': { fontSize: 11, color: 'text.secondary', fontWeight: 500 },
                    '& .MuiSlider-mark': { bgcolor: 'divider' },
                  }}
                />
              </Box>
            </Box>

          </Box>

        </DialogContent>

        <Divider />

        {/* ── Footer buttons ── */}
        <DialogActions sx={{ px: 3.5, py: 3, gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            startIcon={<CloseRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'divider',
              color: 'text.primary',
              px: 2.5,
              py: 1.25,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            variant="contained"
            disableElevation
            startIcon={editData ? <SaveRoundedIcon /> : <AddRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              transition: 'all 0.2s ease',
              '&.Mui-disabled': {
                background: 'action.disabledBackground',
                color: 'action.disabled',
                boxShadow: 'none',
              }
            }}
          >
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

      <Dialog 
        open={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        maxWidth="xs" 
        fullWidth 
        closeAfterTransition={false} 
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cannot Delete Project</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {alertMessage}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAlertOpen(false)} variant="contained" disableElevation sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
