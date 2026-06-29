'use client';
import {
  Card, CardContent, CardHeader, Box, Typography, Avatar, Divider,
} from '@mui/material';
import { useAppContext } from '@/contexts/AppContext';

const AVATAR_COLORS = ['#1976d2', '#7c3aed', '#059669', '#d97706', '#db2777', '#0891b2'];

export default function RecentActivity() {
  const { state } = useAppContext();

  const activitiesWithEmployee = state.activities.map(a => {
    const emp = state.employees.find(e => Number(e.id) === a.employeeId);
    return {
      ...a,
      employeeName: emp ? emp.name : `Employee #${a.employeeId}`,
    };
  });

  return (
    <Card sx={{ height: '100%', border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
      <CardHeader
        title="Recent Activity"
        subheader="Latest team actions"
        titleTypographyProps={{ variant: 'h6', fontWeight: 700, fontSize: 15, color: '#111827' }}
        subheaderTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Divider sx={{ borderColor: '#f0f2f5', mt: 1.5 }} />
        {activitiesWithEmployee.map((a, i) => (
          <Box key={a.id}>
            <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, py: 1.75, alignItems: 'flex-start' }}>
              <Avatar
                sx={{
                  width: 32, height: 32, fontSize: 12, fontWeight: 700,
                  bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  flexShrink: 0, mt: 0.25,
                }}
              >
                {a.employeeName.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color="#111827" noWrap>{a.employeeName}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{a.action}</Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11 }}>{a.date}</Typography>
              </Box>
            </Box>
            {i < activitiesWithEmployee.length - 1 && <Divider sx={{ borderColor: '#f0f2f5' }} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
