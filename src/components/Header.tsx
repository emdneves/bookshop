import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { getCardsPerRow } from '../utils/helpers';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

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
        minHeight: 80,
        height: 80,
        maxHeight: 80,
      }}
    >
      {/* Side column left */}
      <Box sx={{ height: '100%' }} />
      {/* Center columns */}
      {Array.from({ length: cardsPerRow }).map((_, i) => {
        // First center column: Bookshop title
        if (i === 0) {
          return (
            <Box
              key={i}
              sx={{
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Center horizontally
                height: '100%',
                // borderRight: '0.5px dashed #d32f2f', // Remove grid line
              }}
            >
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', width: '100%' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#222',
                    letterSpacing: 1,
                    textAlign: 'center', // Center text
                    width: '100%',
                  }}
                >
        Bookshop
      </Typography>
              </Link>
            </Box>
          );
        }
        // Last center column: icon group
        if (i === cardsPerRow - 1) {
          return (
            <Box
              key={i}
              sx={{
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                // borderRight: '0.5px dashed #d32f2f', // Remove grid line
              }}
            >
              {isAuthenticated ? (
                <>
                  <Tooltip title="Compras" arrow>
                    <Link to="/buy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                        Buy
                      </Typography>
                      <IconButton
                        color="inherit"
                        sx={{
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
                        }}
                      >
                        <ShoppingCartOutlinedIcon />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Vendas" arrow>
                    <Link to="/sell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                        Sell
                      </Typography>
                      <IconButton
                        color="inherit"
                        sx={{
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
                        }}
                      >
                        <StoreOutlinedIcon />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Ofertas" arrow>
                    <Link to="/books" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                        MyBooks
                      </Typography>
                      <IconButton
                        color="inherit"
                        sx={{
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
                        }}
                      >
                        <MenuBookOutlinedIcon />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Account" arrow>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                        Account
                      </Typography>
                      <Box sx={{
                        border: '0.5px dashed #d32f2f',
                        background: 'none',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border 0.2s',
                        width: 40,
                        height: 40,
                        '&:hover': { borderColor: '#d32f2f' },
                      }}>
                        <UserMenu user={user} onLogout={logout} />
                      </Box>
                    </Box>
                  </Tooltip>
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={() => setAuthModalOpen(true)}
            sx={{
              bgcolor: '#d32f2f',
              fontWeight: 600,
              '&:hover': { bgcolor: '#b71c1c' },
            }}
          >
            Login / Register
          </Button>
        )}
              <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </Box>
          );
        }
        // Other center columns: empty, no border
        return <Box key={i} sx={{ height: '100%' }} />;
      })}
      {/* Side column right */}
      <Box sx={{ height: '100%' }} />
    </Box>
  );
};

export default Header; 