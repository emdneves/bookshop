import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Chip, Alert, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';
const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';

interface BuyProps {
  search: string;
  onSearchChange: (value: string) => void;
}
const Buy: React.FC<BuyProps> = ({ search, onSearchChange }) => {
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
        const response = await fetch(`${API_BASE_URL}/content/list-by-user`, {
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
        const response = await fetch(`${API_BASE_URL}/content/list`, {
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

  // Filter orders by book name, author, or ISBN (case-insensitive)
  const filteredOrders = orders.filter(order => {
    const book = books.find(b => b.id === order.data.book);
    if (!book) return false;
    
    const title = book.data?.name || '';
    const author = book.data?.author || '';
    const isbn = book.data?.isbn ? String(book.data.isbn) : '';
    const q = search.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      author.toLowerCase().includes(q) ||
      isbn.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) {
    return <Alert severity="warning">You must be logged in to view your purchase orders.</Alert>;
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
      {/* Center columns: orders table */}
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
              <TableCell sx={{ maxWidth: 120 }}>Seller</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>My Offer</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Counter Offer</TableCell>
              <TableCell sx={{ maxWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ maxWidth: 140 }}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Skeleton variant="rectangular" width="100%" height={44} />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const book = books.find(b => b.id === order.data.book);
                // The seller is the one who created the book
                const sellerEmail = book?.created_by || 'Unknown';
                return (
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
                        {book?.data?.name || order.data.book || 'Book'}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>
                      {sellerEmail}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{order.data.price ? `$${order.data.price}` : '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{order.data.counter ? `$${order.data.counter}` : '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 100 }}>
                      <Chip
                        label={order.data.status || 'Pending'}
                        size="small"
                        sx={{
                          fontSize: 12,
                          height: 24,
                          borderRadius: '12px',
                          backgroundColor: order.data.status === 'Accepted' ? '#4caf50' : 
                                           order.data.status === 'Rejected' ? '#f44336' : '#ff9800',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>{new Date(order.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
    </Box>
  );
};

export default Buy; 