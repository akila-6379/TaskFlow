'use client';
import { capDateYear } from '@/utils/dateUtils';
import { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, IconButton, Tooltip, Paper, Divider, Typography, InputAdornment, Stack,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MainLayout    from '@/components/layout/MainLayout';
import PageHeader    from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Task, Employee, Project } from '@/types';
import { taskService } from '@/services/taskService';
import { employeeService } from '@/services/employeeService';
import { projectService } from '@/services/projectService';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Pending: { bg: '#fff7ed', color: '#c2410c' },
  'In Progress': { bg: '#eff6ff', color: '#2563eb' },
  Completed: { bg: '#ecfdf5', color: '#15803d' },
};

const TASK_TYPE_META: Record<string, { icon: JSX.Element; color: string }> = {
  registration: { icon: <DescriptionRoundedIcon sx={{ fontSize: 16 }} />, color: '#2563eb' },
  api: { icon: <CodeRoundedIcon sx={{ fontSize: 16 }} />, color: '#7c3aed' },
  dashboard: { icon: <DashboardRoundedIcon sx={{ fontSize: 16 }} />, color: '#0f766e' },
  stock: { icon: <Inventory2RoundedIcon sx={{ fontSize: 16 }} />, color: '#b45309' },
  salary: { icon: <AnalyticsRoundedIcon sx={{ fontSize: 16 }} />, color: '#db2777' },
  payslip: { icon: <PersonRoundedIcon sx={{ fontSize: 16 }} />, color: '#1d4ed8' },
};

const EMPTY: Omit<Task, 'id'> = {
  title: '',
  description: '',
  employeeId: 0,
  projectId: 0,
  status: 'Pending',
  dueDate: '',
};
function Toolbar({ employees }: { employees: Employee[] }) {
  return (
    <GridToolbarContainer sx={{ px: 2.25, py: 1.75, borderBottom: '1px solid #e8ecf5', background: '#f8fafc' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ width: '100%', alignItems: { xs: 'stretch', md: 'center' } }}>
        <GridToolbarQuickFilter
          placeholder="Search tasks by title, employee or project..."
          sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: 13, borderRadius: '999px', background: '#fff', border: '1px solid #e2e8f0', minHeight: 42 } }}
        />
        <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" startIcon={<FilterListRoundedIcon />} sx={{ borderRadius: '999px', textTransform: 'none', borderColor: '#dbe4f0', color: '#334155', px: 1.5 }}>
            Filter
          </Button>
          <TextField
            select
            size="small"
            defaultValue=""
            placeholder="Employee"
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>{employee.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            defaultValue=""
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
          <Button variant="outlined" size="small" startIcon={<DownloadRoundedIcon />} sx={{ borderRadius: '999px', textTransform: 'none', borderColor: '#dbe4f0', color: '#334155', px: 1.5 }}>
            Export
          </Button>
        </Stack>
      </Stack>
    </GridToolbarContainer>
  );
}

function StyleChip({ value, map }: { value: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[value] ?? { bg: '#f3f4f6', color: '#4b5563' };
  return (
    <Chip
      label={value}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        height: 26,
        borderRadius: '999px',
        border: '1px solid rgba(15,23,42,0.06)',
        bgcolor: s.bg,
        color: s.color,
        px: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(37,99,235,0.13)' },
        transition: 'all 0.2s ease',
      }}
    />
  );
}

function getTaskTypeMeta(title: string) {
  const normalized = title.toLowerCase();
  const match = Object.keys(TASK_TYPE_META).find((key) => normalized.includes(key));
  return match ? TASK_TYPE_META[match] : TASK_TYPE_META.registration;
}

function getDueDateInfo(value: string) {
  if (!value) return { label: 'No date', isOverdue: false };

  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return { label: 'Invalid date', isOverdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', isOverdue: true };
  if (diffDays === 0) return { label: 'Due today', isOverdue: false };
  return { label: `${diffDays} days left`, isOverdue: false };
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Pending': return '#f59e0b';
    case 'In Progress': return '#3b82f6';
    case 'Completed': return '#10b981';
    case 'Blocked': return '#ef4444';
    default: return '#64748b';
  }
}

