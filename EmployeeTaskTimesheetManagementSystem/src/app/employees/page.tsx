'use client';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Typography, IconButton, Tooltip, Paper, Divider,
  Avatar, InputAdornment, Fade, Grow, Chip, Popover, List, ListItemButton, ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddRoundedIcon       from '@mui/icons-material/AddRounded';
import EditRoundedIcon      from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon    from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon    from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import EmailRoundedIcon     from '@mui/icons-material/EmailRounded';
import CodeRoundedIcon      from '@mui/icons-material/CodeRounded';
import GroupRoundedIcon     from '@mui/icons-material/GroupRounded';
import CloudRoundedIcon     from '@mui/icons-material/CloudRounded';
import BusinessRoundedIcon  from '@mui/icons-material/BusinessRounded';
import PaletteRoundedIcon   from '@mui/icons-material/PaletteRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import CampaignRoundedIcon  from '@mui/icons-material/CampaignRounded';
import BadgeRoundedIcon     from '@mui/icons-material/BadgeRounded';
import PersonRoundedIcon    from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon      from '@mui/icons-material/WorkRounded';
import PhoneRoundedIcon     from '@mui/icons-material/PhoneRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ShieldRoundedIcon    from '@mui/icons-material/ShieldRounded';
import CloseRoundedIcon     from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon      from '@mui/icons-material/SaveRounded';
import MonitorRoundedIcon   from '@mui/icons-material/MonitorRounded';
import StorageRoundedIcon   from '@mui/icons-material/StorageRounded';
import DeveloperBoardRoundedIcon from '@mui/icons-material/DeveloperBoardRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GroupsRoundedIcon    from '@mui/icons-material/GroupsRounded';
import MainLayout    from '@/components/layout/MainLayout';
import PageHeader    from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Employee } from '@/types';
import { useState, useRef, useEffect, useMemo } from 'react';
import { capDateYear } from '@/utils/dateUtils';
import { employeeService } from '@/services/employeeService';

const DEPARTMENTS  = ['Engineering', 'Design', 'Management', 'QA', 'DevOps', 'HR', 'Marketing'];
const DESIGNATIONS = {
  Engineering: [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer'
  ],

  Design: [
    'UI/UX Designer',
    'Graphic Designer'
  ],

  Management: [
    'Project Manager',
    'Project Coordinator'
  ],

  QA: [
    'QA Engineer',
    'Automation Tester'
  ],

  DevOps: [
    'DevOps Engineer',
    'Cloud Engineer'
  ],

  HR: [
    'HR Executive',
    'HR Manager'
  ],

  Marketing: [
    'Marketing Executive',
    'Digital Marketing Specialist'
  ]
};
const EMPTY: Omit<Employee, 'id'> = { employeeId: '', name: '', email: '', department: '', designation: '', status: 'Active', phone: '', joinDate: '' };

