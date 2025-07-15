import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

import { getCardsPerRow } from '../utils/helpers';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

  // Shared icon style for all navigation icons
  const iconStyle = {
    size: "small" as const,
    color: "inherit" as const,
    sx: {
      border: '0.5px dashed #d32f2f',
      background: 'none',
      borderRadius: '50%',
      transition: 'border 0.2s',
      outline: 'none',
      boxShadow: 'none',
      width: 36,
      height: 36,
      '&:focus': {
        outline: 'none',
        boxShadow: 'none',
        background: 'none',
      },
      '&:active': {
        outline: 'none',
        boxShadow: 'none',
        background: 'none',
      },
      '& svg': {
        color: '#222',
        transition: 'color 0.2s',
        fontSize: '1.2rem',
      },
      '&:hover svg': { color: '#d32f2f' },
    }
  };

  // Desktop icon style (larger size)
  const desktopIconStyle = {
    color: "inherit" as const,
    sx: {
      border: '0.5px dashed #d32f2f',
      background: 'none',
      borderRadius: '50%',
      transition: 'border 0.2s',
      outline: 'none',
      boxShadow: 'none',
      '&:focus': {
        outline: 'none',
        boxShadow: 'none',
        background: 'none',
      },
      '&:active': {
        outline: 'none',
        boxShadow: 'none',
        background: 'none',
      },
      '& svg': {
        color: '#222',
        transition: 'color 0.2s',
      },
      '&:hover svg': { color: '#d32f2f' },
    }
  };

  // Reusable function to create navigation icons
  const createNavIcon = (to: string, label: string, icon: React.ReactNode, tooltip: string, isMobile: boolean = false) => (
    <Tooltip title={tooltip} arrow>
      <Link to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="caption" sx={{ 
          fontSize: isMobile ? '0.8rem' : '0.75rem', 
          fontWeight: 600, 
          color: '#222', 
          mb: isMobile ? 0.25 : 0.5 
        }}>
          {label}
        </Typography>
        <IconButton {...(isMobile ? iconStyle : desktopIconStyle)}>
          {icon}
        </IconButton>
      </Link>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        width: '100%',
        borderBottom: '1px dashed #d32f2f',
        background: 'floralwhite',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'center',
        minHeight: cardsPerRow === 1 ? 120 : 80, // Increase height for mobile to accommodate icons below
        height: cardsPerRow === 1 ? 120 : 80,
        maxHeight: cardsPerRow === 1 ? 120 : 80,
      }}
    >
      {/* Side column left */}
      <Box sx={{ height: '100%' }} />
      {/* Center columns */}
      {Array.from({ length: cardsPerRow }).map((_, i) => {
        // First center column: Bookshop title and icons (mobile) or just title (desktop)
        if (i === 0) {
          return (
            <Box
              key={i}
              sx={{
                px: 1,
                display: 'flex',
                flexDirection: cardsPerRow === 1 ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: cardsPerRow === 1 ? 1 : 0,
              }}
            >
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', width: '100%' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#222',
                    letterSpacing: 1,
                    textAlign: 'center',
                    width: '100%',
                    fontSize: cardsPerRow === 1 ? '2rem' : '2.125rem', // Increased from 1.5rem to 2rem for mobile
                  }}
                >
                  Bookshop
                </Typography>
              </Link>
              
              {/* Icons for mobile - show beneath title */}
              {cardsPerRow === 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      {createNavIcon('/buy', 'Buy', <ShoppingCartOutlinedIcon />, 'Compras', true)}
                      {createNavIcon('/sell', 'Sell', <StoreOutlinedIcon />, 'Vendas', true)}
                      {createNavIcon('/books', 'MyBooks', <MenuBookOutlinedIcon />, 'Ofertas', true)}
                      {createNavIcon('/account', 'Account', <AccountCircleOutlinedIcon />, 'Account', true)}
                      <Tooltip title="Logout" arrow>
                        <Box 
                          onClick={handleLogout}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#222', mb: 0.25 }}>
                            Logout
                          </Typography>
                          <IconButton 
                            {...iconStyle}
                            sx={{
                              ...iconStyle.sx,
                              background: '#d32f2f',
                              '& svg': {
                                color: '#fff',
                                transition: 'color 0.2s',
                                fontSize: '1.2rem',
                              },
                              '&:hover': {
                                background: '#b71c1c',
                              },
                            }}
                          >
                            <PowerSettingsNewIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Login" arrow>
                      <Box 
                        onClick={() => setAuthModalOpen(true)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#222', mb: 0.25 }}>
                          Login
                        </Typography>
                        <IconButton {...iconStyle}>
                          <PowerSettingsNewIcon />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          );
        }
        // Last center column: icon group (desktop only)
        if (i === cardsPerRow - 1 && cardsPerRow > 1) {
          return (
            <Box
              key={i}
              sx={{
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 1.5,
              }}
            >
              {isAuthenticated ? (
                <>
                  {createNavIcon('/buy', 'Buy', <ShoppingCartOutlinedIcon />, 'Compras', false)}
                  {createNavIcon('/sell', 'Sell', <StoreOutlinedIcon />, 'Vendas', false)}
                  {createNavIcon('/books', 'MyBooks', <MenuBookOutlinedIcon />, 'Ofertas', false)}
                  {createNavIcon('/account', 'Account', <AccountCircleOutlinedIcon />, 'Account', false)}
                  <Tooltip title="Logout" arrow>
                    <Box 
                      onClick={handleLogout}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                        Logout
                      </Typography>
                      <IconButton 
                        {...desktopIconStyle}
                        sx={{
                          ...desktopIconStyle.sx,
                          background: '#d32f2f',
                          '& svg': {
                            color: '#fff',
                            transition: 'color 0.2s',
                          },
                          '&:hover': {
                            background: '#b71c1c',
                          },
                        }}
                      >
                        <PowerSettingsNewIcon />
                      </IconButton>
                    </Box>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Login" arrow>
                  <Box 
                    onClick={() => setAuthModalOpen(true)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                      Login
                    </Typography>
                    <IconButton {...desktopIconStyle}>
                      <PowerSettingsNewIcon />
                    </IconButton>
                  </Box>
                </Tooltip>
              )}
            </Box>
          );
        }
        // Other center columns: empty, no border
        return <Box key={i} sx={{ height: '100%' }} />;
      })}
      {/* Side column right */}
      <Box sx={{ height: '100%' }} />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Box>
  );
};

export default Header; 