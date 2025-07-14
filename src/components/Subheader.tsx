import React from 'react';
import { Box, TextField, IconButton, Popover, Button, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface SubheaderProps {
  cardsPerRow: number;
  search: string;
  onSearchChange: (value: string) => void;
  filterAnchorEl: null | HTMLElement;
  onFilterClick: (event: React.MouseEvent<HTMLElement>) => void;
  onFilterClose: () => void;
  filterOpen: boolean;
}

const Subheader: React.FC<SubheaderProps> = ({
  cardsPerRow,
  search,
  onSearchChange,
  filterAnchorEl,
  onFilterClick,
  onFilterClose,
  filterOpen,
}) => {
  const totalColumns = cardsPerRow + 2;
  const gridTemplateColumns = cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`;

  return (
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
        background: 'floralwhite',
        borderBottom: '0.5px dashed #d32f2f',
        position: 'sticky',
        top: '80px', // Header height
        zIndex: 9,
      }}
    >
      {/* Side column left */}
      <Box sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%' }} />
      {/* Center columns */}
      {Array.from({ length: cardsPerRow }).map((_, i) => {
        // Single column case: both search and filter in one column
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
                borderRight: '0.5px dashed #d32f2f',
                gap: 1,
              }}
            >
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search book name"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                sx={{ 
                  width: '60%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                    borderRadius: '20px',
                    height: 32,
                    minHeight: 32,
                    maxHeight: 32,
                    fontSize: 14,
                    '& fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                    '&:hover fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                    '&.Mui-focused fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                    height: '1.2em',
                    padding: '8px 12px',
                  },
                }}
              />
              <Button
                onClick={onFilterClick}
                size="small"
                startIcon={<FilterListIcon />}
                sx={{
                  border: '0.5px dashed #d32f2f',
                  bgcolor: 'white',
                  color: '#d32f2f',
                  height: 32,
                  minHeight: 32,
                  maxHeight: 32,
                  fontSize: 14,
                  borderRadius: '20px',
                  px: 1.5,
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Filter
              </Button>
              <Popover
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={onFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, minWidth: 200 } }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filters
                </Typography>
                {/* Placeholder filter options */}
                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                  Example Filter
                </Button>
                <Button fullWidth variant="contained" onClick={onFilterClose}>
                  Apply
                </Button>
              </Popover>
            </Box>
          );
        }
        
        // Multiple columns case: separate search and filter
        // First center column: search
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
                borderRight: '0.5px dashed #d32f2f',
              }}
            >
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search book name"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                sx={{ 
                  width: '80%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    borderRadius: '20px',
                    height: 32,
                    minHeight: 32,
                    maxHeight: 32,
                    fontSize: 14,
                    '& fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                    '&:hover fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                    '&.Mui-focused fieldset': {
                      border: '0.5px dashed #d32f2f',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                    height: '1.2em',
                    padding: '8px 12px',
                  },
                }}
              />
            </Box>
          );
        }
        // Last center column: filter
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
                borderRight: '0.5px dashed #d32f2f',
              }}
            >
              <Button
                onClick={onFilterClick}
                size="small"
                startIcon={<FilterListIcon />}
                sx={{
                  border: '0.5px dashed #d32f2f',
                  bgcolor: 'transparent',
                  color: '#d32f2f',
                  height: 32,
                  minHeight: 32,
                  maxHeight: 32,
                  fontSize: 14,
                  borderRadius: '20px',
                  px: 1.5,
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Filter
              </Button>
              <Popover
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={onFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, minWidth: 200 } }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filters
                </Typography>
                {/* Placeholder filter options */}
                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                  Example Filter
                </Button>
                <Button fullWidth variant="contained" onClick={onFilterClose}>
                  Apply
                </Button>
              </Popover>
            </Box>
          );
        }
        // Other center columns: empty with border
        return <Box key={i} sx={{ borderRight: '0.5px dashed #d32f2f', height: '100%', minHeight: 40, maxHeight: 40 }} />;
      })}
      {/* Side column right */}
      <Box sx={{ height: '100%' }} />
    </Box>
  );
};

export default Subheader; 