/* ── Avatar colours — deterministic per name initial ── */
const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8' }, // blue
  { bg: '#ede9fe', color: '#6d28d9' }, // purple
  { bg: '#dcfce7', color: '#15803d' }, // green
  { bg: '#fef3c7', color: '#b45309' }, // amber
  { bg: '#fce7f3', color: '#be185d' }, // pink
  { bg: '#e0f2fe', color: '#0369a1' }, // sky
  { bg: '#ffedd5', color: '#c2410c' }, // orange
];
function avatarColor(name: string) {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ── Department icons ── */
type DeptIconCfg = { icon: React.ReactNode; bg: string; color: string };
function getDeptIcon(dept: string): DeptIconCfg {
  switch (dept) {
    case 'Engineering': return { icon: <CodeRoundedIcon sx={{ fontSize: 16 }} />, bg: '#dbeafe', color: '#2563EB' };
    case 'HR':          return { icon: <GroupRoundedIcon sx={{ fontSize: 16 }} />, bg: '#dcfce7', color: '#15803d' };
    case 'DevOps':      return { icon: <CloudRoundedIcon sx={{ fontSize: 16 }} />, bg: '#cffafe', color: '#0369a1' };
    case 'Management':  return { icon: <BusinessRoundedIcon sx={{ fontSize: 16 }} />, bg: '#e0e7ff', color: '#4338ca' };
    case 'Design':      return { icon: <PaletteRoundedIcon sx={{ fontSize: 16 }} />, bg: '#f5f3ff', color: '#7c3aed' };
    case 'QA':          return { icon: <BugReportRoundedIcon sx={{ fontSize: 16 }} />, bg: '#ffedd5', color: '#ea580c' };
    case 'Marketing':   return { icon: <CampaignRoundedIcon sx={{ fontSize: 16 }} />, bg: '#fce7f3', color: '#db2777' };
    default:            return { icon: <BusinessRoundedIcon sx={{ fontSize: 16 }} />, bg: '#f1f5f9', color: '#64748b' };
  }
}

function getDesignationIcon(designation: string): { icon: React.ReactNode; color: string } {
  switch (designation) {
    case 'Frontend Developer': return { icon: <MonitorRoundedIcon sx={{ fontSize: 16 }} />, color: '#2563EB' };
    case 'Backend Developer': return { icon: <StorageRoundedIcon sx={{ fontSize: 16 }} />, color: '#0f766e' };
    case 'Full Stack Developer': return { icon: <DeveloperBoardRoundedIcon sx={{ fontSize: 16 }} />, color: '#4f46e5' };
    case 'QA Engineer': return { icon: <FactCheckRoundedIcon sx={{ fontSize: 16 }} />, color: '#ea580c' };
    case 'UI/UX Designer': return { icon: <PaletteRoundedIcon sx={{ fontSize: 16 }} />, color: '#9333ea' };
    case 'Project Manager': return { icon: <AssignmentRoundedIcon sx={{ fontSize: 16 }} />, color: '#1d4ed8' };
    case 'HR Manager': return { icon: <GroupsRoundedIcon sx={{ fontSize: 16 }} />, color: '#0f766e' };
    case 'Cloud Engineer': return { icon: <CloudRoundedIcon sx={{ fontSize: 16 }} />, color: '#0284c7' };
    default: return { icon: <WorkRoundedIcon sx={{ fontSize: 16 }} />, color: '#64748b' };
  }
}

function getStatusChip(status: Employee['status'] | string): { label: string; color: 'success' | 'error' | 'warning' | 'info'; variant: 'filled' | 'outlined' } {
  switch (status) {
    case 'Active': return { label: 'Active', color: 'success', variant: 'filled' };
    case 'Inactive': return { label: 'Inactive', color: 'error', variant: 'filled' };
    default: return { label: status, color: 'info', variant: 'outlined' };
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [filterAnchor, setFilterAnchor]   = useState<HTMLElement | null>(null);

  const [open, setOpen]         = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Employee | null>(null);
  const [form, setForm]         = useState<Omit<Employee, 'id'>>(EMPTY);
  const [errors, setErrors]     = useState<{ employeeId?: string; phone?: string }>({});

  const isDuplicateEmployeeId = (idValue: string, currentId?: string | null) => {
    const trimmed = idValue.trim();
    if (!trimmed) return false;
    return employees.some((employee) =>
      employee.employeeId === trimmed && employee.id !== currentId,
    );
  };

  const validateEmployeeId = (value?: string) => {
    if (!value) return undefined;
    if (isDuplicateEmployeeId(value, editData?.id ?? null)) {
      return 'Employee ID already exists.';
    }
    return undefined;
  };

  const validatePhone = (value?: string) => {
    if (!value) return undefined;
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) {
      return 'Phone number must contain exactly 10 digits.';
    }
    return undefined;
  };

  const validateForm = () => {
    const employeeIdError = validateEmployeeId(form.employeeId);
    const phoneError = validatePhone(form.phone);
    setErrors({ employeeId: employeeIdError, phone: phoneError });
    return !employeeIdError && !phoneError;
  };

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

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  const openAdd = () => { setEditData(null); setForm(EMPTY); setOpen(true); };

  const openEdit = (emp: Employee) => {
    setEditData(emp);
    setForm({ employeeId: emp.employeeId ?? '', name: emp.name ?? '', email: emp.email ?? '', department: emp.department ?? '', designation: emp.designation ?? '', status: emp.status ?? 'Active', phone: emp.phone ?? '', joinDate: emp.joinDate ?? '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editData) { await employeeService.update(Number(editData.id), { ...form, id: editData.id }); }
      else          { await employeeService.create(form); }
      await loadEmployees();
      setOpen(false); setEditData(null); setForm(EMPTY); setErrors({});
    } catch (error) { console.error('Error saving employee:', error); }
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeService.remove(id);
      await loadEmployees();
      setDeleteId(null);
    } catch (error) { console.error('Error deleting employee:', error); }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography color="text.secondary" fontSize={14}>Loading employees…</Typography>
        </Box>
      </MainLayout>
    );
  }

  /* ── Filter popover handlers ── */
  const openFilter  = (e: React.MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget);
  const closeFilter = () => setFilterAnchor(null);
  const selectDept  = (dept: string) => { setFilterDept(dept); closeFilter(); };

  /* ── CSV export ── */
  const handleExport = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status'];
    const rows = filteredRows.map((e) => [
      e.employeeId, e.name, e.email, e.department, e.designation, e.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Filtered rows: search + department filter work together ── */
  const filteredRows = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
    const matchesDept = filterDept === '' || e.department === filterDept;
    return matchesSearch && matchesDept;
  });

  /* ── Column definitions ── */
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Employee',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => {
        const av = avatarColor(row.name ?? '');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: av.bg, color: av.color, fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
              {row.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                {row.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', lineHeight: 1.2 }}>
                {row.employeeId}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 210,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EmailRoundedIcon sx={{ fontSize: 14, color: '#64748b' }} />
          </Box>
          <Typography sx={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{value}</Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 148,
      renderCell: ({ value }) => {
        const d = getDeptIcon(value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: d.bg, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {d.icon}
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{value}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'designation',
      headerName: 'Designation',
      flex: 1,
      minWidth: 168,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, color: '#374151', fontWeight: 400, height: '100%', display: 'flex', alignItems: 'center' }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 108,
      renderCell: ({ value }) => {
        const active = value === 'Active';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.65,
              px: 1.25, py: 0.45,
              borderRadius: '20px',
              bgcolor: active ? '#dcfce7' : '#f3f4f6',
              border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'rgba(107,114,128,0.20)'}`,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: active ? '#22c55e' : '#9ca3af', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? '#15803d' : '#6b7280', lineHeight: 1 }}>
                {value}
              </Typography>
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
          <Tooltip title="Edit employee">
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
          <Tooltip title="Delete employee">
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

  return (
    <MainLayout>
      <PageHeader
        title="Employee Management"
        subtitle={`${employees.length} employees total`}
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
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Add Employee
          </Button>
        }
      />

      {/* ── Toolbar: search + filter + export ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2.5,
        flexWrap: 'wrap',
      }}>
        {/* Search bar */}
        <TextField
          size="small"
          placeholder="Search employees by name, email or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '12px',
              fontSize: 13.5,
              height: 44,
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: '#2563EB' },
            },
          }}
          sx={{ flex: 1, minWidth: 260 }}
        />

        {/* Filter button — opens department popover */}
        <Button
          variant="outlined"
          startIcon={<FilterListRoundedIcon />}
          onClick={openFilter}
          disableElevation
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            height: 44,
            px: 2,
            color: filterDept ? '#2563EB' : '#374151',
            borderColor: filterDept ? '#2563EB' : '#e2e8f0',
            bgcolor: filterDept ? '#eff6ff' : '#fff',
            transition: 'all 0.25s ease',
            '&:hover': { bgcolor: filterDept ? '#dbeafe' : '#f8fafd', borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
          }}
        >
          {filterDept ? filterDept : 'Filter'}
        </Button>

        {/* Filter Popover */}
        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={closeFilter}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1,
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
              minWidth: 200,
              overflow: 'hidden',
            },
          }}
        >
          {/* Popover header */}
          <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Filter by Department
            </Typography>
          </Box>
          <List dense disablePadding sx={{ py: 0.75 }}>
            {['', ...DEPARTMENTS].map((dept) => (
              <ListItemButton
                key={dept || '__all__'}
                selected={filterDept === dept}
                onClick={() => selectDept(dept)}
                sx={{
                  px: 2, py: 0.85,
                  mx: 0.75, borderRadius: '8px',
                  '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563EB' },
                  '&.Mui-selected:hover': { bgcolor: '#dbeafe' },
                  '&:hover': { bgcolor: '#f8fafd' },
                }}
              >
                <ListItemText
                  primary={dept || 'All Departments'}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: filterDept === dept ? 700 : 400,
                    color: filterDept === dept ? '#2563EB' : '#374151',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Popover>

        {/* Department dropdown — synced with filterDept state */}
        <TextField
          select
          size="small"
          value={filterDept}
          onChange={(e) =>
            setForm({
              ...form,
              department: e.target.value,
              designation: '',
            })
          }
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: 13,
              height: 44,
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
            },
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value=""><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>All Departments</Typography></MenuItem>
          {DEPARTMENTS.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>{d}</MenuItem>)}
        </TextField>

        {/* Export button — exports filtered rows to CSV */}
        <Button
          variant="outlined"
          startIcon={<FileDownloadRoundedIcon />}
          onClick={handleExport}
          disableElevation
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            height: 44,
            px: 2,
            color: '#374151',
            borderColor: '#e2e8f0',
            bgcolor: '#fff',
            transition: 'all 0.25s ease',
            '&:hover': { bgcolor: '#f8fafd', borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
          }}
        >
          Export
        </Button>
      </Box>

      {/* ── Main table card ── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e8edf2',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#fff',
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.09)' },
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={64}
          columnHeaderHeight={48}
          sx={{
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

            /* ── Checkbox ── */
            '& .MuiCheckbox-root': { color: '#cbd5e1' },

            /* ── Separator lines ── */
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-withBorderColor': { borderColor: '#f1f5f9' },
          }}
        />
      </Paper>

      {/* ── Add / Edit Dialog (unchanged) ── */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        closeAfterTransition={false}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 180 }}
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
              <PersonRoundedIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {editData ? 'Edit Employee' : 'Add New Employee'}
              </Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 400, color: '#64748B', mt: 0.5 }}>
                Update employee information and save changes.
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.88)',
              color: '#475569',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#e2e8f0', transform: 'translateY(-1px)' },
            }}
            aria-label="Close edit employee dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              size="small"
              label={fieldLabel(<BadgeRoundedIcon sx={{ color: '#2563EB' }} />, 'Employee ID')}
              value={editData ? (form.employeeId ?? '') : 'Auto-generated'}
              disabled={true}
              error={Boolean(errors.employeeId)}
              helperText={errors.employeeId || ''}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<PersonRoundedIcon sx={{ color: '#2563EB' }} />, 'Full Name')}
              value={form.name ?? ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<EmailRoundedIcon sx={{ color: '#2563EB' }} />, 'Email')}
              value={form.email ?? ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
              fullWidth
              sx={[fieldStyles, { gridColumn: '1/-1' }]}
            />
            <TextField
              size="small"
              select
              label={fieldLabel(<BusinessRoundedIcon sx={{ color: '#2563EB' }} />, 'Department')}
              value={form.department ?? ''}
              onChange={e => setForm({ ...form, department: e.target.value })}
              fullWidth
              sx={fieldStyles}
              SelectProps={{
                renderValue: (value: unknown) => {
                  const selected = typeof value === 'string' ? value : '';
                  const dept = getDeptIcon(selected);
                  return (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '10px', bgcolor: dept.bg, color: dept.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dept.icon}
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#0f172a' }}>{selected}</Typography>
                    </Box>
                  );
                },
              }}
            >
              {DEPARTMENTS.map(d => {
                const dept = getDeptIcon(d);
                return (
                  <MenuItem key={d} value={d} sx={{ py: 1.25, minHeight: 52 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: dept.bg, color: dept.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dept.icon}
                      </Box>
                      <Typography>{d}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              size="small"
              select
              label={fieldLabel(<WorkRoundedIcon sx={{ color: '#2563EB' }} />, 'Designation')}
              value={form.designation ?? ''}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              fullWidth
              sx={fieldStyles}
              SelectProps={{
                renderValue: (value: unknown) => {
                  const selected = typeof value === 'string' ? value : '';
                  const icon = getDesignationIcon(selected);
                  return (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '10px', bgcolor: 'rgba(37,99,235,0.12)', color: icon.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon.icon}
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#0f172a' }}>{selected}</Typography>
                    </Box>
                  );
                },
              }}
            >
              {(DESIGNATIONS[form.department as keyof typeof DESIGNATIONS] || []).map((designation) => {
                const icon = getDesignationIcon(designation);
                return (
                  <MenuItem key={designation} value={designation} sx={{ py: 1.25, minHeight: 52 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: 'rgba(37,99,235,0.12)', color: icon.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon.icon}
                      </Box>
                      <Typography>{designation}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              size="small"
              label={fieldLabel(<PhoneRoundedIcon sx={{ color: '#2563EB' }} />, 'Phone')}
              value={form.phone ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, phone: digits });
                if (errors.phone) {
                  setErrors({ ...errors, phone: digits.length === 10 ? undefined : 'Phone number must contain exactly 10 digits.' });
                }
              }}
              error={Boolean(errors.phone)}
              helperText={errors.phone || ''}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<CalendarTodayRoundedIcon sx={{ color: '#2563EB' }} />, 'Join Date')}
              type="date"
              value={form.joinDate ?? ''}
              onChange={e => setForm({ ...form, joinDate: capDateYear(e.target.value) })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />
            <TextField
              size="small"
              select
              label={fieldLabel(<ShieldRoundedIcon sx={{ color: '#2563EB' }} />, 'Status')}
              value={form.status ?? 'Active'}
              onChange={e => setForm({ ...form, status: e.target.value as Employee['status'] })}
              fullWidth
              sx={fieldStyles}
              SelectProps={{
                renderValue: value => {
                  const selected = typeof value === 'string' ? value : '';
                  return (
                    <Chip
                      label={selected}
                      size="small"
                      color={getStatusChip(selected).color}
                      sx={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.3 }}
                    />
                  );
                },
              }}
            >
              <MenuItem value="Active" sx={{ py: 1.25, minHeight: 52 }}>
                <Chip label="Active" color="success" size="small" />
              </MenuItem>
              <MenuItem value="Inactive" sx={{ py: 1.25, minHeight: 52 }}>
                <Chip label="Inactive" color="error" size="small" />
              </MenuItem>
            </TextField>
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
              fontSize: 15,
              fontWeight: 600,
              color: '#334155',
              borderColor: '#cbd5e1',
              minWidth: 130,
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
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
              fontSize: 15,
              fontWeight: 600,
              minWidth: 150,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 12px 26px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 18px 32px rgba(37, 99, 235, 0.24)',
                bgcolor: '#1e40af',
              },
            }}
          >
            {editData ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
        onConfirm={() => handleDelete(Number(deleteId))}
        onCancel={() => setDeleteId(null)}
      />
    </MainLayout>
  );
}
