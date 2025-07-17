import React from 'react';
import { Box, Skeleton, Button, Modal, TextField, Alert, Snackbar, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';


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
const renderInfoCard = (loading: boolean, book: any, orders: any[], onMakeOffer: () => void, getHighestOffer: () => number, isAuthenticated: boolean) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3, mb: 2 }} />
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
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.95rem', lineHeight: 1.10 }}>
          <strong>Title:</strong> {book.name || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Author:</strong> {book.author || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>ISBN:</strong> {book.isbn || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Publisher:</strong> {book.publisher || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Publication date:</strong> {book['publication date'] || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Edition:</strong> {book.ed || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Original price:</strong> {book['Original price'] || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Pages:</strong> {book.Pages || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Language:</strong> {book.Language || '-'}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
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
            fontSize: '0.85rem',
          }}
        >
          {book.Description || '-'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem', lineHeight: 1.10 }}>
          <strong>Offers:</strong>
        </Typography>
        {getHighestOffer() > 0 ? (
          <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 1, fontSize: '0.85rem', lineHeight: 1.10 }}>
            Highest Offer: ${getHighestOffer()}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mb: 1, fontSize: '0.85rem', lineHeight: 1.10 }}>
            No offers yet
          </Typography>
        )}
      </Box>
      
      {/* Fixed button area at bottom */}
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Button
          variant="contained"
          onClick={onMakeOffer}
          fullWidth
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' }
          }}
        >
          {isAuthenticated ? 'Make Offer' : 'Login to Make Offer'}
        </Button>
      </Box>
    </Box>
  );

