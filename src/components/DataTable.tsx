import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Skeleton, 
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { getCardsPerRow } from '../utils/helpers';

// Column definition interface
export interface Column<T = any> {
  key: string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortKey?: string; // Custom key for sorting (useful for nested data)
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

// Table props interface
export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T, index: number) => void;
  hover?: boolean;
  size?: 'small' | 'medium';
  sx?: any;
  cardsPerRow?: number;
  totalColumns?: number;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found.',
  rowKey = 'id',
  onRowClick,
  hover = true,
  size = 'medium',
  sx = {},
  cardsPerRow: propCardsPerRow,
  totalColumns
}: DataTableProps<T>) => {
  const [cardsPerRow, setCardsPerRow] = useState(propCardsPerRow || getCardsPerRow());
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!propCardsPerRow) {
      const handleResize = () => setCardsPerRow(getCardsPerRow());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [propCardsPerRow]);

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    return row[rowKey] || index.toString();
  };

  const getCellValue = (row: T, column: Column<T>): any => {
    return row[column.key];
  };

  const getSortValue = (row: T, column: Column<T>): any => {
    const sortKey = column.sortKey || column.key;
    
    // Handle nested keys like 'data.name'
    if (sortKey.includes('.')) {
      return sortKey.split('.').reduce((obj, key) => obj?.[key], row);
    }
    
    return row[sortKey];
  };

  // Determine if a column should be sortable and its sort key
  const getColumnSortInfo = (column: Column<T>) => {
    // If explicitly set, use that
    if (column.sortable !== undefined) {
      return {
        sortable: column.sortable,
        sortKey: column.sortKey || column.key
      };
    }
    
    // Auto-determine sortability based on column key
    const autoSortable = !['offers', 'actions', 'id'].includes(column.key);
    
    // Auto-determine sort key based on common patterns
    let autoSortKey = column.key;
    if (column.key === 'book' || column.key === 'name') {
      autoSortKey = 'data.name';
    } else if (column.key === 'author') {
      autoSortKey = 'data.author';
    } else if (column.key === 'publisher') {
      autoSortKey = 'data.publisher';
    } else if (column.key === 'isbn') {
      autoSortKey = 'data.isbn';
    } else if (column.key === 'price') {
      autoSortKey = 'data.price';
    } else if (column.key === 'buyer' || column.key === 'seller') {
      autoSortKey = 'created_by';
    } else if (column.key === 'status') {
      autoSortKey = 'data.status';
    } else if (column.key === 'counter') {
      autoSortKey = 'data.counter';
    }
    
    return {
      sortable: autoSortable,
      sortKey: autoSortKey
    };
  };

  // Convert our column format to TanStack Table format
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    return columns.map(column => {
      const sortInfo = getColumnSortInfo(column);
      
      return {
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        size: column.width ? parseInt(String(column.width)) : undefined,
        minSize: 80,
        maxSize: 600,
        enableSorting: sortInfo.sortable,
        accessorFn: (row: T) => {
          if (sortInfo.sortKey && sortInfo.sortKey !== column.key) {
            return getSortValue(row, { ...column, sortKey: sortInfo.sortKey });
          }
          return getCellValue(row, column);
        },
        cell: ({ row, getValue }) => {
          const value = getValue();
          if (column.render) {
            return column.render(value, row.original, row.index);
          }
          return value;
        },
      };
    });
  }, [columns]);

  // Create TanStack Table instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange' as ColumnResizeMode,
    enableColumnResizing: true,
  });

  // Check if we're on the 2 smallest breakpoints
  const isSmallBreakpoint = cardsPerRow <= 2;

  const tableContent = (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Table 
        size={size} 
        sx={{
          ...sx,
          // Horizontal scroll on small breakpoints
          ...(isSmallBreakpoint && {
            minWidth: '800px',
            tableLayout: 'fixed',
            width: '100%',
          }),
          // Auto layout on larger breakpoints
          ...(!isSmallBreakpoint && {
            tableLayout: 'auto',
            width: '100%',
          })
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const column = columns.find(col => col.key === header.id);
                const sortInfo = column ? getColumnSortInfo(column) : { sortable: false };
                
                return (
                  <TableCell
                    key={header.id}
                    align={column?.align || 'left'}
                    sx={{ 
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      fontWeight: 600,
                      color: '#222',
                      borderBottom: '1px solid #d32f2f',
                      padding: size === 'small' ? '8px 16px' : '16px',
                      fontSize: '14px',
                      cursor: sortInfo.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: 'relative',
                      // Ellipsis on larger breakpoints
                      ...(!isSmallBreakpoint && {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      })
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                      <span>{column?.label || header.id}</span>
                      {sortInfo.sortable && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          <ArrowUpward 
                            sx={{ 
                              fontSize: '12px', 
                              color: header.column.getIsSorted() === 'asc' ? '#d32f2f' : '#666',
                              opacity: header.column.getIsSorted() === 'asc' ? 1 : 0.8
                            }} 
                          />
                          <ArrowDownward 
                            sx={{ 
                              fontSize: '12px', 
                              color: header.column.getIsSorted() === 'desc' ? '#d32f2f' : '#666',
                              opacity: header.column.getIsSorted() === 'desc' ? 1 : 0.8
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                    {/* Column resize handle */}
                    {!isSmallBreakpoint && (
                      <Box
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          height: '100%',
                          width: '4px',
                          cursor: 'col-resize',
                          userSelect: 'none',
                          touchAction: 'none',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                        }}
                      />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Skeleton variant="rectangular" width="100%" height={44} />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={getRowKey(row.original, row.index)}
                onClick={() => onRowClick?.(row.original, row.index)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': hover ? {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  } : {},
                  '&:last-child td': { border: 0 },
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const column = columns.find(col => col.key === cell.column.id);
                  
                  return (
                    <TableCell
                      key={cell.id}
                      align={column?.align || 'left'}
                      sx={{
                        borderBottom: '0.5px dashed #d32f2f',
                        padding: size === 'small' ? '8px 16px' : '16px',
                        fontSize: '14px',
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        // Ellipsis on larger breakpoints
                        ...(!isSmallBreakpoint && {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        })
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );

  // If we have grid layout props, wrap in responsive container
  if (totalColumns !== undefined) {
    return (
      <Box
        sx={{
          gridColumn: cardsPerRow === 1 ? '2 / 3' : `2 / ${totalColumns}`,
          width: '100%',
          background: 'none',
          p: 0,
          m: 0,
          height: 'fit-content',
          minHeight: '40px',
          overflow: isSmallBreakpoint ? 'auto' : 'visible', // Horizontal scroll only on small breakpoints
          ...(cardsPerRow === 1 && {
            px: 0,
            borderRight: '0.5px dashed #d32f2f',
          }),
        }}
      >
        <Box sx={{
          minWidth: isSmallBreakpoint ? 800 : '100%',
          width: '100%',
          overflow: isSmallBreakpoint ? 'auto' : 'visible',
        }}>
          {tableContent}
        </Box>
      </Box>
    );
  }

  return tableContent;
};

export default DataTable; 