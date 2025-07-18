import React from 'react';
import { Box } from '@mui/material';
import { useApiData } from '../hooks/useApiData';
import { usePageLayout } from '../hooks/usePageLayout';
import { useSubheaderData } from '../hooks/useSubheaderData';
import { CONTENT_TYPE_IDS } from '../constants/contentTypes';
import { Column } from '../components/DataTable';
import DataTable from '../components/DataTable';
import AuthGuard from '../components/AuthGuard';
import SEO from '../utils/seo';
import { formatSimpleDate } from '../utils/dateFormatter';

interface BooksProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

const Books: React.FC<BooksProps> = ({ setSubheaderData, setTargetElement }) => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();

  // Fetch books created by the current user
  const { data: books, loading } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all orders (offers) to count offers per book
  const { data: orders } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.ORDERS,
    endpoint: 'list',
    requireAuth: false
  });

  // Handle subheader data
  useSubheaderData({
    data: books,
    targetElement: 'books-table',
    setSubheaderData,
    setTargetElement
  });

  // Column definitions for Books page
  const renderDate = (value: any, row: any) => {
    const date = value || row.created_at;
    return formatSimpleDate(date);
  };

  const renderOffers = (orders: any[]) => (value: any, row: any) => {
    const bookOffers = orders.filter(order => order.data.book === row.id);
    const offerCount = bookOffers.length;
    const highestOffer = bookOffers.length > 0 
      ? Math.max(...bookOffers.map((offer: any) => offer.data.price))
      : 0;

    if (offerCount === 0) {
      return 'No offers';
    }

    return `${offerCount} offer${offerCount !== 1 ? 's' : ''} (Highest: €${highestOffer})`;
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Title',
      render: (value: any, row: any) => row.data?.name || 'Untitled'
    },
    {
      key: 'author',
      label: 'Author',
      render: (value: any, row: any) => row.data?.author || 'Unknown'
    },
    {
      key: 'publisher',
      label: 'Publisher',
      render: (value: any, row: any) => row.data?.publisher || 'Unknown'
    },
    {
      key: 'isbn',
      label: 'ISBN',
      render: (value: any, row: any) => row.data?.isbn || 'N/A'
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: any, row: any) => `€${row.data?.price || 0}`
    },
    {
      key: 'offers',
      label: 'Offers',
      render: renderOffers(orders)
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: renderDate
    }
  ];

  return (
    <AuthGuard
      title="Login Required"
      description="You must be logged in to view your books for sale. Redirecting to login..."
    >
      <SEO 
        title="My Books - the artifact"
        description="Manage your books for sale. View, edit, and track offers on your listed books."
        url="https://theartifact.shop/books"
      />
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: gridTemplateColumns,
          background: 'none',
        }}
      >
        {/* Side column left */}
        <Box sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />
        {/* Center columns: table */}
        <DataTable
          cardsPerRow={cardsPerRow}
          totalColumns={totalColumns}
          data={books}
          columns={columns}
          loading={loading}
          emptyMessage="No books found."
          rowKey="id"
        />
        {/* Side column right */}
        <Box sx={{ borderLeft: '0.5px dashed #d32f2f', height: '100%' }} />
      </Box>
    </AuthGuard>
  );
};

export default Books; 