'use client';
import { capDateYear, formatDateToDMY } from '@/utils/dateUtils';
import { useState, useMemo, useEffect } from 'react';
import { timesheetService } from '@/services/timesheetService';
import { employeeService } from '@/services/employeeService';
import { projectService } from '@/services/projectService';
import {
  Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, IconButton, Tooltip, Paper, Divider,
  Card, CardContent, Grid, Stack, Chip, Avatar, InputAdornment, Fade, MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Timesheet, Employee, Project, Task } from '@/types';
import { taskService } from '@/services/taskService';
import { useTheme } from "@mui/material/styles";

const EMPTY: Omit<Timesheet, 'id'> = {
  employeeId: 0, projectId: 0, workDate: '', hoursWorked: 1, description: '',
};

function Toolbar({
  searchValue,
  onSearchChange,
  employeeValue,
  onEmployeeChange,
  projectValue,
  onProjectChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onExport,
  employeeOptions,
  projectOptions,
  dateRangeError,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  employeeValue: number | null;
  onEmployeeChange: (value: number | null) => void;
  projectValue: number | null;
  onProjectChange: (value: number | null) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onExport: () => void;
  employeeOptions: Array<{ id: number; label: string }>;
  projectOptions: Array<{ id: number; label: string }>;
  dateRangeError: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <GridToolbarContainer sx={{ px: 2.25, py: 1.75, borderBottom: '1px solid', borderColor: 'divider', background: 'background.paper' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} sx={{ width: '100%', alignItems: { xs: 'stretch', lg: 'center' } }}>
        <TextField
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search timesheets"
          size="small"
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flex: 1, minWidth: { xs: '100%', lg: 260 }, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: 'action.hover' } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Autocomplete
            size="small"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.id === employeeValue) ?? null}
            onChange={(_, value) => onEmployeeChange(value ? value.id : null)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Employee" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: 'action.hover' } }} />}
            noOptionsText="No employees found"
          />
          <Autocomplete
            size="small"
            options={projectOptions}
            value={projectOptions.find((option) => option.id === projectValue) ?? null}
            onChange={(_, value) => onProjectChange(value ? value.id : null)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Project" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: 'action.hover' } }} />}
            noOptionsText="No projects found"
          />
          <TextField
            label="From"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => onDateFromChange(capDateYear(e.target.value))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: '9999-12-31' }}
            error={Boolean(dateRangeError)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: 'action.hover' } }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => onDateToChange(capDateYear(e.target.value))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: '9999-12-31' }}
            error={Boolean(dateRangeError)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: 'action.hover' } }}
          />
          {dateRangeError && (
            <Typography sx={{ fontSize: 12, color: 'error.main', alignSelf: 'center', whiteSpace: 'nowrap' }}>
              {dateRangeError}
            </Typography>
          )}
          <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={onExport} disableElevation sx={{
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 700,
            px: 2,
            background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 4px 12px rgba(37,99,235,0.18)',
            '&:hover': {
              background: isDark ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
              boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 6px 16px rgba(37,99,235,0.28)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}>
            Export
          </Button>
        </Stack>
      </Stack>
    </GridToolbarContainer>
  );
}

function SummaryCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string | number; sub: string; icon: React.ReactNode; color: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '20px',
        boxShadow: 2,
        background: 'background.paper',
        transition: 'all 0.25s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.7 }}>
            {label}
          </Typography>
          <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: isDark ? 'rgba(37,99,235,0.15)' : `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 20 } }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 0.25 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{sub}</Typography>
      </CardContent>
      <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.2) 100%)` }} />
    </Card>
  );
}

