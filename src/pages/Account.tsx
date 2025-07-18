import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  Grid, 
  Chip,
  Skeleton,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getCardsPerRow } from '../utils/helpers';
import { API_BASE_URL } from '../config/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import CenteredMessage from '../components/CenteredMessage';
import { formatSimpleDate } from '../utils/dateFormatter';
import { usePageLayout } from '../hooks/usePageLayout';
import { useSubheaderData } from '../hooks/useSubheaderData';
import AuthGuard from '../components/AuthGuard';
import { 
  ARTIFACT_RED, 
  ARTIFACT_RED_DARK,
  getBorderStyle 
} from '../constants/colors';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
}

interface FieldConfig {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'switch';
  options?: { value: string; label: string }[];
  required?: boolean;
}

// Reusable pill input field component
const PillField: React.FC<FieldConfig> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ color: ARTIFACT_RED, fontSize: 20, flexShrink: 0, width: 24 }}>
      {icon}
    </Box>
    <TextField
      value={value}
      label={label}
      variant="outlined"
      fullWidth
      disabled
      sx={pillInputStyle}
    />
  </Box>
);

// Reusable form field component
const FormField: React.FC<{
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  isAdmin?: boolean;
}> = ({ field, value, onChange, isAdmin }) => {
  if (field.type === 'select') {
    return (
      <FormControl fullWidth>
        <InputLabel>{field.label}</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          sx={pillInputStyle}
        >
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (field.type === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: ARTIFACT_RED,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: ARTIFACT_RED,
              },
            }}
          />
        }
        label={field.label}
      />
    );
  }

  return (
    <TextField
      label={field.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      required={field.required}
      sx={pillInputStyle}
    />
  );
};

// Reusable section component
const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      border: `1px dashed ${ARTIFACT_RED}`,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.8)',
      height: 'fit-content',
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#222' }}>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {children}
    </Box>
  </Paper>
);

