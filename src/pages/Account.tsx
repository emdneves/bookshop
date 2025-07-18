import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
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
import DataTable from '../components/DataTable';
import Pill from '../components/Pill';
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

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'switch';
  options?: { value: string; label: string }[];
  required?: boolean;
}

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
  const { user, logout, isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
  });

  const isAdminUser = role === 'admin';

  // Form field configurations
  const editFormFields: FormFieldConfig[] = [
    { name: 'email', label: 'Email', type: 'text' as const, required: true },
    { name: 'first_name', label: 'First Name', type: 'text' as const, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text' as const, required: true },
    ...(isAdminUser ? [
      { 
        name: 'role', 
        label: 'Role', 
        type: 'select' as const, 
        options: [
          { value: 'user', label: 'User' },
          { value: 'admin', label: 'Admin' }
        ]
      },
      { name: 'is_active', label: 'Active', type: 'switch' as const }
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
    if (!token || !userData) return;

    try {
      const updateData: any = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      };

      // Only include role and is_active if user is admin
      if (isAdminUser) {
        updateData.role = editForm.role;
        updateData.is_active = editForm.is_active;
      }

      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      setUserData(updatedUser);
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

  // Inline editing functions
  const handleInlineEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleInlineSave = async (field: string) => {
    if (!token || !userData || !editValue.trim()) return;

    setSavingField(true);
    try {
      const updateData: any = { [field]: editValue.trim() };

      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update field');

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setEditingField(null);
      setEditValue('');
      setSnackbar({
        open: true,
        message: `${field.replace('_', ' ')} updated successfully!`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update field',
        severity: 'error'
      });
    } finally {
      setSavingField(false);
    }
  };

  const handleInlineCancel = () => {
    setEditingField(null);
    setEditValue('');
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Profile Header */}
            <Box
              sx={{
                p: 2,
                border: getBorderStyle(),
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
            </Box>

            {/* Account Information Table */}
            <DataTable
              data={[
                {
                  field: 'email',
                  value: userData.email,
                  icon: <EmailIcon />,
                  editable: false,
                },
                {
                  field: 'first_name',
                  value: userData.first_name,
                  icon: <PersonIcon />,
                  editable: true,
                },
                {
                  field: 'last_name',
                  value: userData.last_name,
                  icon: <PersonIcon />,
                  editable: true,
                },
              ]}
              columns={[
                {
                  key: 'field',
                  label: 'Field',
                  width: 200,
                  render: (value, row) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: ARTIFACT_RED, fontSize: 20 }}>
                        {row.icon}
                      </Box>
                      <span>{value === 'first_name' ? 'First Name' : 
                             value === 'last_name' ? 'Last Name' : 
                             value === 'email' ? 'Email Address' : value}</span>
                    </Box>
                  ),
                },
                {
                  key: 'value',
                  label: 'Value',
                  render: (value, row) => {
                    if (row.editable && editingField === row.field) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Pill fullWidth sx={{ 
                            justifyContent: 'flex-start',
                            padding: '2px 8px',
                            minHeight: '28px',
                          }}>
                            <Box
                              component="input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleInlineSave(row.field)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleInlineSave(row.field);
                                } else if (e.key === 'Escape') {
                                  handleInlineCancel();
                                }
                              }}
                              autoFocus
                              placeholder={row.field === 'first_name' ? 'Enter first name' : 'Enter last name'}
                              style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'inherit',
                                fontSize: '14px',
                              }}
                            />
                          </Pill>
                        </Box>
                      );
                    }
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {row.editable ? (
                          <Pill
                            fullWidth
                            onClick={() => handleInlineEdit(row.field, value)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { 
                                backgroundColor: 'rgba(139, 0, 0, 0.04)',
                                border: `1px solid ${ARTIFACT_RED}`,
                              }
                            }}
                          >
                            {value}
                          </Pill>
                        ) : (
                          <span>{value}</span>
                        )}
                      </Box>
                    );
                  },
                },
              ]}
              emptyMessage="No account information available."
              cardsPerRow={cardsPerRow}
              totalColumns={totalColumns}
            />

            {/* Account Activity Table */}
            <DataTable
              data={[
                {
                  field: 'Member Since',
                  value: formatSimpleDate(userData.created_at),
                  icon: <CalendarTodayIcon />,
                },
                {
                  field: 'Last Login',
                  value: formatSimpleDate(userData.last_login),
                  icon: <AccessTimeIcon />,
                },
                {
                  field: 'Last Updated',
                  value: formatSimpleDate(userData.updated_at),
                  icon: <CalendarTodayIcon />,
                },
              ]}
              columns={[
                {
                  key: 'field',
                  label: 'Activity',
                  width: 200,
                  render: (value, row) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: ARTIFACT_RED, fontSize: 20 }}>
                        {row.icon}
                      </Box>
                      <span>{value}</span>
                    </Box>
                  ),
                },
                {
                  key: 'value',
                  label: 'Date',
                  render: (value) => <span>{value}</span>,
                },
              ]}
              emptyMessage="No account activity available."
              cardsPerRow={cardsPerRow}
              totalColumns={totalColumns}
            />
          </Box>
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
                isAdmin={isAdminUser}
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