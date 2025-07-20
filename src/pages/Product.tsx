import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Button, Modal, TextField, Alert, Snackbar, Typography, ThemeProvider, createTheme, CssBaseline, styled } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';
import Subheader from '../components/subheader/Subheader';
import Breadcrumbs from '../components/subheader/Breadcrumbs';
import Pill from '../components/Pill';
import { ARTIFACT_RED, ARTIFACT_RED_DARK } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';


const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  palette: {
    background: {
      default: '#fafafa',
    },
  },
});

const getColumns = (width: number) => {
  if (width < 600) return 1;
  if (width < 900) return 2;
  if (width < 1200) return 4;
  return 5;
};

const ProductBox = ({ background = 'transparent', color, children }: { background?: string; color?: string; children: React.ReactNode }) => (
  <Box
    sx={{
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      background,
      color,
      borderRadius: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      margin: 'auto',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </Box>
);

// Shared style for main content boxes (text/info and image)
const mainContentBoxSx = {
  p: 2,
  m: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  zIndex: 2, // Higher z-index so content appears above grid lines
};

// Reusable MainCard component
const MainCard = ({ children, gridColumn, gridRow, gridColumnEnd, gridRowEnd, background = 'transparent', color = '#111' }: any) => (
  <Box
    sx={{
      ...mainContentBoxSx,
      gridColumn,
      gridRow,
      ...(gridColumnEnd ? { gridColumnEnd } : {}),
      ...(gridRowEnd ? { gridRowEnd } : {}),
    }}
  >
    <ProductBox background={background} color={color}>
      {children}
    </ProductBox>
  </Box>
);

// Card content renderers
const renderInfoCard = (loading: boolean, book: any, orders: any[], onMakeOffer: () => void, getHighestOffer: () => number, isAuthenticated: boolean, offerPrice: string, setOfferPrice: (value: string) => void) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3, mb: 2, bgcolor: 'transparent' }} />
  ) : (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Fixed content area */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.BOLD, color: '#222', mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Title:</strong> {book.name || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Author:</strong> {book.author || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>ISBN:</strong> {book.isbn || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Publisher:</strong> {book.publisher || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Publication date:</strong> {book['publication date'] || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Edition:</strong> {book.ed || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Original price:</strong> {book['Original price'] || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Pages:</strong> {book.Pages || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Language:</strong> {book.Language || '-'}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Description:</strong>
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            flex: 1,
            fontSize: FONT_SIZES.MEDIUM,
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        >
          {book.Description || '-'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
          <strong>Offers:</strong>
        </Typography>
        {getHighestOffer() > 0 ? (
                          <Typography variant="body2" sx={{ color: ARTIFACT_RED, fontWeight: FONT_WEIGHTS.BOLD, mb: 1, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
            Highest Offer: ${getHighestOffer()}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mb: 1, fontSize: FONT_SIZES.MEDIUM, lineHeight: 1.10 }}>
            No offers yet
          </Typography>
        )}
      </Box>
      
      {/* Fixed button area at bottom */}
      <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isAuthenticated && (
          <Pill
            fullWidth
            background="white"
            sx={{
              border: `1px dashed ${ARTIFACT_RED}`,
              '&:hover': { 
                border: `1px solid ${ARTIFACT_RED}`,
              }
            }}
          >
            <Box
              component="input"
              type="number"
              placeholder="Enter your offer amount"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                fontSize: FONT_SIZES.MEDIUM,
                padding: '0',
                boxSizing: 'border-box',
              }}
            />
          </Pill>
        )}
        <Pill
          onClick={onMakeOffer}
          fullWidth
          background={ARTIFACT_RED}
          color="white"
          sx={{
            cursor: 'pointer',
            '&:hover': { 
              backgroundColor: ARTIFACT_RED_DARK,
            }
          }}
        >
          {isAuthenticated ? 'Make Offer' : 'Login to Make Offer'}
        </Pill>
      </Box>
    </Box>
  );

const renderImageCard = (loading: boolean, book: any) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'transparent' }} />
  ) : (
    book.Cover ? (
      <img 
        src={book.Cover} 
        alt={book.name} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain', 
          borderRadius: 3,
          maxWidth: '100%',
          maxHeight: '100%'
        }} 
      />
    ) : (
      <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'transparent' }} />
    )
  );

