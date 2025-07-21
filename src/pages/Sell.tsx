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
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import Dropdown from '../components/Dropdown';
import Pill from '../components/Pill';

interface SellProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

const Sell: React.FC<SellProps> = ({ setSubheaderData, setTargetElement }) => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();
  const { token } = useAuth();
  const [refreshOrders, setRefreshOrders] = useState(false);

  // Fetch all books created by the current user
  const { data: books } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all orders (offers) for books created by the current user
  const { data: allOrders, loading } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.ORDERS,
    endpoint: 'list',
    requireAuth: false,
    dependencies: [refreshOrders]
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Find the existing order to preserve its data - use same pattern as counter offer
      const existingOrder = userOrders.find((order: any) => order.id === orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Ensure all required fields are present
      const updatedData = {
        ...existingOrder.data, // Preserve all existing data
        status: newStatus // Only update the status
      };


      const requestBody = {
        id: orderId,
        data: updatedData
      };


      const response = await fetch(`${API_BASE_URL}/content/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

 

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error');
      }
      
      // Force refresh by updating the dependency
      setRefreshOrders(prev => !prev);
    } catch (error) {
    }
  };

  const handleCounterOfferUpdate = async (orderId: string, newCounterOffer: string) => {
    try {
      // Find the existing order to preserve its data
      const existingOrder = userOrders.find((order: any) => order.id === orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      const updatedData = {
        ...existingOrder.data, // Preserve all existing data
        counter: parseFloat(newCounterOffer) // Only update the counter
      };

      const requestBody = {
        id: orderId,
        data: updatedData
      };

      const response = await fetch(`${API_BASE_URL}/content/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error');
      }
      
      // Force refresh by updating the dependency
      setRefreshOrders(prev => !prev);
    } catch (error) {
    }
  };

  const statusOptions = [
    { value: 'received', label: 'received' },
    { value: 'approved', label: 'approved' },
    { value: 'rejected', label: 'rejected' }
  ];

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
          onSave={(newValue) => handleCounterOfferUpdate(row.id, newValue)}
        />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => {
        const currentStatus = row.data?.status || 'pending';
        return (
          <Dropdown
            trigger={
              <Pill
                fullWidth
                sx={{ 
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex'
                }}
              >
                {currentStatus}
              </Pill>
            }
            options={statusOptions}
            onSelect={(newStatus) => {
              if (newStatus === currentStatus) {
                return;
              }
              handleStatusChange(row.id, newStatus);
            }}
            sx={{ width: '100%' }}
          />
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
    </AuthGuard>
  );
};

export default Sell; 