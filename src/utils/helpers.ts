// Helper to get cards per row based on screen size
export const getCardsPerRow = () => {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  if (window.innerWidth < 1200) return 3;
  if (window.innerWidth < 1500) return 4;
  return 5;
};

// Helper to get total columns (main + 2 sides)
export const getTotalColumns = () => getCardsPerRow() + 2; 