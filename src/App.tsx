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
import { API_BASE_URL } from './config/api';
import { CONTENT_TYPE_IDS } from './constants/contentTypes';

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
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [refreshBooks, setRefreshBooks] = useState(false);
  
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

  // Handler to create a new book (moved from Sell.tsx)
  const handleSellBook = async (fields: any) => {
    const bookData = {
      name: fields.name,
      author: fields.author,
      publisher: fields.publisher,
      isbn: fields.isbn ? Number(fields.isbn) : undefined,
      'Original price': fields['Original price'] ? Number(fields['Original price']) : undefined,
      Cover: fields.Cover || '',
      Pages: fields.Pages ? Number(fields.Pages) : undefined,
      Description: fields.Description || '',
      'publication date': fields['publication date'] ? new Date(fields['publication date']).toISOString() : undefined,
      ed: fields.ed ? Number(fields.ed) : undefined,
      Language: fields.Language || '',
    };
    Object.keys(bookData).forEach(key => {
      if (bookData[key as keyof typeof bookData] === undefined) {
        delete (bookData as any)[key];
      }
    });
    const input = {
      content_type_id: CONTENT_TYPE_IDS.BOOKS,
      data: bookData,
    };
    await fetch(`${API_BASE_URL}/content/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    setSellModalOpen(false);
    setRefreshBooks(prev => !prev);
  };

  return (
    <HelmetProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <SellBookModal
          open={sellModalOpen}
          onClose={() => setSellModalOpen(false)}
          onSubmit={handleSellBook}
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
            <Route path="/" element={<Home refreshBooks={refreshBooks} />} />
            <Route path="/book/:id" element={<Product />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/sell" element={<Sell sellModalOpen={sellModalOpen} setSellModalOpen={setSellModalOpen} refreshBooks={refreshBooks} />} />
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