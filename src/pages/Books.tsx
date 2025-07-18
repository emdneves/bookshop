import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, TableBody, TableCell, TableHead, TableRow, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import SEO from '../components/SEO';
import CenteredMessage from '../components/CenteredMessage';
import ScrollableTable from '../components/ScrollableTable';
import { formatSimpleDate } from '../utils/dateFormatter';

const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';
const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';

interface BooksProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

const Books: React.FC<BooksProps> = ({ setSubheaderData, setTargetElement }) => {
  const { token, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const totalColumns = cardsPerRow + 2;
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const navigate = useNavigate();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

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
        const booksData = data.contents || [];
        setBooks(booksData);
        
        // Pass data to subheader for dynamic filter generation
        if (setSubheaderData && setTargetElement) {
          setTargetElement('books-table');
          setSubheaderData(booksData);
        }
      } catch (err) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [token, setSubheaderData, setTargetElement]);

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

  const filteredBooks = books;

  if (!isAuthenticated && showAuthMessage) {
    return (
      <CenteredMessage
        title="Login Required"
        description="You must be logged in to view your books for sale. Redirecting to login..."
        showSpinner
      />
    );
  }

  return (
    <>
      <SEO 
        title="My Books - the artifact"
        description="Manage your books for sale. View, edit, and track offers on your listed books."
        url="https://theartifact.shop/books"
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
      <ScrollableTable cardsPerRow={cardsPerRow} totalColumns={totalColumns}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Publisher</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Offers</TableCell>
            <TableCell>Created At</TableCell>
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
              // Count offers for this book
              const bookOffers = orders.filter(order => order.data.book === book.id);
              const offerCount = bookOffers.length;
              const highestOffer = bookOffers.length > 0 
                ? Math.max(...bookOffers.map((offer: any) => offer.data.price))
                : 0;

              return (
                <TableRow key={book.id}>
                  <TableCell>
                    <Link 
                      to={`/book/${book.id}`}
                      style={{ 
                        color: '#d32f2f', 
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      {book.data?.name || 'Untitled'}
                    </Link>
                  </TableCell>
                  <TableCell>{book.data?.author || 'Unknown'}</TableCell>
                  <TableCell>{book.data?.publisher || 'Unknown'}</TableCell>
                  <TableCell>{book.data?.isbn || 'N/A'}</TableCell>
                  <TableCell>${book.data?.price || 0}</TableCell>
                  <TableCell>
                    {offerCount > 0 ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                          {offerCount} offer{offerCount !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Highest: ${highestOffer}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                        No offers
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatSimpleDate(book.created_at)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </ScrollableTable>
      {/* Side column right */}
      <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
    </Box>
    </>
  );
};

export default Books; 