// Reusable dialog component
const ConfirmationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
  severity?: 'warning' | 'info';
}> = ({ open, onClose, title, message, confirmText, onConfirm, icon, severity = 'warning' }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: ARTIFACT_RED, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && icon}
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ mb: 2 }}>
        {message}
      </Typography>
      {severity === 'warning' && (
        <Typography variant="body2" sx={{ color: '#666' }}>
          All your data, including books, transactions, and account information will be permanently removed.
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={onClose}
        sx={buttonStyle.outlined}
      >
        Cancel
      </Button>
      <Button 
        onClick={onConfirm}
        variant="contained"
        sx={buttonStyle.contained}
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

// Pill-like input field styling
const pillInputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    border: `1px dotted ${ARTIFACT_RED}`,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    height: '28px',
    '&:hover': {
      border: `1px solid ${ARTIFACT_RED}`,
    },
    '&.Mui-focused': {
      border: `1px solid ${ARTIFACT_RED}`,
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      '& .MuiInputBase-input': {
        color: '#333',
        WebkitTextFillColor: '#333',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputBase-input': {
      padding: '2px 6px',
      fontSize: '13px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    fontSize: '14px',
    '&.Mui-focused': {
      color: ARTIFACT_RED,
    },
    '&.MuiInputLabel-shrink': {
      fontSize: '12px',
    },
  },
};

// Reusable button styles
const buttonStyle = {
  outlined: {
    borderRadius: '25px',
    border: `1px dotted ${ARTIFACT_RED}`,
    color: ARTIFACT_RED,
    '&:hover': { 
      border: `1px solid ${ARTIFACT_RED}`,
      backgroundColor: 'rgba(211, 47, 47, 0.04)' 
    }
  },
  contained: {
    borderRadius: '25px',
    backgroundColor: ARTIFACT_RED,
    '&:hover': { backgroundColor: ARTIFACT_RED_DARK }
  }
};

const Account: React.FC = () => {
  const { isAuthenticated, token, role, logout } = useAuth();
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state for editing
  const [editForm, setEditForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true
  });

  const isAdmin = role === 'admin';
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const navigate = useNavigate();

  // Form field configurations
  const editFormFields: FormFieldConfig[] = [
    { name: 'email', label: 'Email Address', type: 'text' as const, required: true },
    { name: 'first_name', label: 'First Name', type: 'text' as const, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text' as const, required: true },
    ...(isAdmin ? [
      { 
        name: 'role', 
        label: 'Role', 
        type: 'select' as const, 
        options: [
          { value: 'user', label: 'User' },
          { value: 'admin', label: 'Admin' }
        ]
      },
      { name: 'is_active', label: 'Active Account', type: 'switch' as const }
    ] : [])
  ];

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserData();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthMessage(true);
      const timer = setTimeout(() => {
        navigate('/', { state: { openLogin: true } });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]));
      const userId = tokenPayload.id;
      
      console.log('Token payload:', tokenPayload);
      console.log('User ID from token:', userId);
      console.log('Making API call to:', `${API_BASE_URL}/users/${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        if (response.status === 403) {
          // API endpoint is still admin-only, use mock data for now
          console.log('API endpoint is admin-only, using mock data');
          setError('API endpoint requires admin access. Using demo data for now.');
          
          // Use mock data based on the token payload
          const mockUserData = {
            id: userId,
            email: tokenPayload.email,
            first_name: 'Demo',
            last_name: 'User',
            role: tokenPayload.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };
          setUserData(mockUserData);
          return;
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Success response:', data);
      setUserData(data.user);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (userData) {
      setEditForm({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        is_active: userData.is_active
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]));
      const userId = tokenPayload.id;
      
      const updateData: any = {
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name
      };

      // Only include role and is_active if user is admin
      if (isAdmin) {
        updateData.role = editForm.role;
        updateData.is_active = editForm.is_active;
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (response.status === 403) {
          // API endpoint is still admin-only
          setSnackbar({
            open: true,
            message: 'Profile update not available yet. API endpoints are being updated.',
            severity: 'info'
          });
          setEditDialogOpen(false);
          return;
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Validation error');
        } else {
          throw new Error('Failed to update profile');
        }
      }

      const data = await response.json();
      setUserData(data.user);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]));
      const userId = tokenPayload.id;
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          // API endpoint is still admin-only
          setSnackbar({
            open: true,
            message: 'Account deletion not available yet. API endpoints are being updated.',
            severity: 'info'
          });
          setDeleteDialogOpen(false);
          return;
        } else {
          throw new Error('Failed to delete account');
        }
      }

      setSnackbar({
        open: true,
        message: 'Account deleted successfully. You will be logged out.',
        severity: 'success'
      });
      
      // Logout after successful deletion
      setTimeout(() => {
        logout();
      }, 2000);
      
      setDeleteDialogOpen(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete account',
        severity: 'error'
      });
    }
  };

  const totalColumns = cardsPerRow + 2;

  if (!isAuthenticated && showAuthMessage) {
    return (
      <CenteredMessage
        title="Login Required"
        description="You must be logged in to view your account. Redirecting to login..."
        showSpinner
      />
    );
  }

  // Field configurations
  const accountInfoFields: FieldConfig[] = userData ? [
    { icon: <EmailIcon />, label: 'Email Address', value: userData.email },
    { icon: <PersonIcon />, label: 'Full Name', value: `${userData.first_name} ${userData.last_name}` },
    { icon: <PersonIcon />, label: 'User ID', value: userData.id.toString() }
  ] : [];

  const accountActivityFields: FieldConfig[] = userData ? [
    { icon: <CalendarTodayIcon />, label: 'Member Since', value: formatSimpleDate(userData.created_at) },
    { icon: <AccessTimeIcon />, label: 'Last Login', value: formatSimpleDate(userData.last_login) },
    { icon: <CalendarTodayIcon />, label: 'Last Updated', value: formatSimpleDate(userData.updated_at) }
  ] : [];

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
        background: 'none',
        minHeight: 'calc(100vh - 160px)',
      }}
    >
      {/* Side column left */}
      <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
      
      {/* Center columns: Account content */}
      <Box
        sx={{
          gridColumn: cardsPerRow === 1 ? '2 / 3' : `2 / ${totalColumns}`,
          width: '100%',
          background: 'none',
          p: 3,
          ...(cardsPerRow === 1 && {
            px: 2,
            borderRight: getBorderStyle(),
          }),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: ARTIFACT_RED }}>
            Account Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {userData && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={buttonStyle.outlined}
                >
                  Edit Profile
                </Button>
                <Tooltip title="Delete Account">
                  <IconButton
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ 
                      borderRadius: '50%',
                      border: `1px dotted ${ARTIFACT_RED}`,
                      color: ARTIFACT_RED,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { 
                        border: `1px solid ${ARTIFACT_RED}`,
                        backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </Box>
        ) : userData ? (
          <Grid container spacing={3}>
            {/* Profile Header */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px dashed ${ARTIFACT_RED}`,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: ARTIFACT_RED,
                      fontSize: 32,
                      fontWeight: 700,
                      mr: 3,
                    }}
                  >
                    {userData.first_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                      {userData.first_name} {userData.last_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={userData.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                        label={userData.is_active ? 'Active' : 'Inactive'}
                        color={userData.is_active ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={userData.role}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: ARTIFACT_RED, 
                          color: ARTIFACT_RED,
                          fontWeight: 600 
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Account Details */}
            <Grid item xs={12} md={6}>
              <InfoSection title="Account Information">
                {accountInfoFields.map((field, index) => (
                  <PillField key={index} {...field} />
                ))}
              </InfoSection>
            </Grid>

            {/* Account Activity */}
            <Grid item xs={12} md={6}>
              <InfoSection title="Account Activity">
                {accountActivityFields.map((field, index) => (
                  <PillField key={index} {...field} />
                ))}
              </InfoSection>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">No user data available.</Alert>
        )}
      </Box>
      
      {/* Side column right */}
      <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: ARTIFACT_RED, fontWeight: 700 }}>
          Edit Profile
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {editFormFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={editForm[field.name as keyof typeof editForm]}
                onChange={(value) => setEditForm({ ...editForm, [field.name]: value })}
                isAdmin={isAdmin}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={buttonStyle.outlined}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={buttonStyle.contained}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        onConfirm={handleDeleteAccount}
        icon={<WarningIcon sx={{ color: ARTIFACT_RED }} />}
        severity="warning"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as 'success' | 'error' | 'info'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Account; 