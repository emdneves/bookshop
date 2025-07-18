import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useApiData } from '../hooks/useApiData';
import { usePageLayout } from '../hooks/usePageLayout';
import { useSubheaderData } from '../hooks/useSubheaderData';
import { CONTENT_TYPE_IDS } from '../constants/contentTypes';
import { Column } from '../components/DataTable';
import DataTable from '../components/DataTable';
import AuthGuard from '../components/AuthGuard';
import { formatSimpleDate } from '../utils/dateFormatter';
import EditableField from '../components/EditableField';
import { getCardsPerRow } from '../utils/helpers';
import { getBorderStyle } from '../constants/colors';

interface BuyProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

const Buy: React.FC<BuyProps> = ({ setSubheaderData, setTargetElement }) => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();

  // Fetch orders (requires auth)
  const { data: orders, loading } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.ORDERS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all books (no auth required)
  const { data: books } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list',
    requireAuth: false
  });

  // Handle subheader data
  useSubheaderData({
    data: orders,
    targetElement: 'buy-orders',
    setSubheaderData,
    setTargetElement
  });

  // Column definitions for Buy page
  const renderPrice = (value: any, row: any) => {
    const price = value || row.data?.price;
    return price ? `€${price}` : '-';
  };

  const renderDate = (value: any, row: any) => {
    const date = value || row.created_at;
    return formatSimpleDate(date);
  };

  const renderBookName = (books: any[]) => (value: any, row: any) => {
    const book = books.find(b => b.id === row.data.book);
    return book?.data?.name || row.data.book || 'Book';
  };

  const renderSeller = (books: any[]) => (value: any, row: any) => {
    const book = books.find(b => b.id === row.data.book);
    return book?.created_by || 'Unknown';
  };

  const columns: Column<any>[] = [
    {
      key: 'book',
      label: 'Book',
      render: renderBookName(books)
    },
    {
      key: 'seller',
      label: 'Seller',
      render: renderSeller(books)
    },
    {
      key: 'price',
      label: 'My Offer',
      render: (value: any, row: any) => (
        <EditableField
          value={row.data?.price || ''}
          placeholder="Offer"
          onSave={(newValue) => {
            // TODO: Implement API call to update offer price
            console.log(`Updating offer ${row.id} price to ${newValue}`);
          }}
        />
      )
    },
    {
      key: 'counter',
      label: 'Counter Offer',
      render: (value: any, row: any) => row.data.counter ? `€${row.data.counter}` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => row.data?.status || 'Pending'
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
      description="You must be logged in to view your purchase orders. Redirecting to login..."
    >
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: gridTemplateColumns,
          background: 'none',
        }}
      >
        {/* Side column left */}
        <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
        {/* Center columns: table */}
        <DataTable
          cardsPerRow={cardsPerRow}
          totalColumns={totalColumns}
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="No purchase orders found."
          rowKey="id"
        />
        {/* Side column right */}
        <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
      </Box>
    </AuthGuard>
  );
};

export default Buy; 