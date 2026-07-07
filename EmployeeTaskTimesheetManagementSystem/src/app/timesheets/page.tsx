'use client';
import { capDateYear } from '@/utils/dateUtils';
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
import MainLayout    from '@/components/layout/MainLayout';
import PageHeader    from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Timesheet, Employee, Project } from '@/types';

const EMPTY: Omit<Timesheet, 'id'> = {
  employeeId: 0, projectId: 0, workDate: '', hoursWorked: 8, description: '',
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
}) {
  return (
    <GridToolbarContainer sx={{ px: 2.25, py: 1.75, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} sx={{ width: '100%', alignItems: { xs: 'stretch', lg: 'center' } }}>
        <TextField
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search timesheets"
          size="small"
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ color: '#64748b', mr: 1 }} />,
          }}
          sx={{ flex: 1, minWidth: { xs: '100%', lg: 260 }, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Autocomplete
            size="small"
            options={employeeOptions}
            value={employeeOptions.find((option) => option.id === employeeValue) ?? null}
            onChange={(_, value) => onEmployeeChange(value ? value.id : null)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Employee" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }} />}
            noOptionsText="No employees found"
          />
          <Autocomplete
            size="small"
            options={projectOptions}
            value={projectOptions.find((option) => option.id === projectValue) ?? null}
            onChange={(_, value) => onProjectChange(value ? value.id : null)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Project" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }} />}
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
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => onDateToChange(capDateYear(e.target.value))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: '9999-12-31' }}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
          />
          <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={onExport} disableElevation sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 700, px: 2, background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
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
  return (
    <Card
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        boxShadow: '0 14px 40px rgba(15, 23, 42, 0.06)',
        transition: 'all 0.25s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 48px rgba(37, 99, 235, 0.12)' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7 }}>
            {label}
          </Typography>
          <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 20 } }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 0.25 }}>{value}</Typography>
        <Typography variant="body2" color="#64748b">{sub}</Typography>
      </CardContent>
      <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.2) 100%)` }} />
    </Card>
  );
}

export default function TimesheetsPage() {
  // ── global state ──────────────────────────────────────────────────────────

const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
const [loading, setLoading] = useState(true);
const [employees, setEmployees] = useState<Employee[]>([]);
const [projects, setProjects] = useState<Project[]>([]);

const employeeOptions = useMemo(
  () => employees.map(e => ({ id: Number(e.id), label: `${e.name} (${e.employeeId})` })),
  [employees],
);

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
}, []);

  // ── local dialog state ────────────────────────────────────────────────────
  const [open, setOpen]         = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Timesheet | null>(null);
  const [form, setForm]         = useState<Omit<Timesheet, 'id'>>(EMPTY);
  const [formError, setFormError] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);
  const [projectFilter, setProjectFilter] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const openAdd = () => {
  setEditData(null);
  setForm(EMPTY);
  setFormError('');
  setOpen(true);
};
  const openEdit = (entry: Timesheet) => {
    setEditData(entry);
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
    const totalHours    = timesheets.reduce((s, r) => s + (r.hoursWorked ?? 0), 0);
    
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    const uniqueEmp     = new Set(
      timesheets
        .filter(r => r.workDate === todayLocal)
        .map(r => r.employeeId)
    ).size;

    const today         = new Date().toISOString().slice(0, 10);
    const weekStart     = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr  = weekStart.toISOString().slice(0, 10);
    const weeklyHours   = timesheets
      .filter(r => r.workDate >= weekStartStr && r.workDate <= today)
      .reduce((s, r) => s + (r.hoursWorked ?? 0), 0);
    const monthStr      = today.slice(0, 7);
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
        
        const employeeName = emp?.name?.toLowerCase() ?? '';
        const employeeId = emp?.employeeId?.toLowerCase() ?? '';
        const projectName = proj?.projectName?.toLowerCase() ?? '';
        const projectId = proj?.projectId?.toLowerCase() ?? '';
        const description = entry.description?.toLowerCase() ?? '';
        const workDate = entry.workDate ?? '';

        const matchesSearch = !term || [
          employeeName,
          employeeId,
          projectName,
          projectId,
          description,
          workDate
        ].some((value) => value.includes(term));

        const matchesEmployee = employeeFilter === null || entry.employeeId === employeeFilter;
        const matchesProject = projectFilter === null || entry.projectId === projectFilter;
        const matchesDateFrom = !dateFrom || entry.workDate >= dateFrom;
        const matchesDateTo = !dateTo || entry.workDate <= dateTo;

        return matchesSearch && matchesEmployee && matchesProject && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        const da = a.workDate ?? '';
        const db = b.workDate ?? '';
        return db.localeCompare(da);
      });
  }, [timesheets, employees, projects, searchValue, employeeFilter, projectFilter, dateFrom, dateTo]);

  const handleExport = () => {
    const headers = ['Employee', 'Project', 'Work Date', 'Hours Worked', 'Description'];
    const rows = filteredTimesheets.map((entry) => {
      const emp = employees.find((e) => Number(e.id) === entry.employeeId);
      const proj = projects.find((p) => Number(p.id) === entry.projectId);
      return [
        `${emp?.name ?? `#${entry.employeeId}`}`,
        `${proj?.projectName ?? `#${entry.projectId}`}`,
        entry.workDate,
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
      const avatarBgs   = ['#dbeafe','#ede9fe','#dcfce7','#fef3c7','#fce7f3','#e0f2fe','#ffedd5'];
      const avatarColors = ['#1d4ed8','#6d28d9','#15803d','#b45309','#be185d','#0369a1','#c2410c'];
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', width: '100%' }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBgs[idx], color: avatarColors[idx], fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 500, color: '#0f172a', fontSize: 13.5, lineHeight: 1.3 }}>
              {emp ? emp.name : `#${value}`}
            </Typography>
            <Typography sx={{ fontSize: 11.5, fontWeight: 400, color: '#64748b', lineHeight: 1.2 }}>
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
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f3ff', color: '#7c3aed', flexShrink: 0 }}>
            <FolderRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontWeight: 500, color: '#374151', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 400, color: '#374151', fontSize: 13, lineHeight: 1.3 }}>
              {isValidDate ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Invalid date'}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', lineHeight: 1.2 }}>
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
          bgcolor: '#eff6ff',
          border: '1px solid rgba(37,99,235,0.12)',
        }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#2563eb', lineHeight: 1 }}>{value}h</Typography>
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
        <Typography sx={{ fontSize: 13, fontWeight: 400, color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
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
              color: '#2563eb',
              bgcolor: '#eff6ff',
              borderRadius: '10px',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: '#dbeafe', transform: 'translateY(-1px)' },
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
      backgroundColor: '#ffffff',
      '& fieldset': { borderColor: '#cbd5e1' },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        boxShadow: '0 0 0 4px rgba(37,99,235,0.08)',
      },
    },
    '& .MuiInputLabel-root': { color: '#334155', fontWeight: 600 },
    '& .MuiInputBase-input': { fontSize: '15px', fontWeight: 500, color: '#111827' },
    '& .MuiOutlinedInput-input': { fontSize: '15px', fontWeight: 500, color: '#111827' },
    '& .MuiSelect-select': { fontSize: '15px', fontWeight: 500, color: '#111827' },
  };

  const fieldLabel = (icon: React.ReactNode, text: string) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#334155', fontSize: 13, fontWeight: 600 }}>
      {icon}
      <Typography component="span" sx={{ fontSize: 13, fontWeight: 600 }}>{text}</Typography>
    </Box>
  );

  const gridSx = {
    border: 'none',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
    background: '#fff',
    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e5e7eb' },
    '& .MuiDataGrid-columnHeader': { textTransform: 'uppercase', letterSpacing: 0.4 },
    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fbff' },
    '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: '#fcfdff' },
    '& .MuiDataGrid-cell': { borderColor: '#f0f2f5', fontSize: 13, py: 1.1, display: 'flex', alignItems: 'center' },
    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e5e7eb', background: '#fcfdff', px: 1.5, py: 1 },
    '& .MuiTablePagination-root': { color: '#475569' },
    '& .MuiTablePagination-actions button': { borderRadius: '999px' },
  };

  return (
    <MainLayout>
      <Box sx={{ background: '#f8fafc', minHeight: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Timesheet Management"
          subtitle={`${filteredTimesheets.length} entries shown`}
          action={
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
              disableElevation sx={{ borderRadius: '999px', fontWeight: 700, textTransform: 'none', px: 2.25, py: 1, background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', boxShadow: '0 10px 24px rgba(37,99,235,0.24)', '&:hover': { boxShadow: '0 14px 30px rgba(109,93,246,0.28)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
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

        <Paper sx={{ border: '1px solid #e5e7eb', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)', borderRadius: '20px', overflow: 'hidden', background: '#fff' }}>
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
            boxShadow: '0 20px 60px rgba(15,23,42,0.15)',
            background: 'rgba(248,250,252,0.97)',
            overflow: 'hidden',
            maxWidth: 780,
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3.5, pt: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#dbeafe', color: '#1d4ed8', borderRadius: '14px' }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0f172a' }}>
                {editData ? 'Edit Time Entry' : 'Log Time Entry'}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, color: '#64748b', mt: 0.4 }}>
                Record the time you spent working on a project.
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => { setOpen(false); setForm(EMPTY); setEditData(null); }}
            sx={{
              width: 40, height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.88)',
              color: '#475569',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#e2e8f0', transform: 'translateY(-1px)' },
            }}
            aria-label="Close log time dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* ── Form ── */}
        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

            {/* Row 1 — Employee */}
            <Autocomplete
              size="small"
              options={employeeOptions}
              value={employeeOptions.find(o => o.id === form.employeeId) ?? null}
              onChange={(_, val) => val && setForm({ ...form, employeeId: val.id })}
              isOptionEqualToValue={(o, v) => o.id === v.id}
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
                        <PersonRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
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
                const bgs = ['#dbeafe','#ede9fe','#dcfce7','#fef3c7','#fce7f3','#e0f2fe','#ffedd5'];
                const clrs = ['#1d4ed8','#6d28d9','#15803d','#b45309','#be185d','#0369a1','#c2410c'];
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 13, fontWeight: 700, bgcolor: bgs[idx], color: clrs[idx] }}>
                      {initial}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{emp?.name ?? option.label}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#64748b' }}>{emp?.employeeId ?? ''}</Typography>
                    </Box>
                  </Box>
                );
              }}
              noOptionsText="No employees found"
            />

            {/* Row 1 — Project */}
            <Autocomplete
              size="small"
              options={projectOptions}
              value={projectOptions.find(o => o.id === form.projectId) ?? null}
              onChange={(_, val) => val && setForm({ ...form, projectId: val.id })}
              isOptionEqualToValue={(o, v) => o.id === v.id}
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
                        <FolderRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(109,93,246,0.1)', color: '#6D5DF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{option.label}</Typography>
                  </Box>
                );
              }}
              noOptionsText="No projects found"
            />

            {/* Row 2 — Work Date (full width, 3-day window, no weekends) */}
            <TextField
              size="small"
              label={fieldLabel(<CalendarMonthRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Work Date')}
              type="date"
              value={form.workDate}
              onChange={e => {
                const capped = capDateYear(e.target.value);
                const today = new Date().toISOString().slice(0, 10);
                // Clamp future dates to today
                const selectedDate = capped > today ? today : capped;
                // Frontend validation
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
                    <CalendarMonthRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: '1 / -1' }]}
            />

            {/* Row 3 — Hours Worked (full width) */}
            <TextField
              size="small"
              label={fieldLabel(<AccessTimeRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Hours Worked')}
              type="number"
              value={form.hoursWorked}
              onChange={e => setForm({ ...form, hoursWorked: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 0.5, max: 24, step: 0.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>hrs</Typography>
                  </InputAdornment>
                ),
              }}
              sx={[fieldStyles, { gridColumn: '1 / -1' }]}
            />

            {/* Row 4 — Description (full width, auto-expanding) */}
            <TextField
              size="small"
              label={fieldLabel(<DescriptionRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} />, 'Description')}
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
                  gridColumn: '1 / -1',
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
            <Box sx={{ mt: 2, px: 1.5, py: 1.25, borderRadius: '12px', bgcolor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#dc2626', lineHeight: 1.5 }}>
                ⚠ {formError}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

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
              borderColor: '#cbd5e1',
              color: '#475569',
              px: 2.5,
              py: 1.25,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disableElevation
            startIcon={<SaveRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },
              transition: 'all 0.2s ease',
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
