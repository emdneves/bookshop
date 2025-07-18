import React, { useState } from 'react';
import { Box, Popover, Button, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Pill from './Pill';

interface SubheaderFilterButtonProps {
  fullWidth?: boolean;
}

const SubheaderFilterButton: React.FC<SubheaderFilterButtonProps> = ({ fullWidth = false }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  return (
    <>
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
              onClick={handleClick}
              aria-describedby={id}
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
              <FilterListIcon sx={{ fontSize: '1em' }} />
              Filter
            </Box>
          </Pill>
        </Box>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f' }}>
            Filter Options
          </Typography>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ width: '100%' }}
          >
            Apply Filters
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default SubheaderFilterButton; 