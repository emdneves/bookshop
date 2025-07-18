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
    left?: React.ReactElement<any>;
    right?: React.ReactElement<any>;
  };
  onSearchChange?: (value: string) => void;
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
          left={subheaderProps.left}
          right={subheaderProps.right}
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