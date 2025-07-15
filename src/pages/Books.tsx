import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import SEO from '../components/SEO';

const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';
const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';

interface BooksProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const Books: React.FC<BooksProps> = ({ search, onSearchChange }) => {
  const { token, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const totalColumns = cardsPerRow + 2;
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/content/list-by-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content_type_id: BOOKS_CONTENT_TYPE_ID }),
        });
        const data = await response.json();
        setBooks(data.contents || []);
      } catch (err) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [token]);

  // Fetch all orders (offers) to count offers per book
  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/content/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_type_id: ORDERS_CONTENT_TYPE_ID }),
        });
        const data = await response.json();
        setOrders(data.contents || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Filter books by title, author, or ISBN (case-insensitive)
  const filteredBooks = books.filter(book => {
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
    return (
      <>
        <SEO 
          title="My Books - Bookshop"
          description="Manage your books for sale. View, edit, and track offers on your listed books."
          url="https://209.74.83.122/books"
        />
        <Alert severity="warning">You must be logged in to view your books for sale.</Alert>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="My Books - Bookshop"
        description="Manage your books for sale. View, edit, and track offers on your listed books."
        url="https://209.74.83.122/books"
      />
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
      {/* Center columns: books table */}
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
              <TableCell sx={{ maxWidth: 180 }}>Title</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Author</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Publisher</TableCell>
              <TableCell sx={{ maxWidth: 100 }}>ISBN</TableCell>
              <TableCell sx={{ maxWidth: 80 }}>Price</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Offers</TableCell>
              <TableCell sx={{ maxWidth: 140 }}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Skeleton variant="rectangular" width="100%" height={44} />
                </TableCell>
              </TableRow>
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No books found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => {
                const offersCount = orders.filter(order => order.data.book === book.id).length;
                return (
                  <TableRow key={book.id}>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Link 
                        to={`/book/${book.id}`} 
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
                        {book.data?.name || 'Book'}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{book.data?.author || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{book.data?.publisher || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 100 }}>{book.data?.isbn || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 80 }}>{book.data?.['Original price'] ? `$${book.data['Original price']}` : '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{offersCount}</TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>{new Date(book.created_at).toLocaleString()}</TableCell>
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
    </>
  );
};

export default Books; 