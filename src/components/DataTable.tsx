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
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { ArrowUpward, ArrowDownward, FilterList } from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnResizeMode,
  FilterFn,
  ColumnFiltersState,
  GlobalFilterTableState,
} from '@tanstack/react-table';
import { getCardsPerRow } from '../utils/helpers';
import { 
  ARTIFACT_RED, 
  ARTIFACT_RED_TRANSPARENT_04,
  getBorderStyle 
} from '../constants/colors';
import { FONT_SIZES } from '../constants/typography';

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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  // Determine if a column should be filterable and its filter type
  const getColumnFilterInfo = (column: Column<T>) => {
    // Auto-determine filterability and type based on column key
    if (column.key === 'status') {
      return { filterable: true, filterType: 'select' };
    } else if (['book', 'name', 'author', 'publisher', 'buyer', 'seller'].includes(column.key)) {
      return { filterable: true, filterType: 'text' };
    } else if (['price', 'counter', 'my_offer', 'proposal'].includes(column.key)) {
      return { filterable: true, filterType: 'number' };
    } else if (column.key === 'created_at') {
      return { filterable: true, filterType: 'date' };
    }
    
    return { filterable: false, filterType: 'text' };
  };

  // Get unique values for select filters
  const getUniqueValues = (columnKey: string) => {
    const values = new Set<string>();
    data.forEach(row => {
      let value = '';
      if (columnKey.includes('.')) {
        value = columnKey.split('.').reduce((obj: any, key) => obj?.[key], row) || '';
      } else {
        value = row[columnKey] || '';
      }
      if (value) values.add(String(value));
    });
    return Array.from(values).sort();
  };

  // Convert our column format to TanStack Table format
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    return columns.map(column => {
      const sortInfo = getColumnSortInfo(column);
      const filterInfo = getColumnFilterInfo(column);
      
      return {
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        size: column.width ? parseInt(String(column.width)) : undefined,
        minSize: 80,
        maxSize: 600,
        enableSorting: sortInfo.sortable,
        enableColumnFilter: filterInfo.filterable,
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
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange' as ColumnResizeMode,
    enableColumnResizing: true,
    enableFilters: true,
  });

  // Check if we're on the 2 smallest breakpoints
  const isSmallBreakpoint = cardsPerRow <= 2;

  const tableContent = (
    <Box sx={{ width: '100%' }}>
      {/* Filter Status */}
      {columnFilters.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={`${table.getFilteredRowModel().rows.length} of ${table.getPreFilteredRowModel().rows.length} rows`}
            size="small"
            sx={{ backgroundColor: ARTIFACT_RED, color: 'white' }}
          />
        </Box>
      )}

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
          // Fixed layout with ellipsis on larger breakpoints
          ...(!isSmallBreakpoint && {
            tableLayout: 'fixed',
            width: '100%',
            maxWidth: '100%', // Ensure table doesn't exceed container
            overflow: 'hidden', // Prevent any overflow
          })
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const column = columns.find(col => col.key === header.id);
                const sortInfo = column ? getColumnSortInfo(column) : { sortable: false };
                const filterInfo = column ? getColumnFilterInfo(column) : { filterable: false, filterType: 'text' };
                
                return (
                  <TableCell
                    key={header.id}
                    align={column?.align || 'left'}
                    sx={{ 
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(), // Prevent expansion
                      fontWeight: 600,
                      color: '#222',
                      borderBottom: getBorderStyle(),
                      padding: size === 'small' ? '8px 16px' : '16px',
                      fontSize: FONT_SIZES.MEDIUM,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {sortInfo.sortable && (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <ArrowUpward 
                              sx={{ 
                                fontSize: FONT_SIZES.SMALL, 
                                color: header.column.getIsSorted() === 'asc' ? ARTIFACT_RED : '#666',
                                opacity: header.column.getIsSorted() === 'asc' ? 1 : 0.8
                              }} 
                            />
                            <ArrowDownward 
                              sx={{ 
                                fontSize: FONT_SIZES.SMALL, 
                                color: header.column.getIsSorted() === 'desc' ? ARTIFACT_RED : '#666',
                                opacity: header.column.getIsSorted() === 'desc' ? 1 : 0.8
                              }} 
                            />
                          </Box>
                        )}
                        {filterInfo.filterable && (
                          <FilterList 
                            sx={{ 
                              fontSize: FONT_SIZES.MEDIUM, 
                              color: header.column.getIsFiltered() ? ARTIFACT_RED : '#666',
                              opacity: header.column.getIsFiltered() ? 1 : 0.8,
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle filter input visibility
                              const filterInput = document.getElementById(`filter-${header.id}`);
                              if (filterInput) {
                                filterInput.style.display = filterInput.style.display === 'none' ? 'block' : 'none';
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    {/* Column Filter Input */}
                    {filterInfo.filterable && (
                      <Box
                        id={`filter-${header.id}`}
                        sx={{
                          display: 'none',
                          mt: 1,
                          '&:hover': { display: 'block' }
                        }}
                      >
                        {filterInfo.filterType === 'text' && (
                          <TextField
                            placeholder={`Filter ${column?.label}...`}
                            value={(header.column.getFilterValue() as string) ?? ''}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': { 
                                fontSize: FONT_SIZES.SMALL,
                                height: '32px'
                              }
                            }}
                          />
                        )}
                        {filterInfo.filterType === 'number' && (
                          <TextField
                            type="number"
                            placeholder={`Min ${column?.label}...`}
                            value={(header.column.getFilterValue() as string) ?? ''}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': { 
                                fontSize: FONT_SIZES.SMALL,
                                height: '32px'
                              }
                            }}
                          />
                        )}
                        {filterInfo.filterType === 'date' && (
                          <TextField
                            type="date"
                            value={(header.column.getFilterValue() as string) ?? ''}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': { 
                                fontSize: FONT_SIZES.SMALL,
                                height: '32px'
                              }
                            }}
                          />
                        )}
                        {filterInfo.filterType === 'select' && (
                          <TextField
                            select
                            placeholder={`Filter ${column?.label}...`}
                            value={(header.column.getFilterValue() as string) ?? ''}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': { 
                                fontSize: FONT_SIZES.SMALL,
                                height: '32px'
                              }
                            }}
                          >
                            <MenuItem value="">All</MenuItem>
                            {getUniqueValues(column?.key || header.id).map((value) => (
                              <MenuItem key={value} value={value}>
                                {value}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </Box>
                    )}
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
                            backgroundColor: ARTIFACT_RED,
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
                    backgroundColor: ARTIFACT_RED_TRANSPARENT_04,
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
                        borderBottom: getBorderStyle(),
                        padding: size === 'small' ? '8px 16px' : '16px',
                        fontSize: FONT_SIZES.MEDIUM,
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(), // Prevent expansion
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
          overflow: 'hidden', // Always hide overflow to prevent sliding
          ...(cardsPerRow === 1 && {
            px: 0,
            borderRight: getBorderStyle(),
          }),
        }}
      >
        <Box sx={{
          width: '100%',
          overflow: isSmallBreakpoint ? 'auto' : 'hidden', // Horizontal scroll only on small breakpoints
          ...(isSmallBreakpoint && {
            minWidth: '800px', // Force minimum width for scrolling on small breakpoints
          }),
          ...(!isSmallBreakpoint && {
            maxWidth: '100%', // Ensure table doesn't exceed container width on larger breakpoints
          }),
        }}>
          {tableContent}
        </Box>
      </Box>
    );
  }

  return tableContent;
};

export default DataTable; 