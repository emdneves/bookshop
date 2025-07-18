import React, { useState } from 'react';
import { Box, Menu, MenuItem, Button } from '@mui/material';
import { useApiData } from '../hooks/useApiData';
import { usePageLayout } from '../hooks/usePageLayout';
import { useSubheaderData } from '../hooks/useSubheaderData';
import { CONTENT_TYPE_IDS } from '../constants/contentTypes';
import { Column } from '../components/DataTable';
import DataTable from '../components/DataTable';
import AuthGuard from '../components/AuthGuard';
import Pill from '../components/Pill';
import { formatSimpleDate } from '../utils/dateFormatter';
import EditableField from '../components/EditableField';
import { getCardsPerRow } from '../utils/helpers';
import { getBorderStyle } from '../constants/colors';

interface SellProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

const Sell: React.FC<SellProps> = ({ setSubheaderData, setTargetElement }) => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch books created by the current user
  const { data: books } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all orders (offers) for books created by the current user
  const { data: allOrders, loading } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.ORDERS,
    endpoint: 'list',
    requireAuth: false
  });

  // Filter orders for books created by the current user
  const userBookIds = books.map(book => book.id);
  const userOrders = allOrders.filter((order: any) => userBookIds.includes(order.data.book));

  // Handle subheader data
  useSubheaderData({
    data: userOrders,
    targetElement: 'sell-offers',
    setSubheaderData,
    setTargetElement
  });

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleStatusChange = (newStatus: string) => {
    // TODO: Implement API call to update order status
    console.log(`Updating order ${selectedOrderId} status to ${newStatus}`);
    handleStatusClose();
  };

  const statusOptions = ['Pending', 'Accepted', 'Rejected', 'Completed'];

  // Column definitions for Sell page
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

  const renderBuyer = (value: any, row: any) => {
    return row.created_by || 'Unknown';
  };

  const columns: Column<any>[] = [
    {
      key: 'book',
      label: 'Book',
      render: renderBookName(books)
    },
    {
      key: 'buyer',
      label: 'Buyer',
      render: renderBuyer
    },
    {
      key: 'price',
      label: 'Proposal',
      render: renderPrice
    },
    {
      key: 'counter',
      label: 'Counter Offer',
      render: (value: any, row: any) => (
        <EditableField
          value={row.data?.counter || ''}
          placeholder="Counter offer"
          onSave={(newValue) => {
            // TODO: Implement API call to update counter offer
            console.log(`Updating order ${row.id} counter offer to ${newValue}`);
          }}
        />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => {
        const currentStatus = row.data?.status || 'Pending';
        return (
          <Pill
            onClick={(e) => e && handleStatusClick(e, row.id)}
            fullWidth
            sx={{ cursor: 'pointer' }}
          >
            {currentStatus}
          </Pill>
        );
      }
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
      description="You must be logged in to view offers for your books. Redirecting to login..."
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
          data={userOrders}
          columns={columns}
          loading={loading}
          emptyMessage="No offers found for your books."
          rowKey="id"
        />
        {/* Side column right */}
        <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
      </Box>
      
      {/* Status dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 120,
          }
        }}
      >
        {statusOptions.map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
                      sx={{
              fontSize: '14px',
              py: 1,
            }}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>
    </AuthGuard>
  );
};

export default Sell; 