// Layout config for breakpoints
const getCardLayout = (columns: number) => {
  if (columns === 1) {
    // 1 column bp: img on top (1 square), details below (1 square)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 1,
        gridColumnEnd: 3,
        gridRowEnd: 2,
      },
      {
        type: 'info',
        gridColumn: 2,
        gridRow: 2,
        gridColumnEnd: 3,
        gridRowEnd: 3,
      },
    ];
  }
  
  if (columns === 2) {
    // 2 columns bp: img on top (2x2 squares), details below (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 1,
        gridColumnEnd: 4,
        gridRowEnd: 3,
      },
      {
        type: 'info',
        gridColumn: 2,
        gridRow: 3,
        gridColumnEnd: 4,
        gridRowEnd: 5,
      },
    ];
  }
  
  if (columns === 4) {
    // 4 columns bp: img on left (2x2 squares), details on right (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 1,
        gridColumnEnd: 4,
        gridRowEnd: 3,
      },
      {
        type: 'info',
        gridColumn: 4,
        gridRow: 1,
        gridColumnEnd: 6,
        gridRowEnd: 3,
      },
    ];
  }
  
  if (columns === 5) {
    // 5 columns bp: img on left (2x2 squares), blank column, details on right (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 1,
        gridColumnEnd: 4,
        gridRowEnd: 3,
      },
      {
        type: 'info',
        gridColumn: 5,
        gridRow: 1,
        gridColumnEnd: 7,
        gridRowEnd: 3,
      },
    ];
  }
  
  return [];
};

