import React from 'react';
import { Box, Typography } from '@mui/material';
import { useApiData } from '../hooks/useApiData';
import { usePageLayout } from '../hooks/usePageLayout';
import { CONTENT_TYPE_IDS } from '../constants/contentTypes';
import DataTable, { Column } from '../components/DataTable';
import AuthGuard from '../components/AuthGuard';
import SEO from '../utils/seo';
import { formatSimpleDate } from '../utils/dateFormatter';
import { getBorderStyle } from '../constants/colors';

const BooksAndOffers: React.FC = () => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();

  // Fetch books created by the current user
  const { data: books, loading: loadingBooks } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all orders (offers)
  const { data: allOrders, loading: loadingOrders } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.ORDERS,
    endpoint: 'list',
    requireAuth: false
  });

  // Filter orders for books created by the current user
  const userBookIds = books.map((book: any) => book.id);
  const userOrders = allOrders.filter((order: any) => userBookIds.includes(order.data.book));

  // --- Book Table Columns ---
  const renderBookDate = (value: any, row: any) => {
    const date = value || row.created_at;
    return formatSimpleDate(date);
  };
  const renderBookOffers = (orders: any[]) => (value: any, row: any) => {
    const bookOffers = orders.filter((order: any) => order.data.book === row.id);
    const offerCount = bookOffers.length;
    const highestOffer = bookOffers.length > 0 
      ? Math.max(...bookOffers.map((offer: any) => offer.data.price))
      : 0;
    if (offerCount === 0) {
      return 'No offers';
    }
    return `${offerCount} offer${offerCount !== 1 ? 's' : ''} (Highest: €${highestOffer})`;
  };
  const bookColumns: Column<any>[] = [
    { key: 'name', label: 'Title', render: (value: any, row: any) => row.data?.name || 'Untitled' },
    { key: 'author', label: 'Author', render: (value: any, row: any) => row.data?.author || 'Unknown' },
    { key: 'publisher', label: 'Publisher', render: (value: any, row: any) => row.data?.publisher || 'Unknown' },
    { key: 'isbn', label: 'ISBN', render: (value: any, row: any) => row.data?.isbn || 'N/A' },
    { key: 'price', label: 'Price', render: (value: any, row: any) => `€${row.data?.price || 0}` },
    { key: 'offers', label: 'Offers', render: renderBookOffers(allOrders) },
    { key: 'created_at', label: 'Created At', render: renderBookDate },
  ];

  // --- Offers Table Columns ---
  const renderOfferDate = (value: any, row: any) => {
    const date = value || row.created_at;
    return formatSimpleDate(date);
  };
  const renderOfferBookName = (books: any[]) => (value: any, row: any) => {
    const book = books.find((b: any) => b.id === row.data.book);
    return book?.data?.name || row.data.book || 'Book';
  };
  const renderOfferBuyer = (value: any, row: any) => row.created_by || 'Unknown';
  const renderOfferPrice = (value: any, row: any) => value ? `€${value}` : (row.data?.price ? `€${row.data.price}` : '-');
  const offerColumns: Column<any>[] = [
    { key: 'book', label: 'Book', render: renderOfferBookName(books) },
    { key: 'buyer', label: 'Buyer', render: renderOfferBuyer },
    { key: 'price', label: 'Proposal', render: renderOfferPrice },
    { key: 'status', label: 'Status', render: (value: any, row: any) => row.data?.status || 'pending' },
    { key: 'created_at', label: 'Created At', render: renderOfferDate },
  ];

  return (
    <AuthGuard
      title="Login Required"
      description="You must be logged in to view your books and offers. Redirecting to login..."
    >
      <SEO 
        title="My Books & Offers - the artifact"
        description="View all your books for sale and all offers received for them."
        url="https://theartifact.shop/books-and-offers"
      />
      <Box sx={{ width: '100%', mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>My Books</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplateColumns, background: 'none' }}>
          <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
          <DataTable
            cardsPerRow={cardsPerRow}
            totalColumns={totalColumns}
            data={books}
            columns={bookColumns}
            loading={loadingBooks}
            emptyMessage="No books found."
            rowKey="id"
          />
          <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Offers Received</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplateColumns, background: 'none' }}>
          <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
          <DataTable
            cardsPerRow={cardsPerRow}
            totalColumns={totalColumns}
            data={userOrders}
            columns={offerColumns}
            loading={loadingBooks || loadingOrders}
            emptyMessage="No offers found for your books."
            rowKey="id"
          />
          <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
        </Box>
      </Box>
    </AuthGuard>
  );
};

export default BooksAndOffers; 