export default function TimesheetsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // ── global state ──────────────────────────────────────────────────────────

  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const employeeOptions = useMemo(
    () => employees.map(e => ({ id: Number(e.id), label: `${e.name} (${e.employeeId})` })),
    [employees],
  );

  // All projects for toolbar filter
  const projectOptions = useMemo(
    () => projects.map(p => ({ id: Number(p.id), label: p.projectName })),
    [projects],
  );



  const loadTimesheets = async () => {
    try {
      const data = await timesheetService.getAll();
      setTimesheets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
    employeeService.getAll().then(setEmployees).catch(console.error);
    projectService.getAll().then(setProjects).catch(console.error);
    taskService.getAll().then(setTasks).catch(console.error);
  }, []);

  // ── local dialog state ────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Timesheet | null>(null);
  const [form, setForm] = useState<Omit<Timesheet, 'id'>>(EMPTY);
  const [formError, setFormError] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);
  const [projectFilter, setProjectFilter] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const dateRangeError = useMemo(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return 'From Date cannot be later than To Date.';
    }
    return '';
  }, [dateFrom, dateTo]);

  const taskOptions = useMemo(() => {
    if (!form.employeeId || !form.projectId) return [];
    return tasks
      .filter(t => Number(t.employeeId) === Number(form.employeeId) && Number(t.projectId) === Number(form.projectId))
      .map(t => ({
        id: t.id,
        label: t.taskId || `TK${t.id}`,
        title: t.title,
        projectId: t.projectId
      }));
  }, [tasks, form.employeeId, form.projectId]);

  // Projects filtered by selected employee (for dialog)
  const dialogProjectOptions = useMemo(() => {
    if (!form.employeeId) return [];
    const empTaskProjectIds = new Set(
      tasks
        .filter(t => Number(t.employeeId) === Number(form.employeeId))
        .map(t => Number(t.projectId))
    );
    return projects
      .filter(p => empTaskProjectIds.has(Number(p.id)))
      .map(p => ({ id: Number(p.id), label: p.projectName }));
  }, [form.employeeId, tasks, projects]);


  const openAdd = () => {
    setEditData(null);
    setSelectedTaskId(null);
    setSelectedProjectId(null);
    setForm(EMPTY);
    setFormError('');
    setOpen(true);
  };
  const openEdit = (entry: Timesheet) => {
    setEditData(entry);
    const matchedTask = tasks.find(t => Number(t.employeeId) === entry.employeeId && Number(t.projectId) === entry.projectId);
    setSelectedTaskId(matchedTask ? matchedTask.id : null);
    setSelectedProjectId(entry.projectId);
    setForm({
      employeeId: entry.employeeId,
      projectId: entry.projectId,
      workDate: entry.workDate,
      hoursWorked: entry.hoursWorked,
      description: entry.description,
    });
    setFormError('');
    setOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.employeeId) {
      setFormError('Employee is required.');
      return;
    }
    if (!selectedTaskId) {
      setFormError('Task ID is required.');
      return;
    }
    if (!form.projectId) {
      setFormError('Project is required.');
      return;
    }
    if (!form.workDate) {
      setFormError('Work Date is required.');
      return;
    }

    const selectedProject = projects.find(p => Number(p.id) === form.projectId);
    if (selectedProject) {
      const ws = selectedProject.startDate;
      const we = selectedProject.endDate;
      if (form.workDate < ws || form.workDate > we) {
        setFormError("Work Date must fall within the selected project's duration.");
        return;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayDate = new Date(today);
    const pickedDate = new Date(form.workDate);
    const daysDiff = Math.round((todayDate.getTime() - pickedDate.getTime()) / 86400000);
    const dow = pickedDate.getDay();
    if (dow === 0 || dow === 6) {
      setFormError('Timesheet entries are not allowed on weekends (Saturday or Sunday).');
      return;
    }
    if (daysDiff > 2) {
      setFormError('You can only log time for today, yesterday, or the day before yesterday.');
      return;
    }
    if (daysDiff < 0) {
      setFormError('Work Date cannot be in the future.');
      return;
    }

    try {
      if (editData) {
        await timesheetService.update(editData.id, {
          ...form,
          id: editData.id,
        });
      } else {
        await timesheetService.create(form);
      }

      await loadTimesheets();
      setForm(EMPTY);
      setEditData(null);
      setOpen(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        'An error occurred while saving the timesheet. Please try again.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  // ── derived summary stats (always safe — timesheets is guaranteed array) ──
  const stats = useMemo(() => {
    const totalHours = timesheets.reduce((s, r) => s + (r.hoursWorked ?? 0), 0);

    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    const uniqueEmp = new Set(
      timesheets
        .filter(r => r.workDate === todayLocal)
        .map(r => r.employeeId)
    ).size;

    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weeklyHours = timesheets
      .filter(r => r.workDate >= weekStartStr && r.workDate <= today)
      .reduce((s, r) => s + (r.hoursWorked ?? 0), 0);
    const monthStr = today.slice(0, 7);
    const monthlyHours = timesheets
      .filter(r => r.workDate?.startsWith(monthStr))
      .reduce((s, r) => s + (r.hoursWorked ?? 0), 0);
    return { totalHours, uniqueEmp, weeklyHours, monthlyHours };
  }, [timesheets]);

  const filteredTimesheets = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return timesheets
      .filter((entry) => {
        const emp = employees.find((e) => Number(e.id) === entry.employeeId);
        const proj = projects.find((p) => Number(p.id) === entry.projectId);
        const matchedTask = tasks.find(t => Number(t.employeeId) === entry.employeeId && Number(t.projectId) === entry.projectId);

        const employeeName = emp?.name?.toLowerCase() ?? '';
        const employeeId = emp?.employeeId?.toLowerCase() ?? '';
        const projectName = proj?.projectName?.toLowerCase() ?? '';
        const projectId = proj?.projectId?.toLowerCase() ?? '';
        const taskId = matchedTask?.taskId?.toLowerCase() ?? '';
        const taskName = matchedTask?.title?.toLowerCase() ?? '';
        const description = entry.description?.toLowerCase() ?? '';
        const workDate = entry.workDate ?? '';

        const matchesSearch = !term || [
          employeeName,
          employeeId,
          projectName,
          projectId,
          taskId,
          taskName,
          description,
          workDate
        ].some((value) => value.includes(term));

        const matchesEmployee = employeeFilter === null || entry.employeeId === employeeFilter;
        const matchesProject = projectFilter === null || entry.projectId === projectFilter;
        const matchesDateFrom = !dateFrom || dateRangeError ? true : entry.workDate >= dateFrom;
        const matchesDateTo = !dateTo || dateRangeError ? true : entry.workDate <= dateTo;

        return matchesSearch && matchesEmployee && matchesProject && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        const da = a.workDate ?? '';
        const db = b.workDate ?? '';
        return db.localeCompare(da);
      });
  }, [timesheets, employees, projects, tasks, searchValue, employeeFilter, projectFilter, dateFrom, dateTo, dateRangeError]);

  const handleExport = () => {
    const headers = ['Employee', 'Project', 'Work Date', 'Hours Worked', 'Description'];
    const rows = filteredTimesheets.map((entry) => {
      const emp = employees.find((e) => Number(e.id) === entry.employeeId);
      const proj = projects.find((p) => Number(p.id) === entry.projectId);
      return [
        `${emp?.name ?? `#${entry.employeeId}`}`,
        `${proj?.projectName ?? `#${entry.projectId}`}`,
        formatDateToDMY(entry.workDate),
        `${entry.hoursWorked}`,
        entry.description.replace(/\n/g, ' '),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timesheets.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: GridColDef[] = [
    {
      field: 'employeeId',
      headerName: 'Employee',
      width: 210,
      renderCell: ({ value }) => {
        const emp = employees.find(e => Number(e.id) === value);
        const initial = emp?.name?.charAt(0)?.toUpperCase() ?? 'U';
        const idx = (initial.charCodeAt(0) || 0) % 7;
        const avatarBgs = ['#dbeafe', '#ede9fe', '#dcfce7', '#fef3c7', '#fce7f3', '#e0f2fe', '#ffedd5'];
        const avatarColors = ['#1d4ed8', '#6d28d9', '#15803d', '#b45309', '#be185d', '#0369a1', '#c2410c'];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', width: '100%' }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBgs[idx], color: avatarColors[idx], fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              {initial}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: 13.5, lineHeight: 1.3 }}>
                {emp ? emp.name : `#${value}`}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 400, color: 'text.secondary', lineHeight: 1.2 }}>
                {emp ? emp.employeeId : 'Unassigned'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'projectId',
      headerName: 'Project',
      width: 240,
      renderCell: ({ value }) => {
        const proj = projects.find(p => Number(p.id) === value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%', width: '100%' }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.selected', color: 'primary.main', flexShrink: 0 }}>
              <FolderRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {proj ? proj.projectName : `#${value}`}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'workDate',
      headerName: 'Work Date',
      width: 170,
      renderCell: ({ value }) => {
        const date = new Date(value);
        const isValidDate = !Number.isNaN(date.getTime());
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%', width: '100%' }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb', flexShrink: 0 }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 400, color: 'text.primary', fontSize: 13, lineHeight: 1.3 }}>
                {isValidDate ? formatDateToDMY(value) : 'Invalid date'}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 400, color: 'text.secondary', lineHeight: 1.2 }}>
                {isValidDate ? new Date(value).toLocaleDateString('en-GB', { weekday: 'short' }) : '—'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'hoursWorked',
      headerName: 'Hours',
      width: 100,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.25, py: 0.45,
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.12)',
          }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: isDark ? '#60a5fa' : '#2563eb', lineHeight: 1 }}>{value}h</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => openEdit(row)}
              sx={{
                color: isDark ? '#60a5fa' : '#2563eb',
                bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                borderRadius: '10px',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: isDark ? 'rgba(37,99,235,0.25)' : '#dbeafe', transform: 'translateY(-1px)' },
                transition: 'all 0.2s ease',
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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

  const fieldLabel = (icon: React.ReactNode, text: string) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 13, fontWeight: 600 }}>
      {icon}
      <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>{text}</Typography>
    </Box>
  );

  const gridSx = {
    border: 'none',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: 2,
    background: 'background.paper',
    '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover', fontSize: 12, fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' },
    '& .MuiDataGrid-columnHeader': { textTransform: 'uppercase', letterSpacing: 0.4 },
    '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
    '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: 'background.paper' },
    '& .MuiDataGrid-cell': { borderColor: 'divider', fontSize: 13, py: 1.1, display: 'flex', alignItems: 'center' },
    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider', background: 'background.paper', px: 1.5, py: 1 },
    '& .MuiTablePagination-root': { color: 'text.secondary' },
    '& .MuiTablePagination-actions button': { borderRadius: '999px' },
  };

  return (
    <MainLayout>
      <Box sx={{ background: 'background.default', minHeight: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Timesheet Management"
          subtitle={`${filteredTimesheets.length} entries shown`}
          action={
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
              disableElevation sx={{
                borderRadius: '999px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.25,
                py: 1,
                background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 4px 12px rgba(37,99,235,0.24)',
                '&:hover': {
                  background: isDark ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                  boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 6px 18px rgba(37,99,235,0.28)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}>
              Log Time
            </Button>
          }
        />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Total Hours" value={`${stats.totalHours}h`} sub="All time logged" icon={<AccessTimeRoundedIcon />} color="#2563EB" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="This Week" value={`${stats.weeklyHours}h`} sub="Weekly hours logged" icon={<CalendarTodayRoundedIcon />} color="#7C3AED" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="This Month" value={`${stats.monthlyHours}h`} sub="Monthly hours logged" icon={<CalendarTodayRoundedIcon />} color="#22C55E" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Active Members" value={stats.uniqueEmp} sub="Employees logged time" icon={<GroupRoundedIcon />} color="#F59E0B" />
          </Grid>
        </Grid>

        <Paper sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 2, borderRadius: '20px', overflow: 'hidden', background: 'background.paper' }}>
          <DataGrid
            loading={loading}
            rows={filteredTimesheets}
            columns={columns}
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ toolbar: Toolbar as any }}
            slotProps={{
              toolbar: {
                searchValue,
                onSearchChange: setSearchValue,
                employeeValue: employeeFilter,
                onEmployeeChange: setEmployeeFilter,
                projectValue: projectFilter,
                onProjectChange: setProjectFilter,
                dateFrom,
                onDateFromChange: setDateFrom,
                dateTo,
                onDateToChange: setDateTo,
                onExport: handleExport,
                employeeOptions,
                projectOptions,
                dateRangeError,
              } as any
            }}
            disableRowSelectionOnClick
            autoHeight
            getRowHeight={() => 64}
            sx={gridSx}
          />
        </Paper>
      </Box>

      {/* Log time dialog */}
      <Dialog
        open={open}
        onClose={() => { setOpen(false); setForm(EMPTY); setEditData(null); }}
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
            maxWidth: 780,
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3.5, pt: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', borderRadius: '14px' }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'text.primary' }}>
                {editData ? 'Edit Time Entry' : 'Log Time Entry'}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, color: 'text.secondary', mt: 0.4 }}>
                Record the time you spent working on a project.
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => { setOpen(false); setForm(EMPTY); setEditData(null); }}
            sx={{
              width: 40, height: 40,
              borderRadius: '12px',
              bgcolor: 'action.hover',
              color: 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'action.selected', transform: 'translateY(-1px)' },
            }}
            aria-label="Close log time dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* ── Form ── */}
        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

            {/* Row 1 — Employee */}
            <Autocomplete
              size="small"
              options={employeeOptions}
              value={employeeOptions.find(o => o.id === form.employeeId) ?? null}
              onChange={(_, val) => {
                setForm({ ...form, employeeId: val ? val.id : 0, projectId: 0 });
                setSelectedTaskId(null);
                setSelectedProjectId(null);
              }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={fieldLabel(<PersonRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Employee')}
                  placeholder="Select employee"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                const emp = employees.find(e => Number(e.id) === option.id);
                const initial = emp?.name?.charAt(0)?.toUpperCase() ?? 'U';
                const idx = (initial.charCodeAt(0) || 0) % 7;
                const bgs = ['#dbeafe', '#ede9fe', '#dcfce7', '#fef3c7', '#fce7f3', '#e0f2fe', '#ffedd5'];
                const clrs = ['#1d4ed8', '#6d28d9', '#15803d', '#b45309', '#be185d', '#0369a1', '#c2410c'];
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 13, fontWeight: 700, bgcolor: bgs[idx], color: clrs[idx] }}>
                      {initial}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: 'text.primary' }}>{emp?.name ?? option.label}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{emp?.employeeId ?? ''}</Typography>
                    </Box>
                  </Box>
                );
              }}
              noOptionsText="No employees found"
            />

            {/* Row 1 — Project */}
            <Autocomplete
              size="small"
              options={dialogProjectOptions}
              value={dialogProjectOptions.find(o => o.id === form.projectId) ?? null}
              disabled={!form.employeeId}
              onChange={(_, val) => {
                const newProjectId = val ? val.id : 0;
                setForm(f => ({ ...f, projectId: newProjectId }));
                setSelectedProjectId(val ? val.id : null);
                setSelectedTaskId(null);
              }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={fieldLabel(<FolderRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Project')}
                  placeholder={form.employeeId ? 'Select project' : 'Select employee first'}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FolderRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              noOptionsText={form.employeeId ? 'No projects are assigned to this employee.' : 'Select an employee first'}
            />

            {/* Row 2 — Task ID */}
            <Autocomplete
              size="small"
              options={taskOptions}
              value={taskOptions.find(o => o.id === selectedTaskId) ?? null}
              disabled={!form.projectId}
              onChange={(_, val) => {
                setSelectedTaskId(val ? val.id : null);
              }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={fieldLabel(<AssignmentRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Task ID')}
                  placeholder={form.projectId ? 'Select Task ID' : 'Select project first'}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              noOptionsText={form.projectId ? 'No tasks are assigned for this employee in the selected project.' : 'Select a project first'}
            />

            {/* Row 2 — Task Name (auto-fill) */}
            <TextField
              size="small"
              label={fieldLabel(<AssignmentRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Task Name')}
              value={tasks.find(t => t.id === selectedTaskId)?.title ?? ''}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Row 3 — Project ID (auto-fill) */}
            <TextField
              size="small"
              label={fieldLabel(<FolderRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Project ID')}
              value={projects.find(p => Number(p.id) === form.projectId)?.projectId ?? ''}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Row 3 — Project Name (auto-fill) */}
            <TextField
              size="small"
              label={fieldLabel(<FolderRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Project Name')}
              value={projects.find(p => Number(p.id) === form.projectId)?.projectName ?? ''}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Row 4 — Work Date */}
            <TextField
              size="small"
              label={fieldLabel(<CalendarMonthRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Work Date')}
              type="date"
              value={form.workDate}
              onChange={e => {
                const capped = capDateYear(e.target.value);
                const today = new Date().toISOString().slice(0, 10);
                const selectedDate = capped > today ? today : capped;
                const todayDate = new Date(today);
                const pickedDate = new Date(selectedDate);
                const daysDiff = Math.round((todayDate.getTime() - pickedDate.getTime()) / 86400000);
                const dow = pickedDate.getDay();
                if (dow === 0 || dow === 6) {
                  setFormError('Timesheet entries are not allowed on weekends (Saturday or Sunday).');
                } else if (daysDiff > 2) {
                  setFormError('You can only log time for today, yesterday, or the day before yesterday.');
                } else {
                  setFormError('');
                }
                setForm({ ...form, workDate: selectedDate });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().slice(0, 10) }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Row 4 — Hours Worked */}
            {(() => {
              const hoursVal = form.hoursWorked;
              const hoursError =
                hoursVal <= 0 ? 'Hours Worked must be greater than 0 hours.'
                  : hoursVal > 10 ? 'Hours Worked cannot exceed 10 hours.'
                    : '';
              return (
                <TextField
                  size="small"
                  label={fieldLabel(<AccessTimeRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Hours Worked')}
                  type="number"
                  value={form.hoursWorked}
                  onChange={e => {
                    const raw = Number(e.target.value);
                    setForm({ ...form, hoursWorked: raw });
                  }}
                  fullWidth
                  error={Boolean(hoursError)}
                  helperText={hoursError}
                  inputProps={{ min: 0.5, max: 10, step: 0.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>hrs</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              );
            })()}

            {/* Row 5 — Description */}
            <TextField
              size="small"
              label={fieldLabel(<DescriptionRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />, 'Description')}
              placeholder="Briefly describe what you worked on…"
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

          {/* Validation / API error message */}
          {formError && (
            <Box sx={{ mt: 2, px: 1.5, py: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: '1px solid', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'error.main', lineHeight: 1.5 }}>
                ⚠ {formError}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3.5, py: 3, gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => { setOpen(false); setForm(EMPTY); setEditData(null); }}
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
            disabled={(() => {
              const hoursVal = form.hoursWorked;
              const hoursError = hoursVal <= 0 || hoursVal > 10;
              return hoursError || Boolean(formError && formError !== '');
            })()}
            variant="contained"
            disableElevation
            startIcon={<SaveRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              transition: 'all 0.2s ease',
              '&.Mui-disabled': { background: 'action.disabledBackground', color: 'action.disabled', boxShadow: 'none' },
            }}
          >
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this timesheet entry?"
        onConfirm={async () => {
          try {
            await timesheetService.remove(deleteId!);
            await loadTimesheets();
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
