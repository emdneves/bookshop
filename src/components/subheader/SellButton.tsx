import React from 'react';
import { Box } from '@mui/material';
import Pill from '../Pill';

interface SellButtonProps {
  fullWidth?: boolean;
  onClick?: () => void;
}

const SellButton: React.FC<SellButtonProps> = ({ fullWidth = false, onClick }) => {
  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <Pill fullWidth={fullWidth}>
          <Box
            component="button"
            onClick={onClick}
            sx={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            Sell a Book
          </Box>
        </Pill>
      </Box>
    </Box>
  );
};

export default SellButton; 