import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home, { HomeSubheaderLeft } from './pages/Home';
import Product from './pages/Product';
import Buy from './pages/Buy';
import Sell, { SellSubheaderLeft, SellSubheaderRight } from './pages/Sell';
import Books from './pages/Books';
import Account from './pages/Account';
import { FONT_SIZES } from './constants/typography';

import SellBookModal from './components/SellBookModal';
import SellButton from './components/subheader/SellButton';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';

const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
    body2: {
      fontSize: FONT_SIZES.MEDIUM,
      lineHeight: 1.1,
    },
  },
  palette: {
    background: {
      default: '#fafafa',
    },
  },
});

const App: React.FC = () => {
  const location = useLocation();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Determine if current page should show subheader
  const showSubheader = location.pathname === '/' || location.pathname === '/buy' || location.pathname === '/sell' || location.pathname === '/books';
  
  // Determine subheader left and right buttons
  let subheaderLeft = <HomeSubheaderLeft />;
  let subheaderRight = (
    <SellButton
      fullWidth
      onClick={() => {
        if (isAuthenticated) {
          setSellModalOpen(true);
        } else {
          setAuthModalOpen(true);
        }
      }}
    />
  );
  if (location.pathname === '/sell') {
    subheaderLeft = <SellSubheaderLeft />;
    // Use the same button/modal logic for consistency
    subheaderRight = (
      <SellButton
        fullWidth
        onClick={() => {
          if (isAuthenticated) {
            setSellModalOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
      />
    );
  }

  return (
    <HelmetProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <SellBookModal
          open={sellModalOpen}
          onClose={() => setSellModalOpen(false)}
          onSubmit={async () => { setSellModalOpen(false); }} // The actual onSubmit logic is handled in Sell page, here just close
        />
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
        <Layout
          showSubheader={showSubheader}
          subheaderProps={{
            left: subheaderLeft,
            right: subheaderRight,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<Product />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/sell" element={<Sell sellModalOpen={sellModalOpen} setSellModalOpen={setSellModalOpen} />} />
            <Route path="/books" element={<Books />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </Layout>
      </SearchProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
};

export default App; 