import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Alert, TextField, Select, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { getCardsPerRow } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const BOOKS_CONTENT_TYPE_ID = '481a065c-8733-4e97-9adf-dc64acacf5fb';
const ORDERS_CONTENT_TYPE_ID = 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2';

interface SellProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const Sell: React.FC<SellProps> = ({ search, onSearchChange }) => {
  const { token, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const totalColumns = cardsPerRow + 2;
  const [updatingCounter, setUpdatingCounter] = useState<string | null>(null);
  const [counterValues, setCounterValues] = useState<Record<string, string>>({});
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

  // Fetch all orders (offers)
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

  // IDs of books created by this user
  const myBookIds = books.map(book => book.id);

  // Offers received for my books
  const offersForMyBooks = orders.filter(order => myBookIds.includes(order.data.book));

  // Filter offers by book name, author, or ISBN (case-insensitive)
  const filteredOffers = offersForMyBooks.filter(order => {
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

  // Save counter offer to backend and update local state
  const handleCounterBlur = async (orderId: string) => {
    const value = counterValues[orderId];
    if (value === undefined) return;
    
    setUpdatingCounter(orderId);
    try {
      // Find the current order to get all existing data
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        console.error('Order not found:', orderId);
        return;
      }

              const response = await fetch(`${API_BASE_URL}/content/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: orderId,
          data: { 
            ...currentOrder.data, // Include all existing data
            counter: value === '' ? null : Number(value) // Update only the counter field
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the local orders state with the new counter value
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId 
                ? { ...order, data: { ...order.data, counter: value === '' ? null : Number(value) } }
                : order
            )
          );
        } else {
          console.error('Failed to update counter offer:', result.error);
          // Revert the counter value if the update failed
          setCounterValues(prev => ({ ...prev, [orderId]: orders.find(o => o.id === orderId)?.data.counter?.toString() || '' }));
        }
      } else {
        console.error('Failed to update counter offer:', response.statusText);
        // Revert the counter value if the update failed
        setCounterValues(prev => ({ ...prev, [orderId]: orders.find(o => o.id === orderId)?.data.counter?.toString() || '' }));
      }
    } catch (error) {
      console.error('Error updating counter offer:', error);
      // Revert the counter value if the update failed
      setCounterValues(prev => ({ ...prev, [orderId]: orders.find(o => o.id === orderId)?.data.counter?.toString() || '' }));
    } finally {
      setUpdatingCounter(null);
    }
  };

  if (!isAuthenticated) {
    return <Alert severity="warning">You must be logged in to view offers for your books.</Alert>;
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
      {/* Center columns: offers table */}
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
        {/* Offers received for my books */}
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
              <TableCell sx={{ maxWidth: 120 }}>Buyer</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Proposal</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>Counter Offer</TableCell>
              <TableCell sx={{ maxWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ maxWidth: 140 }}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordersLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Skeleton variant="rectangular" width="100%" height={44} />
                </TableCell>
              </TableRow>
            ) : filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No offers found for your books.
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((order) => {
                const book = books.find(b => b.id === order.data.book);
                // The buyer is the one who created the order
                const buyerEmail = order.created_by || 'Unknown';
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
                      {buyerEmail}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>{order.data.price ? `$${order.data.price}` : '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 120 }}>
                      <TextField
                        type="number"
                        value={counterValues[order.id] ?? (order.data.counter ?? '')}
                        onChange={e => setCounterValues(prev => ({ ...prev, [order.id]: e.target.value }))}
                        onBlur={() => handleCounterBlur(order.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCounterBlur(order.id);
                          }
                        }}
                        size="small"
                        variant="outlined"
                        disabled={updatingCounter === order.id}
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
                      <Select
                        value={order.data.status || ''}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          // Update backend
                          try {
                            const response = await fetch(`${API_BASE_URL}/content/update`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                id: order.id,
                                data: { ...order.data, status: newStatus },
                              }),
                            });
                            if (response.ok) {
                              setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? { ...o, data: { ...o.data, status: newStatus } } : o));
                            }
                          } catch (err) {
                            // Optionally show error
                          }
                        }}
                        size="small"
                        sx={{
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
                        }}
                      >
                        <MenuItem value="received" sx={{'&.Mui-selected, &:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08) !important' }}}>Received</MenuItem>
                        <MenuItem value="accepted" sx={{'&.Mui-selected, &:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08) !important' }}}>Accepted</MenuItem>
                        <MenuItem value="rejected" sx={{'&.Mui-selected, &:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08) !important' }}}>Rejected</MenuItem>
                        <MenuItem value="pending" sx={{'&.Mui-selected, &:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08) !important' }}}>Pending</MenuItem>
                      </Select>
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

export default Sell; 