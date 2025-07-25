import React from 'react';
import { Box, Typography } from '@mui/material';
import { getCardsPerRow } from '../utils/helpers';
import { 
  SHARED_BG, 
  ARTIFACT_RED, 
  getBorderStyle 
} from '../constants/colors';
import { FONT_SIZES } from '../constants/typography';

interface FooterProps {
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => {
  const cardsPerRow = getCardsPerRow();
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
        borderTop: getBorderStyle(),
        zIndex: 9,
      }}
    >
      {/* Side column left */}
      <Box sx={{ borderRight: getBorderStyle(), height: '100%' }} />
      {/* Center columns */}
      {Array.from({ length: cardsPerRow }).map((_, i) => {
        if (i === 0) {
          // First center column: contact
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                borderRight: getBorderStyle(),
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: FONT_SIZES.SMALL,
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Contact: <a href="mailto:support@theartifact.shop" style={{ color: ARTIFACT_RED, textDecoration: 'none' }}>support@theartifact.shop</a>
              </Typography>
            </Box>
          );
        } else if (i === cardsPerRow - 1) {
          // Last center column: copyright
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                borderRight: getBorderStyle(),
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: FONT_SIZES.SMALL,
                  lineHeight: 1.2,
                }}
              >
                © 2024 The Artifact. All rights reserved.
              </Typography>
            </Box>
          );
        }
        // Other center columns: empty with border
        return <Box key={i} sx={{ borderRight: getBorderStyle(), height: '100%' }} />;
      })}
      {/* Side column right */}
      <Box sx={{ height: '100%' }} />
    </Box>
  );
};

export default Footer; 