import React from 'react';
import { Box, Typography } from '@mui/material';
import { SHARED_BG } from '../constants/colors';

interface FooterProps {
  cardsPerRow: number;
}

const Footer: React.FC<FooterProps> = ({ cardsPerRow }) => {
  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'center',
        minHeight: 64,
        background: SHARED_BG,
        borderTop: '0.5px dashed #d32f2f',
        zIndex: 9,
      }}
    >
      {/* Side column left */}
      <Box sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />
      {/* Center columns */}
      {Array.from({ length: cardsPerRow }).map((_, i) => {
        // First center column: copyright and meta info
        if (i === 0) {
          return (
            <Box
              key={i}
              sx={{
                px: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                borderRight: '0.5px dashed #d32f2f',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontSize: '0.8rem',
                }}
              >
                © {new Date().getFullYear()} the artifact<br />
                Modern Book Marketplace
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#999',
                  fontSize: '0.7rem',
                  mt: 0.5,
                }}
              >
                Contact: <a href="mailto:support@theartifact.shop" style={{ color: '#d32f2f', textDecoration: 'none' }}>support@theartifact.shop</a>
              </Typography>
            </Box>
          );
        }
        // Last center column: short about or legal
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
                borderRight: '0.5px dashed #d32f2f',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}
              >
                All rights reserved.<br />
                <span style={{ fontSize: '0.7em', color: '#999' }}>A modern marketplace for buying and selling books.</span>
              </Typography>
            </Box>
          );
        }
        // Other center columns: empty with border
        return <Box key={i} sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />;
      })}
      {/* Side column right */}
      <Box sx={{ height: '100%' }} />
    </Box>
  );
};

export default Footer; 