import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import Subheader from './Subheader';

import { getCardsPerRow } from '../utils/helpers';

interface LayoutProps {
  children: React.ReactNode;
  showSubheader?: boolean;
  subheaderProps?: {
    search?: string;
    onSearchChange?: (value: string) => void;
    filterAnchorEl?: null | HTMLElement;
    onFilterClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onFilterClose?: () => void;
    filterOpen?: boolean;
  };
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showSubheader = false, 
  subheaderProps = {} 
}) => {
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Header />
      {showSubheader && (
        <Subheader
          cardsPerRow={cardsPerRow}
          search={subheaderProps.search || ''}
          onSearchChange={subheaderProps.onSearchChange || (() => {})}
          filterAnchorEl={subheaderProps.filterAnchorEl || null}
          onFilterClick={subheaderProps.onFilterClick || (() => {})}
          onFilterClose={subheaderProps.onFilterClose || (() => {})}
          filterOpen={subheaderProps.filterOpen || false}
        />
      )}
      <main style={{ flex: 1, minHeight: 'calc(100vh - 128px)' }}>
        {children}
      </main>
      <Footer cardsPerRow={cardsPerRow} />
    </>
  );
};

export default Layout; 