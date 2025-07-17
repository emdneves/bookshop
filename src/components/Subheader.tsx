import React from 'react';
import { Box, TextField, IconButton, Popover, Button, Typography, Breadcrumbs, Link } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

interface SubheaderProps {
  cardsPerRow: number;
  mode?: 'search' | 'breadcrumbs';
  // Search mode props
  search?: string;
  onSearchChange?: (value: string) => void;
  filterAnchorEl?: null | HTMLElement;
  onFilterClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onFilterClose?: () => void;
  filterOpen?: boolean;
  // Breadcrumbs mode props
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const Subheader: React.FC<SubheaderProps> = ({
  cardsPerRow,
  mode = 'search',
  search = '',
  onSearchChange = () => {},
  filterAnchorEl = null,
  onFilterClick = () => {},
  onFilterClose = () => {},
  filterOpen = false,
  breadcrumbs = [],
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
          // Breadcrumbs mode
          if (mode === 'breadcrumbs') {
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
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" sx={{ color: '#d32f2f' }} />}
                  sx={{
                    '& .MuiBreadcrumbs-separator': {
                      color: '#d32f2f',
                    },
                  }}
                >
                  {breadcrumbs.map((crumb, index) => (
                    <Link
                      key={index}
                      href={crumb.href}
                      underline="hover"
                      sx={{
                        color: index === breadcrumbs.length - 1 ? '#d32f2f' : '#666',
                        fontWeight: index === breadcrumbs.length - 1 ? 700 : 400,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        '&:hover': {
                          color: '#d32f2f',
                        },
                      }}
                    >
                      {index === 0 && <HomeIcon sx={{ fontSize: 16 }} />}
                      {crumb.label}
                    </Link>
                  ))}
                </Breadcrumbs>
              </Box>
            );
          }

          // Search mode - Single column case: both search and filter in one column
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
                  placeholder="Search by book name, author, or ISBN"
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
                    bgcolor: 'floralwhite',
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
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.08)',
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                    },
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
                  PaperProps={{ sx: {
                    p: 2,
                    minWidth: 200,
                    bgcolor: 'floralwhite !important',
                    backgroundColor: 'floralwhite !important',
                    border: '1px dashed #d32f2f',
                    boxShadow: '0 4px 12px rgba(211,47,47,0.08)',
                    '& *': {
                      backgroundColor: 'floralwhite !important',
                    },
                    '& .MuiButton-root, & .MuiMenuItem-root': {
                      backgroundColor: 'floralwhite !important',
                      color: '#d32f2f',
                      borderColor: '#d32f2f',
                    },
                    '& .MuiButton-root:hover, & .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: 'rgba(211, 47, 47, 0.08) !important',
                      color: '#d32f2f',
                    },
                    '& .MuiButton-contained': {
                      backgroundColor: '#d32f2f !important',
                      color: 'floralwhite !important',
                    },
                    '& .MuiButton-contained:hover': {
                      backgroundColor: '#b71c1c !important',
                    },
                  } }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#d32f2f', fontWeight: 700 }}>
                    Filters
                  </Typography>
                  {/* Placeholder filter options */}
                  <Button fullWidth variant="outlined" sx={{ mb: 1, borderColor: '#d32f2f', color: '#d32f2f', bgcolor: 'floralwhite', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)', borderColor: '#d32f2f' } }}>
                    Example Filter
                  </Button>
                  <Button fullWidth variant="contained" onClick={onFilterClose} sx={{ bgcolor: '#d32f2f', color: 'floralwhite', fontWeight: 700, '&:hover': { bgcolor: '#b71c1c' } }}>
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
                  placeholder="Search by book name, author, or ISBN"
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
    </>
  );
};

export default Subheader; 