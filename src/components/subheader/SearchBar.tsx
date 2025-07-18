import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSearch } from '../../context/SearchContext';
import Pill from '../Pill';

interface SearchBarProps {
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ fullWidth = false }) => {
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
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <Pill fullWidth={fullWidth}>
          <Box
            component="input"
            placeholder="Search by book name"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              textAlign: 'center',
              '&::placeholder': {
                color: 'inherit',
                opacity: 0.7,
                textAlign: 'center',
              },
            }}
          />
        </Pill>
      </Box>
    </Box>
  );
};

export default SearchBar; 