'use client';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Typography, IconButton, Tooltip, Paper, Divider,
  Avatar, InputAdornment, Fade, Grow, Chip, Popover, List, ListItemButton, ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import MonitorRoundedIcon from '@mui/icons-material/MonitorRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import DeveloperBoardRoundedIcon from '@mui/icons-material/DeveloperBoardRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useTheme } from "@mui/material/styles";
import { Employee } from '@/types';
import { useState, useRef, useEffect, useMemo } from 'react';
import { capDateYear } from '@/utils/dateUtils';
import { employeeService } from '@/services/employeeService';

const DEPARTMENTS = ['Engineering', 'Design', 'Management', 'QA', 'DevOps', 'HR', 'Marketing'];
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
    case 'HR': return { icon: <GroupRoundedIcon sx={{ fontSize: 16 }} />, bg: '#dcfce7', color: '#15803d' };
    case 'DevOps': return { icon: <CloudRoundedIcon sx={{ fontSize: 16 }} />, bg: '#cffafe', color: '#0369a1' };
    case 'Management': return { icon: <BusinessRoundedIcon sx={{ fontSize: 16 }} />, bg: '#e0e7ff', color: '#4338ca' };
    case 'Design': return { icon: <PaletteRoundedIcon sx={{ fontSize: 16 }} />, bg: '#f5f3ff', color: '#7c3aed' };
    case 'QA': return { icon: <BugReportRoundedIcon sx={{ fontSize: 16 }} />, bg: '#ffedd5', color: '#ea580c' };
    case 'Marketing': return { icon: <CampaignRoundedIcon sx={{ fontSize: 16 }} />, bg: '#fce7f3', color: '#db2777' };
    default: return { icon: <BusinessRoundedIcon sx={{ fontSize: 16 }} />, bg: '#f1f5f9', color: '#64748b' };
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

const isFutureDate = (dateStr: string) => {
  if (!dateStr) return false;
  const todayObj = new Date();
  const year = todayObj.getFullYear();
  const month = String(todayObj.getMonth() + 1).padStart(2, '0');
  const day = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return dateStr > todayStr;
};

