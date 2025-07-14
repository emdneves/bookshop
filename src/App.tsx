import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Home from './pages/Home';
import Product from './pages/Product';
import Orders from './pages/Orders';

const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
    body2: {
      fontSize: '0.6rem',
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
  
  // Determine if current page should show subheader
  const showSubheader = location.pathname === '/' || location.pathname === '/orders';
  
  // State for subheader functionality (only used on landing page)
  const [search, setSearch] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const filterOpen = Boolean(filterAnchorEl);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout
        showSubheader={showSubheader}
        subheaderProps={{
          search,
          onSearchChange: setSearch,
          filterAnchorEl,
          onFilterClick: handleFilterClick,
          onFilterClose: handleFilterClose,
          filterOpen,
        }}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                search={search}
                onSearchChange={setSearch}
                filterAnchorEl={filterAnchorEl}
                onFilterClick={handleFilterClick}
                onFilterClose={handleFilterClose}
                filterOpen={filterOpen}
              />
            } 
          />
          <Route path="/book/:id" element={<Product />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
};

export default App; 