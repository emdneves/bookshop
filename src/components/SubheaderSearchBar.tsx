import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSearch } from '../context/SearchContext';

interface SubheaderSearchBarProps {
  fullWidth?: boolean;
}

const SubheaderSearchBar: React.FC<SubheaderSearchBarProps> = ({ fullWidth = false }) => {
  const { setSearchTerm } = useSearch();
  const [searchValue, setSearchValue] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, setSearchTerm]);

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
      <Box
        component="input"
        placeholder="Search by book name"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{
          width: '100%',
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          border: '1.5px dashed #d32f2f',
          color: '#d32f2f',
          background: 'transparent',
          fontWeight: 600,
          fontSize: '0.98em',
          lineHeight: 1.2,
          outline: 'none',
          '&::placeholder': {
            color: '#d32f2f',
            opacity: 0.7,
          },
          '&:focus': {
            border: '1px solid #d32f2f',
          },
        }}
      />
    </Box>
  );
};

export default SubheaderSearchBar; 