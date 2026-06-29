'use client';
import { useState, useMemo, useEffect } from 'react';
import { timesheetService } from '@/services/timesheetService';
import { employeeService } from '@/services/employeeService';
import { projectService } from '@/services/projectService';
import {
  Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, IconButton, Tooltip, Paper, Divider,
  Card, CardContent, Grid, Stack, Chip, Avatar,
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
            onChange={(e) => onDateFromChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '999px', background: '#fff' } }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
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
  const [searchValue, setSearchValue] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);
  const [projectFilter, setProjectFilter] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const openAdd = () => {
  setEditData(null);
  setForm(EMPTY);
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
    setOpen(true);
  };

  const handleSave = async () => {
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
  } catch (error) {
    console.error(error);
  }
};

  // ── derived summary stats (always safe — timesheets is guaranteed array) ──
  const stats = useMemo(() => {
    const totalHours    = timesheets.reduce((s, r) => s + (r.hoursWorked ?? 0), 0);
    const uniqueEmp     = new Set(timesheets.map(r => r.employeeId)).size;
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

    return timesheets.filter((entry) => {
      const emp = employees.find((e) => Number(e.id) === entry.employeeId);
      const proj = projects.find((p) => Number(p.id) === entry.projectId);
      const employeeName = emp?.name?.toLowerCase() ?? '';
      const projectName = proj?.projectName?.toLowerCase() ?? '';
      const description = entry.description?.toLowerCase() ?? '';
      const matchesSearch = !term || [employeeName, projectName, description].some((value) => value.includes(term));
      const matchesEmployee = employeeFilter === null || entry.employeeId === employeeFilter;
      const matchesProject = projectFilter === null || entry.projectId === projectFilter;
      const matchesDateFrom = !dateFrom || entry.workDate >= dateFrom;
      const matchesDateTo = !dateTo || entry.workDate <= dateTo;

      return matchesSearch && matchesEmployee && matchesProject && matchesDateFrom && matchesDateTo;
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
    width: 220,
    renderCell: ({ value }) => {
      const emp = employees.find(e => Number(e.id) === value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, height: '100%', minHeight: 72, width: '100%' }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, flexShrink: 0 }}>{emp?.name?.charAt(0) ?? 'U'}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>{emp ? emp.name : `#${value}`}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>{emp ? `(${emp.employeeId})` : 'Unassigned'}</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, height: '100%', minHeight: 72, width: '100%' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f3ff', color: '#7c3aed', flexShrink: 0 }}>
            <FolderRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>{proj ? proj.projectName : `#${value}`}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>{proj ? `(${proj.id})` : 'Unassigned'}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
  field: 'workDate',
  headerName: 'Work Date',
  width: 180,
  renderCell: ({ value }) => {
    const date = new Date(value);
    const isValidDate = !Number.isNaN(date.getTime());
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, height: '100%', minHeight: 72, width: '100%' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13, lineHeight: 1.3 }}>
            {isValidDate ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Invalid date'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.1 }}>
            {isValidDate ? new Date(value).toLocaleDateString('en-GB', { weekday: 'short' }) : '—'}
          </Typography>
        </Box>
      </Box>
    );
  },
},
  {
    field: 'hoursWorked',
    headerName: 'Hours Worked',
    width: 140,
    renderCell: ({ value }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 72, width: '100%' }}>
        <Chip label={`${value}h`} sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: '999px', px: 0.75, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
      </Box>
    ),
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    minWidth: 260,
    renderCell: ({ value }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', minHeight: 72, width: '100%' }}>
        <Typography variant="body2" color="#475569" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
          {value}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%', minHeight: 72, width: '100%' }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: '#2563eb', bgcolor: '#eff6ff', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#dbeafe', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
            <EditRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => setDeleteId(row.id)} sx={{ color: '#dc2626', bgcolor: '#fef2f2', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#fee2e2', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}>
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
            slots={{ toolbar: () => <Toolbar searchValue={searchValue} onSearchChange={setSearchValue} employeeValue={employeeFilter} onEmployeeChange={setEmployeeFilter} projectValue={projectFilter} onProjectChange={setProjectFilter} dateFrom={dateFrom} onDateFromChange={setDateFrom} dateTo={dateTo} onDateToChange={setDateTo} onExport={handleExport} employeeOptions={employeeOptions} projectOptions={projectOptions} /> }}
            disableRowSelectionOnClick
            autoHeight
            getRowHeight={() => 74}
            sx={gridSx}
          />
        </Paper>
      </Box>

      {/* Log time dialog */}
      <Dialog
  open={open}
  onClose={() => {
    setOpen(false);
    setForm(EMPTY);
    setEditData(null);
  }}
      maxWidth="sm" fullWidth
        closeAfterTransition={false}
        PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
    {editData ? "Edit Time Entry" : "Log Time Entry"}
</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Autocomplete
              size="small"
              options={employeeOptions}
              value={employeeOptions.find(o => o.id === form.employeeId) ?? null}
              onChange={(_, val) => val && setForm({ ...form, employeeId: val.id })}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => <TextField {...params} label="Employee" />}
              noOptionsText="No employees found"
            />
            <Autocomplete
              size="small"
              options={projectOptions}
              value={projectOptions.find(o => o.id === form.projectId) ?? null}
              onChange={(_, val) => val && setForm({ ...form, projectId: val.id })}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => <TextField {...params} label="Project" />}
              noOptionsText="No projects found"
            />
            <TextField size="small" label="Work Date" type="date" value={form.workDate}
              onChange={e => setForm({ ...form, workDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} sx={{ gridColumn: '1/-1' }} />
            <TextField size="small" label="Hours Worked" type="number" value={form.hoursWorked}
              onChange={e => setForm({ ...form, hoursWorked: Number(e.target.value) })}
              fullWidth inputProps={{ min: 0.5, max: 24, step: 0.5 }} />
            <TextField size="small" label="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              fullWidth multiline rows={2} sx={{ gridColumn: '1/-1' }} />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disableElevation
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
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
