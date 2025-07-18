import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home, { HomeSubheaderLeft, HomeSubheaderRight } from './pages/Home';
import Product from './pages/Product';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import Books from './pages/Books';
import Account from './pages/Account';
import { FONT_SIZES } from './constants/typography';

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
  
  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Determine if current page should show subheader
  const showSubheader = location.pathname === '/' || location.pathname === '/buy' || location.pathname === '/sell' || location.pathname === '/books';
  


  return (
    <HelmetProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <Layout
          showSubheader={showSubheader}
          subheaderProps={{
            left: <HomeSubheaderLeft />,
            right: <HomeSubheaderRight />,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<Product />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/sell" element={<Sell />} />
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