const Product: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  console.log('Book ID from URL:', id);
  const [columns, setColumns] = React.useState(getColumns(window.innerWidth));
  const [loading, setLoading] = React.useState(true);
  const [book, setBook] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [offerPrice, setOfferPrice] = React.useState('');
  const [submittingOffer, setSubmittingOffer] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch orders for this book
  const fetchOrders = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/content/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type_id: 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2',
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      if (!data.success) throw new Error('API returned error');
      
      // Filter orders for this specific book
      const bookOrders = (data.contents || []).filter((order: any) => order.data.book === id);
      setOrders(bookOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  };

  // Calculate highest offer
  const getHighestOffer = (): number => {
    if (orders.length === 0) return 0;
    return Math.max(...orders.map(order => order.data.price));
  };

  // Handle offer submission
  const handleSubmitOffer = async () => {
    if (!id || !offerPrice) return;
    
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid positive price',
        severity: 'error'
      });
      return;
    }

    setSubmittingOffer(true);
    try {
      const response = await fetch(`${API_BASE_URL}/content/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content_type_id: 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2',
          data: {
            book: id,
            price: price,
            status: 'received',
            counter: null
          }
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit offer');
      const data = await response.json();
      if (!data.success) throw new Error('API returned error');
      
      setSnackbar({
        open: true,
        message: 'Offer submitted successfully!',
        severity: 'success'
      });
      
      // Refresh orders and clear input
      await fetchOrders();
      setOfferPrice('');
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to submit offer',
        severity: 'error'
      });
    } finally {
      setSubmittingOffer(false);
    }
  };

  React.useEffect(() => {
    const handleResize = () => setColumns(getColumns(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch book data
        const bookResponse = await fetch(`${API_BASE_URL}/content/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const bookData = await bookResponse.json();
        
        if (bookData.success && bookData.content && bookData.content.data) {
          setBook(bookData.content.data);
          console.log('Book data set:', bookData.content.data);
        } else {
          setBook(null);
          console.log('Book data set: null');
        }
        
        // Fetch orders for this book
        await fetchOrders();
      } catch (err: any) {
        setBook(null);
        console.log('API error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const mainCol = `calc(100vw / ${columns + 1})`;
  const sCol = `calc(0.5 * 100vw / ${columns + 1})`;
  // Use the same size for both width and height to ensure perfect squares
  const squareSize = mainCol;
  const colCount = columns + 2;
  const rowCount = columns === 1 ? 4 : columns === 2 ? 6 : 4;

  const getCellBorder = (col: number, row: number): React.CSSProperties => ({
    borderRight: col < colCount - 1 ? `1px dashed ${ARTIFACT_RED}` : 'none',
    borderBottom: row < rowCount - 1 ? `1px dashed ${ARTIFACT_RED}` : 'none',
    borderLeft: 'none',
    borderTop: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
                fontWeight: FONT_WEIGHTS.BOLD,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    zIndex: 1, // Increased z-index so grid lines appear above content
  });

  let gridTemplateColumns, gridTemplateRows;
  if (columns === 1) {
    gridTemplateColumns = '12.5vw 75vw 12.5vw';
    // Only two main rows, no top or bottom space
    gridTemplateRows = '0.75fr 0.75fr';
  } else if (columns === 2) {
    gridTemplateColumns = `calc(0.5 * ${squareSize}) repeat(${columns}, ${squareSize}) calc(0.5 * ${squareSize})`;
    // Only four main rows, no top or bottom space
    gridTemplateRows = `${squareSize} ${squareSize} ${squareSize} ${squareSize}`;
  } else {
    gridTemplateColumns = `calc(0.5 * ${squareSize}) repeat(${columns}, ${squareSize}) calc(0.5 * ${squareSize})`;
    // Only two main rows, no top or bottom space
    gridTemplateRows = `${squareSize} ${squareSize}`;
  }

  // Find the book name (from book state or fallback)
  const bookName = book?.name || 'Book';

  return (
    <>
      <Subheader 
        cardsPerRow={columns} 
        left={<Breadcrumbs bookName={bookName} />} 
      />
    <Box
      sx={{
        display: 'grid',
        width: '100vw',
        minHeight: '100vh',
          gridTemplateColumns,
          gridTemplateRows,
      }}
    >
          {/* Removed top border row */}

        {/* Side and middle rows for 1-column layout */}
        {columns === 1 && Array.from({ length: 2 }).map((_, rowIdx) => (
          <React.Fragment key={rowIdx}>
              <Box style={{ ...getCellBorder(0, rowIdx), gridColumn: 1, gridRow: rowIdx + 1 }} />
              <Box style={{ ...getCellBorder(1, rowIdx), gridColumn: 2, gridRow: rowIdx + 1 }} />
              <Box style={{ ...getCellBorder(colCount - 1, rowIdx), gridColumn: colCount, gridRow: rowIdx + 1 }} />
          </React.Fragment>
        ))}
        
        {/* Side and middle rows for 2-column layout */}
        {columns === 2 && Array.from({ length: 4 }).map((_, rowIdx) => (
          <React.Fragment key={rowIdx}>
              <Box style={{ ...getCellBorder(0, rowIdx), gridColumn: 1, gridRow: rowIdx + 1 }} />
              <Box style={{ ...getCellBorder(1, rowIdx), gridColumn: 2, gridRow: rowIdx + 1 }} />
              <Box style={{ ...getCellBorder(2, rowIdx), gridColumn: 3, gridRow: rowIdx + 1 }} />
              <Box style={{ ...getCellBorder(colCount - 1, rowIdx), gridColumn: colCount, gridRow: rowIdx + 1 }} />
          </React.Fragment>
        ))}
        
        {/* Side and middle rows for 4/5-column layout */}
          {(columns === 4 || columns === 5) && [0, 1].map((rowIdx) => (
          <React.Fragment key={rowIdx}>
            <Box style={{ ...getCellBorder(0, rowIdx), gridColumn: 1, gridRow: rowIdx + 1 }} />
            {Array.from({ length: columns }).map((_, i) => (
              <Box
                key={`mid-${rowIdx}-${i}`}
                style={{
                  ...getCellBorder(i + 1, rowIdx),
                  gridColumn: i + 2,
                  gridRow: rowIdx + 1,
                  padding: 8,
                }}
              >
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: 'transparent' }} />
              </Box>
            ))}
            <Box style={{ ...getCellBorder(colCount - 1, rowIdx), gridColumn: colCount, gridRow: rowIdx + 1 }} />
          </React.Fragment>
        ))}

          {/* Removed bottom border row */}


        {/* Main content cards (info and image) rendered via config */}
        {getCardLayout(columns).map((card, idx) => (
          <MainCard
            key={card.type + idx}
            gridColumn={card.gridColumn}
            gridRow={card.gridRow}
            gridColumnEnd={card.gridColumnEnd}
            gridRowEnd={card.gridRowEnd}
            color="#111"
          >
            {card.type === 'info'
              ? renderInfoCard(loading, book, orders, () => {
                  if (isAuthenticated) {
                      handleSubmitOffer();
                  } else {
                    setAuthModalOpen(true);
                  }
                  }, getHighestOffer, isAuthenticated, offerPrice, setOfferPrice)
              : renderImageCard(loading, book)}
          </MainCard>
        ))}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Authentication Modal */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
          }}
        />
      </Box>
    </>
  );
};

export default Product; 