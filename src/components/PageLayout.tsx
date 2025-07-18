import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { getCardsPerRow } from '../utils/helpers';

interface LayoutTestProps {
  children?: React.ReactNode;
  showSubheader?: boolean;
  subheaderProps?: {
    left?: React.ReactElement<any>;
    right?: React.ReactElement<any>;
  };
  leftColumnContent?: React.ReactNode;
  centerColumnContent?: React.ReactNode;
  rightColumnContent?: React.ReactNode;
  rowCount?: number; // Number of rows to create in side columns
}

const LayoutTest: React.FC<LayoutTestProps> = ({ 
  children, 
  showSubheader = false, 
  subheaderProps = {},
  leftColumnContent,
  centerColumnContent,
  rightColumnContent,
  rowCount = 10 // Default number of rows
}) => {
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Grid template columns for the main layout
  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns,
        background: 'none',
        alignItems: 'stretch',
      }}
    >
      {/* Side column left */}
      <Box sx={{ 
        borderRight: '0.5px dashed #d32f2f', 
        background: 'transparent',
        height: '100vh',
      }}>
        {leftColumnContent || (
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: `repeat(${rowCount}, 1fr)`,
              height: '100%',
              gap: 0,
            }}
          >
            {Array.from({ length: rowCount }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  borderBottom: index < rowCount - 1 ? '0.5px dashed #d32f2f' : 'none',
                  height: '100%',
                  minHeight: 0,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
      
      {/* Center content area */}
      <Box
        sx={{
          gridColumn: cardsPerRow === 1 ? '2' : `2 / span ${cardsPerRow}`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Subheader (if enabled) */}
        {showSubheader && subheaderProps.left && subheaderProps.right && (
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '40px',
              alignItems: 'center',
              height: 40,
              minHeight: 40,
              maxHeight: 40,
              background: 'rgba(255, 255, 255, 0.5)',
              borderBottom: '0.5px dashed #d32f2f',
              position: 'sticky',
              top: cardsPerRow === 1 ? '120px' : '80px',
              zIndex: 9,
              gap: 1,
              px: 1,
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
            }}>
              {subheaderProps.left}
            </Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
            }}>
              {subheaderProps.right}
            </Box>
          </Box>
        )}
        
        {/* Main content */}
        <Box sx={{ flex: 1, padding: '24px 0' }}>
          {centerColumnContent || children}
        </Box>
      </Box>
      
      {/* Side column right */}
      <Box sx={{ 
        borderLeft: '0.5px dashed #d32f2f', 
        background: 'transparent',
        height: '100vh',
      }}>
        {rightColumnContent || (
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: `repeat(${rowCount}, 1fr)`,
              height: '100%',
              gap: 0,
            }}
          >
            {Array.from({ length: rowCount }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  borderBottom: index < rowCount - 1 ? '0.5px dashed #d32f2f' : 'none',
                  height: '100%',
                  minHeight: 0,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LayoutTest; 