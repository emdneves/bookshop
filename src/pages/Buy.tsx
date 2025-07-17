import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Chip, Alert, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import CenteredMessage from '../components/CenteredMessage';
import ScrollableTable from '../components/ScrollableTable';

const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';
const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';

interface BuyProps {
  search: string;
  onSearchChange: (value: string) => void;
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}
const Buy: React.FC<BuyProps> = ({ search, onSearchChange, setSubheaderData, setTargetElement }) => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const totalColumns = cardsPerRow + 2;
  const navigate = useNavigate();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthMessage(true);
      const timer = setTimeout(() => {
        navigate('/', { state: { openLogin: true } });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

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
        const ordersData = data.contents || [];
        setOrders(ordersData);
        
        // Pass data to subheader for dynamic filter generation
        if (setSubheaderData && setTargetElement) {
          setTargetElement('buy-orders');
          setSubheaderData(ordersData);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, setSubheaderData, setTargetElement]);

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

  if (!isAuthenticated && showAuthMessage) {
    return (
      <CenteredMessage
        title="Login Required"
        description="You must be logged in to view your purchase orders. Redirecting to login..."
        showSpinner
      />
    );
  }

  if (!isAuthenticated) {
    return null;
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
      <ScrollableTable cardsPerRow={cardsPerRow} totalColumns={totalColumns}>
        <TableHead>
          <TableRow>
            <TableCell>Book</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>My Offer</TableCell>
            <TableCell>Counter Offer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
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
                  <TableCell>
                    <Link 
                      to={`/book/${order.data.book}`} 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'block',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {book?.data?.name || order.data.book || 'Book'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {sellerEmail}
                  </TableCell>
                  <TableCell>{order.data.price ? `$${order.data.price}` : '-'}</TableCell>
                  <TableCell>{order.data.counter ? `$${order.data.counter}` : '-'}</TableCell>
                  <TableCell>
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
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </ScrollableTable>
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
    </Box>
  );
};

export default Buy; 