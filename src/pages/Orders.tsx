import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Chip, Alert, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';
const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';

const Orders: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const totalColumns = cardsPerRow + 2;

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/content/list-by-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content_type_id: ORDERS_CONTENT_TYPE_ID
          }),
        });
        const data = await response.json();
        setOrders(data.contents || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      setBooksLoading(true);
      try {
        const response = await fetch('http://localhost:3000/content/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_type_id: BOOKS_CONTENT_TYPE_ID }),
        });
        const data = await response.json();
        setBooks(data.contents || []);
      } catch (err) {
        setBooks([]);
      } finally {
        setBooksLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Build a map of bookId -> bookName and bookId -> originalPrice
  const bookNameMap: Record<string, string> = {};
  const bookPriceMap: Record<string, number> = {};
  books.forEach(book => {
    bookNameMap[book.id] = book.data?.name || '';
    bookPriceMap[book.id] = book.data?.['Original price'] || 0;
  });

  // Handle proposal price change
  const handleProposalChange = (orderId: string, newPrice: string) => {
    const numericPrice = parseFloat(newPrice);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, data: { ...order.data, price: numericPrice } }
            : order
        )
      );
    }
  };

  if (!isAuthenticated) {
    return <Alert severity="warning">You must be logged in to view your orders.</Alert>;
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
        background: 'none',
      }}
    >
      {/* Side column left */}
      <Box sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />
      {/* Center columns: table fills all center columns */}
      <Box
        sx={{
          gridColumn: cardsPerRow === 1 ? '2 / 3' : `2 / ${totalColumns}`,
          width: '100%',
          background: 'none',
          p: 0,
          m: 0,
          height: 'fit-content',
          minHeight: '40px',
          ...(cardsPerRow === 1 && {
            px: 0,
            borderRight: '0.5px dashed #d32f2f',
          }),
        }}
      >
        <Table sx={{ 
          width: '100%', 
          background: 'none',
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& .MuiTableRow-root': {
            height: 44,
            minHeight: 44,
            maxHeight: 44,
            transition: 'background 0.2s',
            '&:hover': {
              background: 'rgba(211,47,47,0.04)',
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid #e0e0e0',
            borderRight: 'none',
            fontSize: 15,
            padding: '0 16px',
            height: 44,
            minHeight: 44,
            maxHeight: 44,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            background: 'none',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 700,
            fontSize: 16,
            color: '#222',
            background: 'none',
            borderBottom: '2px solid #d32f2f',
            letterSpacing: 0.2,
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            fontSize: 15,
            color: '#333',
            background: 'none',
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ maxWidth: 180 }}>Book</TableCell>
              <TableCell sx={{ maxWidth: 80 }}>Original Price</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Proposal</TableCell>
              <TableCell sx={{ maxWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ maxWidth: 140 }}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading || booksLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Skeleton variant="rectangular" width="100%" height={44} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Link 
                      to={`/book/${order.data.book}`} 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {bookNameMap[order.data.book] || order.data.book || 'Book'}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 80 }}>
                    ${bookPriceMap[order.data.book] || 0}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 120 }}>
                    <TextField
                      type="number"
                      value={order.data.price}
                      onChange={(e) => handleProposalChange(order.id, e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{
                        width: '80px',
                        '& .MuiOutlinedInput-root': {
                          fontSize: 15,
                          height: 32,
                          borderRadius: '999px',
                          background: 'transparent',
                          boxShadow: 'none',
                          border: '1.5px solid #d32f2f',
                          px: 1.5,
                          '& fieldset': {
                            border: 'none',
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: 15,
                          padding: '4px 12px',
                          textAlign: 'center',
                          background: 'transparent',
                          // Hide browser spin buttons
                          '&::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          '&::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          MozAppearance: 'textfield',
                        },
                      }}
                      inputProps={{ style: { textAlign: 'center', background: 'transparent' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100 }}>
                    <Chip
                      label={order.data.status}
                      size="small"
                      sx={{
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: 14,
                        px: 2,
                        background: 'transparent',
                        border: `1.5px solid ${
                          order.data.status === 'approved' ? '#388e3c' : '#d32f2f'
                        }`,
                        color: order.data.status === 'approved' ? '#388e3c' : '#d32f2f',
                        height: 32,
                        minWidth: 70,
                        textTransform: 'capitalize',
                        boxShadow: 'none',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 140 }}>
                    {new Date(order.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
    </Box>
  );
};

export default Orders; 