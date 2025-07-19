import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon,
  Print as PrintIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ShoppingCartOutlined as ShoppingCartOutlinedIcon,
  StoreOutlined as StoreOutlinedIcon,
  MenuBookOutlined as MenuBookOutlinedIcon,
  AccountCircleOutlined as AccountCircleOutlinedIcon,
  PowerSettingsNew as PowerSettingsNewIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { getCardsPerRow } from '../utils/helpers';
import { 
  SHARED_BG, 
  ARTIFACT_RED, 
  ARTIFACT_RED_DARK,
  getBorderStyle 
} from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Open login modal if redirected with openLogin state
  useEffect(() => {
    if (location.pathname === '/' && location.state && (location.state as any).openLogin) {
      setIsAuthModalOpen(true);
      // Remove openLogin from state so it doesn't trigger again
      navigate('/', { replace: true, state: {} });
    }
  }, [location, navigate]);

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
      border: getBorderStyle(),
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
        fontSize: FONT_SIZES.LARGE,
      },
      '&:hover svg': { color: ARTIFACT_RED },
    }
  };

  // Desktop icon style (larger size)
  const desktopIconStyle = {
    color: "inherit" as const,
    sx: {
      border: getBorderStyle(),
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
      '&:hover svg': { color: ARTIFACT_RED },
    }
  };

  // Reusable function to create navigation icons
  const createNavIcon = (to: string, label: string, icon: React.ReactNode, tooltip: string, isMobile: boolean = false) => (
    <Tooltip title={tooltip} arrow>
      <Link to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="caption" sx={{ 
          fontSize: isMobile ? FONT_SIZES.SMALL : FONT_SIZES.SMALL, 
                      fontWeight: FONT_WEIGHTS.SEMIBOLD, 
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
        borderBottom: getBorderStyle(),
        background: SHARED_BG,
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
        // First center column: the artifact title and icons (mobile) or just title (desktop)
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
                    fontWeight: FONT_WEIGHTS.BOLD,
                    color: '#222',
                    letterSpacing: 1,
                    textAlign: 'center',
                    width: '100%',
                    fontSize: cardsPerRow === 1 ? FONT_SIZES.XLARGE : FONT_SIZES.XLARGE, // Using XLARGE for titles
                  }}
                >
                  the artifact
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
                  {user ? (
                    <>
                      {createNavIcon('/buy', 'buy', <ShoppingCartOutlinedIcon />, 'Compras', true)}
                      {createNavIcon('/sell', 'sell', <StoreOutlinedIcon />, 'Vendas', true)}
                      {createNavIcon('/books', 'mybooks', <MenuBookOutlinedIcon />, 'Ofertas', true)}
                      {createNavIcon('/account', 'account', <AccountCircleOutlinedIcon />, 'Account', true)}
                      <Tooltip title="Logout" arrow>
                        <Box 
                          onClick={handleLogout}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <Typography variant="caption" sx={{ fontSize: FONT_SIZES.SMALL, fontWeight: FONT_WEIGHTS.SEMIBOLD, color: '#222', mb: 0.25 }}>
                            Logout
                          </Typography>
                          <IconButton 
                            {...iconStyle}
                          >
                            <PowerSettingsNewIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Login" arrow>
                      <Box 
                        onClick={() => setIsAuthModalOpen(true)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <Typography variant="caption" sx={{ fontSize: FONT_SIZES.SMALL, fontWeight: FONT_WEIGHTS.SEMIBOLD, color: '#222', mb: 0.25 }}>
                          Login
                        </Typography>
                        <IconButton 
                          {...iconStyle}
                          sx={{
                            ...iconStyle.sx,
                            background: ARTIFACT_RED,
                            '& svg': {
                              color: '#fff',
                              transition: 'color 0.2s',
                              fontSize: FONT_SIZES.LARGE,
                            },
                            '&:hover': {
                              background: ARTIFACT_RED_DARK,
                            },
                          }}
                        >
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
              {user ? (
                <>
                  {createNavIcon('/buy', 'buy', <ShoppingCartOutlinedIcon />, 'Compras', false)}
                  {createNavIcon('/sell', 'Sell', <StoreOutlinedIcon />, 'Vendas', false)}
                  {createNavIcon('/books', 'mybooks', <MenuBookOutlinedIcon />, 'Ofertas', false)}
                  {createNavIcon('/account', 'account', <AccountCircleOutlinedIcon />, 'Account', false)}
                  <Tooltip title="Logout" arrow>
                    <Box 
                      onClick={handleLogout}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <Typography variant="caption" sx={{ fontSize: FONT_SIZES.SMALL, fontWeight: FONT_WEIGHTS.SEMIBOLD, color: '#222', mb: 0.5 }}>
                        Logout
                      </Typography>
                      <IconButton
                        {...desktopIconStyle}
                      >
                        <PowerSettingsNewIcon />
                      </IconButton>
                    </Box>
                  </Tooltip>
          </>
        ) : (
                <Tooltip title="Login" arrow>
                  <Box 
            onClick={() => setIsAuthModalOpen(true)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <Typography variant="caption" sx={{ fontSize: FONT_SIZES.SMALL, fontWeight: FONT_WEIGHTS.SEMIBOLD, color: '#222', mb: 0.25 }}>
                      Login
                    </Typography>
                    <IconButton 
                      {...desktopIconStyle}
                      sx={{
                        ...desktopIconStyle.sx,
                        background: ARTIFACT_RED,
                        '& svg': {
                          color: '#fff',
                          transition: 'color 0.2s',
                        },
                        '&:hover': {
                          background: ARTIFACT_RED_DARK,
                        },
                      }}
                    >
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
      <AuthModal open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Box>
  );
};

export default Header; 