const fieldLabel = (icon: React.ReactNode, text: string) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#334155', fontSize: 13, fontWeight: 600 }}>
    {icon}
    <Typography component="span" sx={{ fontSize: 13, fontWeight: 600 }}>{text}</Typography>
  </Box>
);

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    minHeight: 52,
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#cbd5e1',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
      boxShadow: '0 0 0 4px rgba(37,99,235,0.08)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#334155',
    fontWeight: 600,
  },
  '& .MuiInputBase-input': {
    fontSize: '15px',
    fontWeight: 500,
    color: '#111827',
  },
  '& .MuiOutlinedInput-input': {
    fontSize: '15px',
    fontWeight: 500,
    color: '#111827',
  },
  '& .MuiSelect-select': {
    fontSize: '15px',
    fontWeight: 500,
    color: '#111827',
  },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const employeeOptions = useMemo(
    () => employees.map(emp => ({
      id: Number(emp.id),
      name: emp.name,
      employeeId: emp.employeeId,
      label: `${emp.name} (${emp.employeeId})`,
    })),
    [employees],
  );

  const projectOptions = useMemo(
    () => projects.map(project => ({
      id: Number(project.id),
      label: project.projectName,
    })),
    [projects],
  );

  const loadTasks = async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    employeeService.getAll().then(setEmployees).catch(console.error);
    projectService.getAll().then(setProjects).catch(console.error);
  }, []);

  // ── local dialog state ────────────────────────────────────────────────────
  const [open, setOpen]         = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Task | null>(null);
  const [form, setForm]         = useState<Omit<Task, 'id'>>(EMPTY);

  const openAdd  = () => { setEditData(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (t: Task) => { setEditData(t); setForm({ ...t }); setOpen(true); };

  const handleSave = async () => {
    try {
      if (editData) {
        await taskService.update(editData.id, {
          ...form,
          id: editData.id,
        });
      } else {
        await taskService.create(form);
      }

      await loadTasks();
      setOpen(false);
      setEditData(null);
      setForm({ ...EMPTY });
    } catch (error) {
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Task Title',
    width: 220,
    renderCell: ({ row }) => {
      const meta = getTaskTypeMeta(row.title);
      return (
        <Tooltip title={row.title}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%', width: '100%' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${meta.color}14`, color: meta.color, flexShrink: 0 }}>
              {meta.icon}
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
              {row.title}
            </Typography>
          </Box>
        </Tooltip>
      );
    },
  },
  {
    field: 'employeeId',
    headerName: 'Employee',
    width: 200,
    renderCell: ({ value }) => {
      const emp = employees.find(e => Number(e.id) === value);
      const initial = emp?.name?.charAt(0)?.toUpperCase() ?? 'U';
      const idx = (initial.charCodeAt(0) || 0) % 7;
      const avatarBgs = ['#dbeafe','#ede9fe','#dcfce7','#fef3c7','#fce7f3','#e0f2fe','#ffedd5'];
      const avatarColors = ['#1d4ed8','#6d28d9','#15803d','#b45309','#be185d','#0369a1','#c2410c'];
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBgs[idx], color: avatarColors[idx], fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
            {initial}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: '#0f172a', lineHeight: 1.3 }}>{emp ? emp.name : 'Unassigned'}</Typography>
            <Typography sx={{ fontSize: 11.5, fontWeight: 400, color: '#64748b', lineHeight: 1.2 }}>{emp ? emp.employeeId : `#${value}`}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'projectId',
    headerName: 'Project',
    width: 250,
    renderCell: ({ value }) => {
      const proj = projects.find(p => Number(p.id) === value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FolderRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{proj ? proj.projectName : 'Unassigned'}</Typography>
        </Box>
      );
    },
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 160,
    renderCell: ({ value }) => {
      const info = getDueDateInfo(value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: info.isOverdue ? '#fef2f2' : '#f1f5f9', color: info.isOverdue ? '#dc2626' : '#64748b', flexShrink: 0 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 400, color: '#374151', lineHeight: 1.3 }}>
              {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 400, color: info.isOverdue ? '#dc2626' : '#94a3b8', lineHeight: 1.2 }}>{info.label}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: ({ value }) => {
      const s = STATUS_STYLE[value] ?? { bg: '#f3f4f6', color: '#4b5563' };
      const dotColors: Record<string, string> = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Completed: '#10b981' };
      const dot = dotColors[value] ?? '#9ca3af';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.65,
            px: 1.25, py: 0.45,
            borderRadius: '20px',
            bgcolor: s.bg,
            border: '1px solid rgba(15,23,42,0.06)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: s.color, lineHeight: 1 }}>{value}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', height: '100%' }}>
        <Tooltip title="Edit task">
          <IconButton
            size="small"
            onClick={() => openEdit(row)}
            sx={{
              width: 32, height: 32,
              borderRadius: '9px',
              bgcolor: '#eff6ff',
              color: '#2563EB',
              border: '1px solid rgba(37,99,235,0.15)',
              transition: 'all 0.25s ease',
              '&:hover': { bgcolor: '#dbeafe', transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(37,99,235,0.20)' },
            }}
          >
            <EditRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete task">
          <IconButton
            size="small"
            onClick={() => setDeleteId(row.id)}
            sx={{
              width: 32, height: 32,
              borderRadius: '9px',
              bgcolor: '#fff1f2',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.15)',
              transition: 'all 0.25s ease',
              '&:hover': { bgcolor: '#fee2e2', transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(220,38,38,0.18)' },
            }}
          >
            <DeleteRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

  const gridSx = {
    border: 'none',
    fontFamily: 'inherit',

    /* ── Column headers ── */
    '& .MuiDataGrid-columnHeaders': {
      bgcolor: '#f8fafd',
      borderBottom: '1px solid #e8edf2',
    },
    '& .MuiDataGrid-columnHeader': {
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontSize: 11,
      fontWeight: 700,
      color: '#94a3b8',
    },

    /* ── Rows ── */
    '& .MuiDataGrid-row': {
      transition: 'all 0.2s ease',
      cursor: 'default',
      borderBottom: '1px solid #f1f5f9',
    },
    '& .MuiDataGrid-row:hover': {
      bgcolor: '#fafcff',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(37,99,235,0.07)',
      zIndex: 1,
    },
    '& .MuiDataGrid-row:last-child': {
      borderBottom: 'none',
    },

    /* ── Cells ── */
    '& .MuiDataGrid-cell': {
      borderBottom: 'none',
      fontSize: 13,
      color: '#374151',
      outline: 'none !important',
    },
    '& .MuiDataGrid-cell:focus': { outline: 'none' },
    '& .MuiDataGrid-cell:focus-within': { outline: 'none' },

    /* ── Footer / pagination ── */
    '& .MuiDataGrid-footerContainer': {
      borderTop: '1px solid #f1f5f9',
      bgcolor: '#fafafa',
      px: 1,
    },
    '& .MuiTablePagination-root': {
      fontSize: 13,
      color: '#6b7280',
    },
    '& .MuiTablePagination-select': {
      borderRadius: '8px',
      fontSize: 13,
    },
    '& .MuiIconButton-root': {
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    },

    /* ── Separator lines ── */
    '& .MuiDataGrid-columnSeparator': { display: 'none' },
    '& .MuiDataGrid-withBorderColor': { borderColor: '#f1f5f9' },
  };

  return (
    <MainLayout>
      <Box sx={{ background: '#f6f8fc', minHeight: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Task Management"
          subtitle={`${tasks.length} tasks total`}
          action={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openAdd}
              disableElevation
              sx={{
                borderRadius: '999px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.25,
                py: 1,
                background: 'linear-gradient(135deg, #2563EB 0%, #6D5DF6 100%)',
                boxShadow: '0 10px 24px rgba(37,99,235,0.24)',
                '&:hover': { boxShadow: '0 14px 30px rgba(109,93,246,0.28)', transform: 'translateY(-1px)' },
                transition: 'all 0.2s ease',
              }}
            >
              Create Task
            </Button>
          }
        />

        <Paper sx={{ border: '1px solid #e8ecf5', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)', borderRadius: '20px', overflow: 'hidden', background: '#fff' }}>
          <DataGrid
            loading={loading}
            rows={tasks}
            columns={columns}
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            slots={{ toolbar: () => <Toolbar employees={employees} /> }}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={64}
            columnHeaderHeight={48}
            sx={gridSx}
          />
        </Paper>
      </Box>

      {/* Add / Edit dialog */}
      <Dialog
        open={open}
        onClose={() => { setOpen(false); setEditData(null); setForm({ ...EMPTY }); }}
        maxWidth="md"
        fullWidth
        closeAfterTransition={false}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(15,23,42,.15)',
            background: 'rgba(248,250,252,0.96)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3.5, pt: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#dbeafe', color: '#1d4ed8' }}>
              <TaskAltRoundedIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {editData ? 'Edit Task' : 'Create New Task'}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, color: '#64748B', mt: 0.5 }}>
                Add task details and assign it to the right person.
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => { setOpen(false); setEditData(null); setForm({ ...EMPTY }); }}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.88)',
              color: '#475569',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#e2e8f0', transform: 'translateY(-1px)' },
            }}
            aria-label="Close task dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            
            {/* Section: Task Details */}
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.5, mb: 0.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1e293b', letterSpacing: '0.01em' }}>
                Task Details
              </Typography>
            </Box>

            <TextField
              size="small"
              label={fieldLabel(<AssignmentRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Task Title')}
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentRoundedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: '1 / -1' }]}
            />

            <Autocomplete
              size="small"
              options={employeeOptions}
              value={employeeOptions.find(option => option.id === form.employeeId) ?? null}
              onChange={(_event, value) => {
                setForm({ ...form, employeeId: value ? value.id : 0 });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={fieldLabel(<PersonRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Employee')}
                  placeholder="Select employee"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 13, fontWeight: 700, bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                      {option.name?.charAt(0) ?? 'U'}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{option.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#64748b' }}>{option.employeeId}</Typography>
                    </Box>
                  </Box>
                );
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No employees found"
              sx={{ gridColumn: { xs: '1 / -1', md: 'span 1' } }}
            />

            <Autocomplete
              size="small"
              options={projectOptions}
              value={projectOptions.find(option => option.id === form.projectId) ?? null}
              onChange={(_event, value) => {
                setForm({ ...form, projectId: value ? value.id : 0 });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={fieldLabel(<FolderRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Project')}
                  placeholder="Select project"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FolderRoundedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(109, 93, 246, 0.1)', color: '#6D5DF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{option.label}</Typography>
                  </Box>
                );
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No projects found"
              sx={{ gridColumn: { xs: '1 / -1', md: 'span 1' } }}
            />

            <TextField
              size="small"
              label={fieldLabel(<CalendarMonthRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Due Date')}
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: capDateYear(e.target.value) })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: { xs: '1 / -1', md: 'span 1' } }]}
            />

            <TextField
              size="small"
              select
              label={fieldLabel(<TaskAltRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Status')}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
              fullWidth
              SelectProps={{
                renderValue: (value: unknown) => {
                  const selected = typeof value === 'string' ? value : '';
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getStatusColor(selected), flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: '#0f172a' }}>{selected}</Typography>
                    </Box>
                  );
                }
              }}
              sx={[fieldStyles, { gridColumn: { xs: '1 / -1', md: 'span 1' } }]}
            >
              <MenuItem value="Pending" sx={{ py: 1.25, minHeight: 52 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>Pending</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="In Progress" sx={{ py: 1.25, minHeight: 52 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3b82f6', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>In Progress</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Completed" sx={{ py: 1.25, minHeight: 52 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>Completed</Typography>
                </Box>
              </MenuItem>
            </TextField>

            <TextField
              size="small"
              label={fieldLabel(<DescriptionRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Description')}
              placeholder="Enter task description..."
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                const ta = e.target as HTMLTextAreaElement;
                ta.style.height = 'auto';
                ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
                ta.style.overflowY = ta.scrollHeight > 160 ? 'auto' : 'hidden';
              }}
              fullWidth
              multiline
              sx={[
                fieldStyles,
                {
                  gridColumn: '1 / -1',
                  '& .MuiInputBase-root': {
                    padding: '8px 14px',
                    alignItems: 'flex-start',
                  },
                  '& textarea': {
                    resize: 'none',
                    minHeight: '1.4375em',
                    height: '1.4375em',
                    overflowY: 'hidden',
                    transition: 'height 0.15s ease',
                    boxSizing: 'content-box',
                  }
                }
              ]}
            />

          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <DialogActions sx={{ px: 3.5, py: 3, gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            startIcon={<CloseRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#cbd5e1',
              color: '#475569',
              px: 2.5,
              py: 1.25,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disableElevation
            startIcon={<TaskAltRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' },
              transition: 'all 0.2s ease'
            }}
          >
            {editData ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
  open={!!deleteId}
  title="Delete Task"
  message="Are you sure you want to delete this task? This action cannot be undone."
  onConfirm={async () => {
    try {
      await taskService.remove(deleteId !);
      await loadTasks();
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  }}
  onCancel={() => setDeleteId(null)}
/>
    </MainLayout>
  );
}