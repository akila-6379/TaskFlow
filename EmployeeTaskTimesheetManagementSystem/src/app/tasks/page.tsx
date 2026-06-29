'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
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
  registration: { icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} />, color: '#2563eb' },
  api: { icon: <CodeRoundedIcon sx={{ fontSize: 18 }} />, color: '#7c3aed' },
  dashboard: { icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />, color: '#0f766e' },
  stock: { icon: <Inventory2RoundedIcon sx={{ fontSize: 18 }} />, color: '#b45309' },
  salary: { icon: <AnalyticsRoundedIcon sx={{ fontSize: 18 }} />, color: '#db2777' },
  payslip: { icon: <PersonRoundedIcon sx={{ fontSize: 18 }} />, color: '#1d4ed8' },
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const employeeOptions = useMemo(
    () => employees.map(emp => ({
      id: Number(emp.id),
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
    flex: 1,
    minWidth: 260,
    renderCell: ({ row }) => {
      const meta = getTaskTypeMeta(row.title);
      return (
        <Tooltip title={row.title}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%', minHeight: 72, width: '100%' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${meta.color}14`, color: meta.color, flexShrink: 0 }}>
              {meta.icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>Enterprise workflow</Typography>
            </Box>
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
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', minHeight: 72 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {emp?.name?.charAt(0) ?? 'U'}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>{emp ? emp.name : 'Unassigned'}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>{emp ? `(${emp.employeeId})` : `#${value}`}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'projectId',
    headerName: 'Project',
    width: 220,
    renderCell: ({ value }) => {
      const proj = projects.find(p => Number(p.id) === value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', minHeight: 72 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f3ff', color: '#6d28d9', flexShrink: 0 }}>
            <FolderRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>{proj ? proj.projectName : 'Unassigned'}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>{proj ? `(${proj.id})` : `#${value}`}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 170,
    renderCell: ({ value }) => {
      const info = getDueDateInfo(value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', minHeight: 72 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: info.isOverdue ? '#fef2f2' : '#eff6ff', color: info.isOverdue ? '#dc2626' : '#2563eb', flexShrink: 0 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>
              {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
            </Typography>
            <Typography variant="caption" sx={{ color: info.isOverdue ? '#dc2626' : '#64748b', display: 'block', mt: 0.1 }}>{info.label}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: ({ value }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', minHeight: 72 }}>
        <StyleChip value={value} map={STATUS_STYLE} />
      </Box>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 110,
    sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', minHeight: 72 }}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => openEdit(row)}
            sx={{ color: '#2563eb', bgcolor: '#eff6ff', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#dbeafe', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}
          >
            <EditRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => setDeleteId(row.id)}
            sx={{ color: '#dc2626', bgcolor: '#fef2f2', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#fee2e2', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}
          >
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

  const gridSx = {
    border: 'none',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
    background: '#fff',
    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e8ecf5' },
    '& .MuiDataGrid-columnHeader': { textTransform: 'uppercase', letterSpacing: 0.4 },
    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fbff' },
    '& .MuiDataGrid-cell': { borderColor: '#f0f2f5', fontSize: 13, py: 1.2, display: 'flex', alignItems: 'center' },
    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e8ecf5', background: '#fcfdff', px: 1.5, py: 1 },
    '& .MuiTablePagination-root': { color: '#475569' },
    '& .MuiTablePagination-actions button': { borderRadius: '999px' },
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
            sx={gridSx}
          />
        </Paper>
      </Box>

      {/* Add / Edit dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditData(null); setForm({ ...EMPTY }); }} maxWidth="sm" fullWidth
        closeAfterTransition={false}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editData ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

  <TextField
    size="small"
    label="Task Title"
    value={form.title}
    onChange={(e) =>
      setForm({
        ...form,
        title: e.target.value,
      })
    }
    fullWidth
    sx={{ gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
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
        label="Employee"
        fullWidth
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <PersonRoundedIcon sx={{ color: '#64748b' }} />
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px', minHeight: 46 } }}
      />
    )}
    renderOption={(props, option) => {
      const { key, ...otherProps } = props;
      return (
        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          <Typography>{option.label}</Typography>
        </Box>
      );
    }}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    noOptionsText="No employees found"
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
        label="Project"
        fullWidth
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <FolderRoundedIcon sx={{ color: '#64748b' }} />
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px', minHeight: 46 } }}
      />
    )}
    renderOption={(props, option) => {
      const { key, ...otherProps } = props;
      return (
        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          <Typography>{option.label}</Typography>
        </Box>
      );
    }}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    noOptionsText="No projects found"
  />

  <TextField
    size="small"
    label="Due Date"
    type="date"
    value={form.dueDate}
    onChange={(e) =>
      setForm({
        ...form,
        dueDate: e.target.value,
      })
    }
    fullWidth
    InputLabelProps={{ shrink: true }}
  />

  <TextField
    size="small"
    select
    label="Status"
    value={form.status}
    onChange={(e) =>
      setForm({
        ...form,
        status: e.target.value as Task['status'],
      })
    }
    fullWidth
    sx={{ gridColumn: '1 / -1' }}
  >
    <MenuItem value="Pending">Pending</MenuItem>
    <MenuItem value="In Progress">In Progress</MenuItem>
    <MenuItem value="Completed">Completed</MenuItem>
  </TextField>

  <TextField
    size="small"
    label="Description"
    value={form.description}
    onChange={(e) =>
      setForm({
        ...form,
        description: e.target.value,
      })
    }
    fullWidth
    multiline
    rows={3}
    sx={{ gridColumn: '1 / -1' }}
  />

</Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disableElevation
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
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