export default function EmployeesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, 'id'>>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Bug 3: prevents duplicate submissions on rapid button clicks
  const [isSaving, setIsSaving] = useState(false);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!form.name || !form.name.trim()) {
      errs.name = 'Full Name is required.';
    }

    if (!form.email || !form.email.trim()) {
      errs.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errs.email = 'Invalid email address format.';
      }
    }

    if (!form.department) {
      errs.department = 'Department is required.';
    }

    if (!form.designation) {
      errs.designation = 'Designation is required.';
    }

    // Bug 1: phone is now mandatory — check for empty first, then validate format
    if (!form.phone || !form.phone.trim()) {
      errs.phone = 'Phone Number is required.';
    } else {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        errs.phone = 'Phone number must contain exactly 10 digits.';
      }
    }

    if (!form.joinDate) {
      errs.joinDate = 'Join Date is required.';
    }

    if (form.employeeId) {
      const isDuplicate = employees.some((employee) =>
        employee.employeeId === form.employeeId.trim() && employee.id !== editData?.id
      );
      if (isDuplicate) {
        errs.employeeId = 'Employee ID already exists.';
      }
    }

    return errs;
  }, [form, employees, editData]);

  // Bug 3: also disable while a save is in-flight to block double-clicks
  const isSaveDisabled = Object.keys(validationErrors).length > 0 || isSaving;
  const isStatusDisabled = editData === null || isFutureDate(form.joinDate);

  const handleFieldChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const fieldLabel = (icon: React.ReactNode, text: string) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 13, fontWeight: 600 }}>
      {icon}
      <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>{text}</Typography>
    </Box>
  );

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      minHeight: 52,
      backgroundColor: 'background.paper',
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'text.disabled',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      fontWeight: 600,
    },
    '& .MuiInputBase-input': {
      fontSize: '15px',
      fontWeight: 500,
      color: 'text.primary',
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '15px',
      fontWeight: 500,
      color: 'text.primary',
    },
    '& .MuiSelect-select': {
      fontSize: '15px',
      fontWeight: 500,
      color: 'text.primary',
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

  const openAdd = () => {
    setEditData(null);
    setForm(EMPTY);
    setTouched({});
    setIsSaving(false);
    setOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditData(emp);
    const initialStatus = isFutureDate(emp.joinDate ?? '') ? 'Inactive' : (emp.status ?? 'Active');
    setForm({
      employeeId: emp.employeeId ?? '',
      name: emp.name ?? '',
      email: emp.email ?? '',
      department: emp.department ?? '',
      designation: emp.designation ?? '',
      status: initialStatus,
      phone: emp.phone ?? '',
      joinDate: emp.joinDate ?? ''
    });
    setTouched({
      name: true,
      email: true,
      department: true,
      designation: true,
      phone: true,
      joinDate: true
    });
    setIsSaving(false);
    setOpen(true);
  };

  const handleSave = async () => {
    // Bug 3: guard against concurrent invocations caused by rapid button clicks
    if (isSaveDisabled) {
      return;
    }

    setIsSaving(true);
    try {
      if (editData) { await employeeService.update(Number(editData.id), { ...form, id: editData.id }); }
      else { await employeeService.create(form); }
      await loadEmployees();
      setOpen(false); setEditData(null); setForm(EMPTY); setTouched({});
      // isSaving is intentionally NOT reset here — the dialog closes on success
    } catch (error) {
      console.error('Error saving employee:', error);
      // Bug 3: re-enable the button only if the request failed so the user can retry
      setIsSaving(false);
    }
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
  const openFilter = (e: React.MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget);
  const closeFilter = () => setFilterAnchor(null);
  const selectDept = (dept: string) => { setFilterDept(dept); closeFilter(); };

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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {row.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: 'text.secondary', lineHeight: 1.2 }}>
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
          <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EmailRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 500 }}>{value}</Typography>
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
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
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
        <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 400, height: '100%', display: 'flex', alignItems: 'center' }}>
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
              bgcolor: active ? 'rgba(34,197,94,0.12)' : 'action.selected',
              border: '1px solid',
              borderColor: active ? 'success.light' : 'divider',
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: active ? 'success.main' : 'text.disabled', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? 'success.main' : 'text.secondary', lineHeight: 1 }}>
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
                bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                color: isDark ? '#60a5fa' : '#2563EB',
                border: '1px solid',
                borderColor: isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.15)',
                transition: 'all 0.25s ease',
                '&:hover': { bgcolor: isDark ? 'rgba(37,99,235,0.25)' : '#dbeafe', transform: 'translateY(-2px)' },
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
                bgcolor: isDark ? 'rgba(239,68,68,0.15)' : '#fff1f2',
                color: isDark ? '#f87171' : '#dc2626',
                border: '1px solid',
                borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(220,38,38,0.15)',
                transition: 'all 0.25s ease',
                '&:hover': { bgcolor: isDark ? 'rgba(239,68,68,0.25)' : '#fee2e2', transform: 'translateY(-2px)' },
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
              background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              boxShadow: isDark ? '0 4px 12px rgba(124,58,237,0.25)' : '0 4px 12px rgba(37,99,235,0.25)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: isDark ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.35)' : '0 6px 18px rgba(37,99,235,0.35)',
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
        gap: 1,
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
          sx={{ flex: 1, minWidth: 260 }}
        />

        {/* Filter button — opens department popover */}
        <Button
          variant="outlined"
          startIcon={<FilterListRoundedIcon />}
          onClick={openFilter}
          disableElevation
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            height: 40,
            px: 2,
            color: filterDept ? 'primary.main' : 'text.primary',
            borderColor: filterDept ? 'primary.main' : 'divider',
            bgcolor: filterDept ? 'action.selected' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled', transform: 'translateY(-1px)' },
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
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 4,
              minWidth: 200,
              overflow: 'hidden',
            },
          }}
        >
          {/* Popover header */}
          <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
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
                  '&.Mui-selected': { bgcolor: 'action.selected', color: 'primary.main' },
                  '&.Mui-selected:hover': { bgcolor: 'action.hover' },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={dept || 'All Departments'}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: filterDept === dept ? 700 : 400,
                    color: filterDept === dept ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Popover>

        {/* Export button — exports filtered rows to CSV */}
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

      {/* ── Main table card ── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: 4 },
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
              bgcolor: 'action.hover',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeader': {
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: 11,
              fontWeight: 700,
              color: 'text.secondary',
            },

            /* ── Rows ── */
            '& .MuiDataGrid-row': {
              transition: 'all 0.2s ease',
              cursor: 'default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-1px)',
              zIndex: 1,
            },
            '& .MuiDataGrid-row:last-child': {
              borderBottom: 'none',
            },

            /* ── Cells ── */
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
              fontSize: 13,
              color: 'text.primary',
              outline: 'none !important',
            },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-cell:focus-within': { outline: 'none' },

            /* ── Footer / pagination ── */
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 1,
            },
            '& .MuiTablePagination-root': {
              fontSize: 13,
              color: 'text.secondary',
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
            '& .MuiCheckbox-root': { color: 'text.disabled' },

            /* ── Separator lines ── */
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-withBorderColor': { borderColor: 'divider' },
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
            boxShadow: 24,
            background: 'background.paper',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: 3.5, pt: 3, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8' }}>
              <PersonRoundedIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'text.primary' }}>
                {editData ? 'Edit Employee' : 'Add New Employee'}
              </Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 400, color: 'text.secondary', mt: 0.5 }}>
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
              bgcolor: 'action.hover',
              color: 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'action.selected', transform: 'translateY(-1px)' },
            }}
            aria-label="Close edit employee dialog"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        <DialogContent sx={{ pt: 3, pb: 2, px: 3.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              size="small"
              label={fieldLabel(<BadgeRoundedIcon sx={{ color: 'primary.main' }} />, 'Employee ID')}
              value={editData ? (form.employeeId ?? '') : 'Auto-generated'}
              disabled={true}
              error={Boolean(touched.employeeId && validationErrors.employeeId)}
              helperText={touched.employeeId && validationErrors.employeeId ? validationErrors.employeeId : ''}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<PersonRoundedIcon sx={{ color: 'primary.main' }} />, 'Full Name')}
              value={form.name ?? ''}
              onChange={e => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={Boolean(touched.name && validationErrors.name)}
              helperText={touched.name && validationErrors.name ? validationErrors.name : ''}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<EmailRoundedIcon sx={{ color: 'primary.main' }} />, 'Email')}
              value={form.email ?? ''}
              onChange={e => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={Boolean(touched.email && validationErrors.email)}
              helperText={touched.email && validationErrors.email ? validationErrors.email : ''}
              fullWidth
              sx={[fieldStyles, { gridColumn: '1/-1' }]}
            />
            <TextField
              size="small"
              select
              label={fieldLabel(<BusinessRoundedIcon sx={{ color: 'primary.main' }} />, 'Department')}
              value={form.department ?? ''}
              onChange={e => {
                setForm(prev => ({
                  ...prev,
                  department: e.target.value,
                  designation: '',
                }));
                setTouched(prev => ({
                  ...prev,
                  department: true,
                  designation: true,
                }));
              }}
              onBlur={() => handleBlur('department')}
              error={Boolean(touched.department && validationErrors.department)}
              helperText={touched.department && validationErrors.department ? validationErrors.department : ''}
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
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'text.primary' }}>{selected}</Typography>
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
              label={fieldLabel(<WorkRoundedIcon sx={{ color: 'primary.main' }} />, 'Designation')}
              value={form.designation ?? ''}
              onChange={e => handleFieldChange('designation', e.target.value)}
              onBlur={() => handleBlur('designation')}
              error={Boolean(touched.designation && validationErrors.designation)}
              helperText={touched.designation && validationErrors.designation ? validationErrors.designation : ''}
              fullWidth
              sx={fieldStyles}
              SelectProps={{
                renderValue: (value: unknown) => {
                  const selected = typeof value === 'string' ? value : '';
                  const icon = getDesignationIcon(selected);
                  return (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '10px', bgcolor: 'action.selected', color: icon.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon.icon}
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'text.primary' }}>{selected}</Typography>
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
                      <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: 'action.selected', color: icon.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
              label={fieldLabel(<PhoneRoundedIcon sx={{ color: 'primary.main' }} />, 'Phone')}
              value={form.phone ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm(prev => ({ ...prev, phone: digits }));
                setTouched(prev => ({ ...prev, phone: true }));
              }}
              onBlur={() => handleBlur('phone')}
              error={Boolean(touched.phone && validationErrors.phone)}
              helperText={touched.phone && validationErrors.phone ? validationErrors.phone : ''}
              fullWidth
              sx={fieldStyles}
            />
            <TextField
              size="small"
              label={fieldLabel(<CalendarTodayRoundedIcon sx={{ color: 'primary.main' }} />, 'Join Date')}
              type="date"
              value={form.joinDate ?? ''}
              onChange={e => {
                const newJoinDate = capDateYear(e.target.value);
                let newStatus = form.status;
                if (editData === null) {
                  newStatus = isFutureDate(newJoinDate) ? 'Inactive' : 'Active';
                } else {
                  if (isFutureDate(newJoinDate)) {
                    newStatus = 'Inactive';
                  }
                }
                setForm(prev => ({ ...prev, joinDate: newJoinDate, status: newStatus }));
                setTouched(prev => ({ ...prev, joinDate: true }));
              }}
              onBlur={() => handleBlur('joinDate')}
              error={Boolean(touched.joinDate && validationErrors.joinDate)}
              helperText={touched.joinDate && validationErrors.joinDate ? validationErrors.joinDate : ''}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />
            <TextField
              size="small"
              select
              label={fieldLabel(<ShieldRoundedIcon sx={{ color: 'primary.main' }} />, 'Status')}
              value={form.status ?? 'Active'}
              onChange={e => handleFieldChange('status', e.target.value as Employee['status'])}
              disabled={isStatusDisabled}
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

        <Divider />

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
              color: 'text.primary',
              borderColor: 'divider',
              minWidth: 130,
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            variant="contained"
            disableElevation
            startIcon={<SaveRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 600,
              minWidth: 150,
              background: isDark ? 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: isDark ? '0 12px 26px rgba(124, 58, 237, 0.2)' : '0 12px 26px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: isDark ? '0 18px 32px rgba(124, 58, 237, 0.25)' : '0 18px 32px rgba(37, 99, 235, 0.24)',
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                background: 'action.disabledBackground',
                color: 'action.disabled',
                boxShadow: 'none',
              }
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
