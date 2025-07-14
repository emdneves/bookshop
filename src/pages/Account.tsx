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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getCardsPerRow } from '../utils/helpers';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Mock user data
const mockUserData = {
  "success": true,
  "user": {
    "id": 1,
    "email": "emanueldneves@gmail.com",
    "first_name": "Emanuel",
    "last_name": "Neves",
    "role": "user",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-07-14T19:01:47.660Z",
    "last_login": "2025-07-14T19:01:47.660Z"
  }
};

const Account: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(mockUserData.user);

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#d32f2f' }}>
          Account Profile
        </Typography>

        {loading ? (
          <Box>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </Box>
        ) : (
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
        )}
      </Box>
      
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
    </Box>
  );
};

export default Account; 