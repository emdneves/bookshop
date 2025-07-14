import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';

const UserMenu: React.FC<{ user: string | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const username = user ? user.split('@')[0] : 'I';
  const initial = username.charAt(0).toUpperCase();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { handleClose(); onLogout(); };

  return (
    <>
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
          '&:hover .user-initial, &:focus .user-initial': {
            color: '#d32f2f',
            borderColor: '#d32f2f'
          },
        }}
        disableRipple
        disableFocusRipple
      >
        <Box
          className="user-initial"
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '0.5px dashed #d32f2f',
            borderRadius: '50%',
            color: '#222',
            fontWeight: 700,
            fontSize: 24,
            background: 'none',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          {initial}
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { mt: 1, minWidth: 240, borderRadius: 3, p: 1 }
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon><ShoppingCartIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary="Os teus pedidos" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><LockIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary="Perfil e segurança" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><SettingsIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary="Definições" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><HelpOutlineIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary="Ajuda" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ justifyContent: 'center' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="medium" sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          <ListItemText
            primary="Terminar sessão"
            primaryTypographyProps={{ fontWeight: 700, color: '#d32f2f', textAlign: 'center' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu; 