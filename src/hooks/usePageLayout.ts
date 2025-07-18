import { useState, useEffect } from 'react';
import { getCardsPerRow } from '../utils/helpers';

export const usePageLayout = () => {
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalColumns = cardsPerRow + 2;

  return {
    cardsPerRow,
    totalColumns,
    gridTemplateColumns: cardsPerRow === 1 
      ? '0.125fr 0.75fr 0.125fr' 
      : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`
  };
}; 