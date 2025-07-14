import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const UserMenu: React.FC<{ user: string | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleClick = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);
  
  const handleLogout = () => { 
    handleClose(); 
    onLogout(); 
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative' }}>
      <Button
        onClick={handleClick}
        sx={{
          minWidth: 0,
          p: 0,
          m: 0,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          lineHeight: 1,
          borderRadius: '50%',
          width: '100%',
          height: '100%',
          '&:hover': {
            background: 'none',
          },
        }}
        disableRipple
        disableFocusRipple
      >
        <AccountCircleOutlinedIcon 
          sx={{
            color: '#222',
            transition: 'color 0.2s',
            '&:hover': { color: '#d32f2f' },
          }}
        />
      </Button>
      
      {isOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            p: 1,
            border: '1px dashed #d32f2f',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <Box
            onClick={handleClose}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              p: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
          >
            <Box sx={{ fontWeight: 600, color: '#222', fontSize: '0.9rem' }}>
              {user || 'User'}
            </Box>
          </Box>
          
          <Divider sx={{ my: 1, borderColor: '#d32f2f' }} />
          
          <Box
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              p: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
          >
            <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
            <Box sx={{ fontWeight: 700, color: '#d32f2f', fontSize: '0.9rem' }}>
              Logout
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserMenu; 