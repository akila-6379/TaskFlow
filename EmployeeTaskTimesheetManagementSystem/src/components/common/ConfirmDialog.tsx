import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Divider,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
}

export default function ConfirmDialog({
  open, title, message, onConfirm, onCancel,
  confirmLabel = 'Delete',
  confirmColor = 'error',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth closeAfterTransition={false} PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disableElevation
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
