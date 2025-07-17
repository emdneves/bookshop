import React from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

interface ScrollableTableProps {
  children: React.ReactNode;
  cardsPerRow: number;
  totalColumns: number;
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ children, cardsPerRow, totalColumns }) => {
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
        overflow: 'auto',
        ...(cardsPerRow === 1 && {
          px: 0,
          borderRight: '0.5px dashed #d32f2f',
        }),
      }}
    >
      <Table sx={{
        minWidth: 800,
        background: 'none',
        tableLayout: 'auto',
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
        {children}
      </Table>
    </Box>
  );
};

export default ScrollableTable; 