const renderImageCard = (loading: boolean, book: any) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height="100%"  />
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
      <Skeleton variant="rectangular" width="100%" height="100%"  />
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
        gridRow: 2,
        gridColumnEnd: 3,
        gridRowEnd: 3,
      },
      {
        type: 'info',
        gridColumn: 2,
        gridRow: 3,
        gridColumnEnd: 3,
        gridRowEnd: 4,
      },
    ];
  }
  
  if (columns === 2) {
    // 2 columns bp: img on top (2x2 squares), blank row, details below (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 2,
        gridColumnEnd: 4,
        gridRowEnd: 4,
      },
      {
        type: 'info',
        gridColumn: 2,
        gridRow: 5,
        gridColumnEnd: 4,
        gridRowEnd: 7,
      },
    ];
  }
  
  if (columns === 4) {
    // 4 columns bp: img on left (2x2 squares), details on right (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 2,
        gridColumnEnd: 4,
        gridRowEnd: 4,
      },
      {
        type: 'info',
        gridColumn: 4,
        gridRow: 2,
        gridColumnEnd: 6,
        gridRowEnd: 4,
      },
    ];
  }
  
  if (columns === 5) {
    // 5 columns bp: img on left (2x2 squares), blank column, details on right (2x2 squares)
    return [
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 2,
        gridColumnEnd: 4,
        gridRowEnd: 4,
      },
      {
        type: 'info',
        gridColumn: 5,
        gridRow: 2,
        gridColumnEnd: 7,
        gridRowEnd: 4,
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
  const [offerModalOpen, setOfferModalOpen] = React.useState(false);
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
      
      // Refresh orders and close modal
      await fetchOrders();
      setOfferModalOpen(false);
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
  const rowCount = columns === 1 ? 4 : columns === 2 ? 7 : 4;

  const getCellBorder = (col: number, row: number): React.CSSProperties => ({
    borderRight: col < colCount - 1 ? '1px dashed #d32f2f' : 'none',
    borderBottom: row < rowCount - 1 ? '1px dashed #d32f2f' : 'none',
    borderLeft: 'none',
    borderTop: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    zIndex: 1, // Increased z-index so grid lines appear above content
  });

  // Dynamic grid row count for different breakpoints - border rows are 1/4 height, content rows are full squares
  const gridTemplateRows = columns === 1 
    ? `calc(0.25 * ${squareSize}) ${squareSize} ${squareSize} calc(0.25 * ${squareSize})`
    : columns === 2 
    ? `calc(0.25 * ${squareSize}) ${squareSize} ${squareSize} ${squareSize} ${squareSize} ${squareSize} calc(0.25 * ${squareSize})`
    : `calc(0.25 * ${squareSize}) ${squareSize} ${squareSize} calc(0.25 * ${squareSize})`;

  // Also log book in render
  console.log('Book in render:', book);

  return (
    <Box
      sx={{
        display: 'grid',
        width: '100vw',
        minHeight: '100vh',
        gridTemplateColumns: `calc(0.5 * ${squareSize}) repeat(${columns}, ${squareSize}) calc(0.5 * ${squareSize})`,
        gridTemplateRows: gridTemplateRows,
      }}
    >
        {/* Top border row */}
        <Box style={{ ...getCellBorder(0, 0), gridColumn: 1, gridRow: 1 }} />
        {Array.from({ length: columns }).map((_, i) => (
          <Box key={`top-${i}`} style={{ ...getCellBorder(i + 1, 0), gridColumn: i + 2, gridRow: 1 }} />
        ))}
        <Box style={{ ...getCellBorder(colCount - 1, 0), gridColumn: colCount, gridRow: 1 }} />

        {/* Side and middle rows for 1-column layout */}
        {columns === 1 && Array.from({ length: 2 }).map((_, rowIdx) => (
          <React.Fragment key={rowIdx}>
            <Box style={{ ...getCellBorder(0, rowIdx + 1), gridColumn: 1, gridRow: rowIdx + 2 }} />
            <Box style={{ ...getCellBorder(colCount - 1, rowIdx + 1), gridColumn: colCount, gridRow: rowIdx + 2 }} />
          </React.Fragment>
        ))}
        
        {/* Side and middle rows for 2-column layout */}
        {columns === 2 && Array.from({ length: 5 }).map((_, rowIdx) => (
          <React.Fragment key={rowIdx}>
            <Box style={{ ...getCellBorder(0, rowIdx + 1), gridColumn: 1, gridRow: rowIdx + 2 }} />
            <Box style={{ ...getCellBorder(colCount - 1, rowIdx + 1), gridColumn: colCount, gridRow: rowIdx + 2 }} />
          </React.Fragment>
        ))}
        
        {/* Side and middle rows for 4/5-column layout */}
        {(columns === 4 || columns === 5) && [1, 2].map((rowIdx) => (
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
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: '#FFFAF0' }} />
              </Box>
            ))}
            <Box style={{ ...getCellBorder(colCount - 1, rowIdx), gridColumn: colCount, gridRow: rowIdx + 1 }} />
          </React.Fragment>
        ))}

        {/* Bottom border row */}
        <Box style={{ ...getCellBorder(0, rowCount - 1), gridColumn: 1, gridRow: rowCount }} />
        {Array.from({ length: columns }).map((_, i) => (
          <Box key={`bot-${i}`} style={{ ...getCellBorder(i + 1, rowCount - 1), gridColumn: i + 2, gridRow: rowCount }} />
        ))}
        <Box style={{ ...getCellBorder(colCount - 1, rowCount - 1), gridColumn: colCount, gridRow: rowCount }} />


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
                    setOfferModalOpen(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                }, getHighestOffer, isAuthenticated)
              : renderImageCard(loading, book)}
          </MainCard>
        ))}

        {/* Offer Modal */}
        <Modal
          open={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          aria-labelledby="offer-modal-title"
          aria-describedby="offer-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="offer-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Make an Offer
            </Typography>
            {book && (
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Book: <strong>{book.name}</strong><br />
                Author: {book.author}<br />
                {book['Original price'] && `Original Price: $${book['Original price']}`}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Your Offer Price ($)"
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              sx={{ mb: 3 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setOfferModalOpen(false)}
                disabled={submittingOffer}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitOffer}
                disabled={submittingOffer || !offerPrice}
                sx={{
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#b71c1c' }
                }}
              >
                {submittingOffer ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </Box>
          </Box>
        </Modal>

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
            setOfferModalOpen(true);
          }}
        />
      </Box>
  );
};

export default Product; 