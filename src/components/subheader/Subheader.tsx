import React from 'react';
import { Box, TextField, IconButton, Popover, Button, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SHARED_BG, getBorderStyle } from '../../constants/colors';

interface SubheaderProps {
  cardsPerRow: number;
  left?: React.ReactElement<any>;
  right?: React.ReactElement<any>;
}

// Helper to safely clone with fullWidth if possible
function cloneWithFullWidth(node: React.ReactNode) {
  if (React.isValidElement(node) && typeof node.type !== 'string') {
    // Type assertion: we know our slot components accept fullWidth
    return React.cloneElement(node as React.ReactElement<{ fullWidth?: boolean }>, { fullWidth: true });
  }
  return node;
}

const Subheader: React.FC<SubheaderProps> = ({
  cardsPerRow,
  left,
  right,
}) => {
  const totalColumns = cardsPerRow + 2;
  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

  return (
    <>
      {/* Global style override for MUI Popover/MenuItem */}
      <style>{`
        .MuiPopover-paper, .MuiMenu-paper, .MuiMenu-list, .MuiMenuItem-root {
          background-color: floralwhite !important;
        }
        .MuiMenuItem-root.Mui-selected, .MuiMenuItem-root:focus, .MuiMenuItem-root:hover {
          background-color: rgba(211, 47, 47, 0.08) !important;
          color: #d32f2f !important;
        }
        .MuiButton-containedPrimary, .MuiButton-contained {
          background-color: #d32f2f !important;
          color: floralwhite !important;
        }
        .MuiButton-containedPrimary:hover, .MuiButton-contained:hover {
          background-color: #b71c1c !important;
        }
        .Mui-focused, .Mui-focusVisible {
          box-shadow: 0 0 0 2px #d32f2f !important;
        }
      `}</style>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns,
          gridTemplateRows: '40px', // Half the header height
          alignItems: 'center',
          height: 40,
          minHeight: 40,
          maxHeight: 40,
          background: SHARED_BG,
          borderBottom: getBorderStyle(),
          position: 'sticky',
          top: cardsPerRow === 1 ? '120px' : '80px', // Responsive header height
          zIndex: 9,
        }}
      >
        {/* Side column left */}
        <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
        {/* Center columns */}
        {Array.from({ length: cardsPerRow }).map((_, i) => {
          // Single column: merge left and right into center slot
          if (cardsPerRow === 1) {
            return (
              <Box
                key={i}
                sx={{
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 40,
                  maxHeight: 40,
                  borderRight: getBorderStyle(),
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box sx={{
                  width: '50%',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>{left && React.cloneElement(left, { fullWidth: true })}</Box>
                <Box sx={{
                  width: '50%',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>{right && React.cloneElement(right, { fullWidth: true })}</Box>
              </Box>
            );
          }
          // Special case: 2 columns, left in first, right in second
          if (cardsPerRow === 2) {
            if (i === 0) {
              return (
                <Box
                  key={i}
                  sx={{
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 40,
                    maxHeight: 40,
                    borderRight: getBorderStyle(),
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  {left && React.cloneElement(left, { fullWidth: true })}
                </Box>
              );
            }
            if (i === 1) {
              return (
                <Box
                  key={i}
                  sx={{
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 40,
                    maxHeight: 40,
                    borderRight: getBorderStyle(),
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  {right && React.cloneElement(right, { fullWidth: true })}
                </Box>
              );
            }
            // Should never hit this, but just in case
            return <Box key={i} sx={{ borderRight: getBorderStyle(), height: '100%', minHeight: 40, maxHeight: 40 }} />;
          }
          // Multiple columns: left in first, right in last
          if (i === 0) {
            return (
              <Box
                key={i}
                sx={{
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 40,
                  maxHeight: 40,
                  borderRight: getBorderStyle(),
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                {left && React.cloneElement(left, { fullWidth: true })}
              </Box>
            );
          }
          if (i === cardsPerRow - 1) {
            return (
              <Box
                key={i}
                sx={{
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 40,
                  maxHeight: 40,
                  // borderRight: getBorderStyle(), // Removed to avoid double border
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                {right && React.cloneElement(right, { fullWidth: true })}
              </Box>
            );
          }
          // Middle columns: empty
          return (
            <Box
              key={i}
              sx={{
                borderRight: getBorderStyle(),
                height: '100%',
                minHeight: 40,
                maxHeight: 40,
              }}
            />
          );
        })}
        {/* Side column right */}
        <Box sx={{ borderLeft: getBorderStyle(), height: '100%' }} />
      </Box>
    </>
  );
};

export default Subheader; 