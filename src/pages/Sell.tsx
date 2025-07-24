import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
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
import SellBookModal from '../components/SellBookModal';
import SellButton from '../components/subheader/SellButton';
import SearchBar from '../components/subheader/SearchBar';

interface SellProps {
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
  sellModalOpen?: boolean;
  setSellModalOpen?: (open: boolean) => void;
}

// Subheader slot components for Sell page
export const SellSubheaderLeft = ({ fullWidth }: { fullWidth?: boolean }) => (
  <SearchBar fullWidth={fullWidth} />
);

export const SellSubheaderRight = ({ onClick }: { onClick?: () => void }) => (
  <SellButton onClick={onClick} fullWidth={true} />
);

const Sell: React.FC<SellProps> = ({ setSubheaderData, setTargetElement, sellModalOpen: propSellModalOpen, setSellModalOpen: propSetSellModalOpen }) => {
  const { cardsPerRow, totalColumns, gridTemplateColumns } = usePageLayout();
  const { token } = useAuth();
  const [refreshOrders, setRefreshOrders] = useState(false);
  const [internalSellModalOpen, setInternalSellModalOpen] = useState(false);
  const sellModalOpen = propSellModalOpen !== undefined ? propSellModalOpen : internalSellModalOpen;
  const setSellModalOpen = propSetSellModalOpen || setInternalSellModalOpen;

  // Fetch all books created by the current user
  const { data: books, loading: loadingBooks } = useApiData({
    contentTypeId: CONTENT_TYPE_IDS.BOOKS,
    endpoint: 'list-by-user',
    requireAuth: true
  });

  // Fetch all orders (offers) for books created by the current user
  const { data: allOrders, loading: loadingOrders } = useApiData({
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

  // Set SellButton in the subheader right slot
  useEffect(() => {
    if (setSubheaderData) {
      setSubheaderData([
        {
          key: 'right',
          element: <SellButton onClick={() => setSellModalOpen(true)} />,
        },
      ]);
    }
  }, [setSubheaderData]);

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

  const renderBookOriginalPrice = (books: any[]) => (value: any, row: any) => {
    const book = books.find((b: any) => b.id === row.data.book);
    return book?.data && book.data['Original price'] ? `€${book.data['Original price']}` : '-';
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
      key: 'price_original',
      label: 'Original',
      render: renderBookOriginalPrice(books)
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
        const reorderedStatusOptions = [
          { value: currentStatus, label: currentStatus },
          ...statusOptions.filter(opt => opt.value !== currentStatus)
        ];
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
            options={reorderedStatusOptions}
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

  const loading = loadingBooks || loadingOrders;

  // Handler to create a new book
  const handleSellBook = async (fields: any) => {
    // Build the book data object, mapping and type-casting as needed
    const bookData = {
      name: fields.name,
      author: fields.author,
      publisher: fields.publisher,
      isbn: fields.isbn ? Number(fields.isbn) : undefined,
      'Original price': fields['Original price'] ? Number(fields['Original price']) : undefined,
      Cover: fields.Cover || '',
      Pages: fields.Pages ? Number(fields.Pages) : undefined,
      Description: fields.Description || '',
      'publication date': fields['publication date'] ? new Date(fields['publication date']).toISOString() : undefined,
      ed: fields.ed ? Number(fields.ed) : undefined,
      Language: fields.Language || '',
    };
    // Remove undefined fields
    Object.keys(bookData).forEach(key => {
      if (bookData[key as keyof typeof bookData] === undefined) {
        delete (bookData as any)[key];
      }
    });
    const input = {
      content_type_id: CONTENT_TYPE_IDS.BOOKS,
      data: bookData,
    };
    await fetch(`${API_BASE_URL}/content/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    setRefreshOrders(prev => !prev); // Refresh data
  };

  return (
    <AuthGuard
      title="Login Required"
      description="You must be logged in to view offers for your books. Redirecting to login..."
    >
      <SellBookModal
        open={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        onSubmit={handleSellBook}
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
        <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
        {/* Center columns: table */}
        <DataTable
          cardsPerRow={cardsPerRow}
          totalColumns={totalColumns}
          data={userOrders}
          columns={columns}
          loading={loading}
          emptyMessage={!loading ? "No offers found for your books." : undefined}
          rowKey="id"
        />
        {/* Side column right */}
        <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
      </Box>
    </AuthGuard>
  );
};

export default Sell; 