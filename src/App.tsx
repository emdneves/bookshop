import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Product from './pages/Product';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import Books from './pages/Books';
import Account from './pages/Account';

// Product component with breadcrumbs
const ProductWithBreadcrumbs: React.FC = () => {
  const { id } = useParams();
  const [bookTitle, setBookTitle] = useState('Book Details');
  
  // Fetch book title for breadcrumbs (simplified for now)
  useEffect(() => {
    // In a real implementation, you'd fetch the book data here
    // For now, we'll use a placeholder
    setBookTitle('Book Details');
  }, [id]);

  return (
    <Layout
      showSubheader={true}
      subheaderProps={{
        mode: 'breadcrumbs',
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: bookTitle, href: undefined }
        ]
      }}
    >
      <Product />
    </Layout>
  );
};

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
  const showSubheader = location.pathname === '/' || location.pathname === '/buy' || location.pathname === '/sell' || location.pathname === '/books';
  
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
    <HelmetProvider>
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
          <Route path="/book/:id" element={<ProductWithBreadcrumbs />} />
          <Route path="/buy" element={<Buy search={search} onSearchChange={setSearch} />} />
          <Route path="/sell" element={<Sell search={search} onSearchChange={setSearch} />} />
          <Route path="/books" element={<Books search={search} onSearchChange={setSearch} />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
    </ThemeProvider>
    </HelmetProvider>
  );
};

export default App; 