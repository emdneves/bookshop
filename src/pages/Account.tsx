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
  Switch
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

const Account: React.FC = () => {
  const { isAuthenticated, token, role } = useAuth();
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract user ID from JWT token
      // The token contains the user ID in the payload
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

  const totalColumns = cardsPerRow + 2;

  if (!isAuthenticated) {
    return <Alert severity="warning">You must be logged in to view your account.</Alert>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <Box sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />
      
      {/* Center columns: Account content */}
      <Box
        sx={{
          gridColumn: cardsPerRow === 1 ? '2 / 3' : `2 / ${totalColumns}`,
          width: '100%',
          background: 'none',
          p: 3,
          ...(cardsPerRow === 1 && {
            px: 2,
            borderRight: '0.5px dashed #d32f2f',
          }),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Account Profile
        </Typography>
          {userData && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{ 
                borderColor: '#d32f2f', 
                color: '#d32f2f',
                '&:hover': { borderColor: '#b71c1c', backgroundColor: 'rgba(211, 47, 47, 0.04)' }
              }}
            >
              Edit Profile
            </Button>
          )}
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
                  p: 4,
                  border: '1px dashed #d32f2f',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#d32f2f',
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
                          borderColor: '#d32f2f', 
                          color: '#d32f2f',
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
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px dashed #d32f2f',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                  height: 'fit-content',
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#222' }}>
                  Account Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {userData.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Full Name
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {userData.first_name} {userData.last_name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        User ID
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {userData.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Account Activity */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px dashed #d32f2f',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                  height: 'fit-content',
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#222' }}>
                  Account Activity
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarTodayIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Member Since
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {formatDate(userData.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Last Login
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {formatDate(userData.last_login)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarTodayIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>
                        {formatDate(userData.updated_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">No user data available.</Alert>
        )}
      </Box>
      
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 700 }}>
          Edit Profile
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Email Address"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="First Name"
              value={editForm.first_name}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={editForm.last_name}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              fullWidth
              required
            />
            
            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    />
                  }
                  label="Active Account"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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