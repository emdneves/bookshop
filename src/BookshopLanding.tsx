import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  styled
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';

// Remove the old BookCard interface and replace with a new one for API data
interface BookCard {
  id: string;
  title: string;
  author: string;
  isbn: string | number;
  cover: string;
  publisher?: string;
}

const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
    body2: {
      fontSize: '0.6rem',
      lineHeight: 1.1,
    },
  },
  palette: {
    background: {
      default: '#fafafa',
    },
  },
});

// Full viewport container with grid background
const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr 5fr 1fr',
  gridTemplateRows: '0.5fr auto', // top row is half height, rest is auto (will be set in GridContainer)
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr 4fr 1fr',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr 3fr 1fr',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr 2fr 1fr',
  },
}));

// Helper to get cards per row based on screen size
const getCardsPerRow = () => {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  if (window.innerWidth < 1200) return 3;
  if (window.innerWidth < 1500) return 4;
  return 5;
};

// New: Helper to get total columns (main + 2 sides)
const getTotalColumns = () => getCardsPerRow() + 2;

// Update GridContainer to start at gridRow 2 so cards start after the empty top row
const GridContainer = styled(Box)<{cardsPerRow: number}>(({ cardsPerRow }) => ({
  gridColumn: '1 / -1',
  gridRow: 2,
  display: 'grid',
  gridTemplateColumns: `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
  gap: '0',
  position: 'relative',
  paddingTop: '24px',
  paddingBottom: '24px',
  background: 'none',
  gridAutoRows: '1fr',
}));

// Remove aspect-ratio from GridItem
const GridItem = styled(Box)<{
  col: number;
  row: number;
  colCount: number;
  rowCount: number;
}>(({ col, row, colCount, rowCount }) => ({
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
  background: 'none',
  borderRight: col < colCount - 1 ? '0.5px dashed #d32f2f' : 'none',
  borderBottom: row < rowCount - 1 ? '0.5px dashed #d32f2f' : 'none',
  padding: '8px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
}));

// Card hover wrapper
const CardHoverWrapper = styled('div')({
  width: '100%',
  aspectRatio: '1 / 1',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border 0.2s',
  boxSizing: 'border-box',
  '&:hover .MuiCardContainer-hover': {
    border: '0.5px dashed #d32f2f',
  },
  '&:hover .MuiTextSection-hover': {
    color: '#d32f2f',
  },
});

// Card container is a perfect square, fills the padded area, and uses flex column
const CardContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  border: '0.5px solid transparent', // default, overridden on hover
  transition: 'border 0.2s',
});

// The card content is flex column, fills the card
const CardInner = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

// Image section is 4/5 of the card, never overflows
const ImageSection = styled(Box)({
  flex: '4 1 0%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

// Text section is 1/5 of the card
const TextSection = styled(Box)({
  flex: '1 1 0%',
  width: '100%',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  color: '#666',
  transition: 'color 0.2s',
});

const PlaceholderImage = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: '80%',
    height: '80%',
    opacity: 0.4,
  },
});

// Simple architectural drawing placeholder
const ArchitecturalDrawing = () => (
  <svg viewBox="0 0 200 200" style={{ stroke: '#666', fill: 'none', strokeWidth: 1 }}>
    {/* Simple building outline */}
    <rect x="40" y="60" width="120" height="100" />
    <line x1="40" y1="60" x2="100" y2="20" />
    <line x1="100" y1="20" x2="160" y2="60" />
    {/* Windows */}
    <rect x="55" y="80" width="20" height="25" />
    <rect x="85" y="80" width="20" height="25" />
    <rect x="115" y="80" width="20" height="25" />
    <rect x="55" y="120" width="20" height="25" />
    <rect x="85" y="120" width="20" height="25" />
    <rect x="115" y="120" width="20" height="25" />
    {/* Door */}
    <rect x="90" y="140" width="20" height="20" />
  </svg>
);

const BookshopLanding: React.FC = () => {
  const [bookCards, setBookCards] = useState<BookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const cardsPerRow = getCardsPerRow();
  const totalColumns = cardsPerRow + 2;
  const mainRows = Math.ceil(bookCards.length / cardsPerRow);
  const totalRows = mainRows + 2; // +2 for top and bottom half-height rows

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/content/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content_type_id: '481a065c-8733-4e97-9adf-dc64acacf5fb',
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        if (!data.success) throw new Error('API returned error');
        let cards: BookCard[] = (data.contents || []).map((item: any) => ({
          id: item.id,
          title: item.data.name,
          author: item.data.author,
          isbn: item.data.isbn,
          cover: item.data.Cover,
          publisher: item.data.publisher,
        }));
        cards = cards.sort((a, b) => (a.publisher || '').localeCompare(b.publisher || '', undefined, { sensitivity: 'base' }));
        setBookCards(cards);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
    // Responsive columns
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add the info card as the first card
  const infoCard: BookCard = {
    id: 'info',
    title: 'Red Spine Books',
    author: '',
    isbn: '',
    cover: '',
  };
  const allCards = [...bookCards]; // Only books in main area

  // Build a 2D array for the grid: [row][col]
  const grid: (BookCard | null)[][] = [];
  // First row: all null (empty, half-height)
  const topRow: (BookCard | null)[] = Array(totalColumns).fill(null);
  // Place info card in first center cell of top row
  if (totalColumns > 2) {
    topRow[1] = infoCard;
  }
  grid.push(topRow);
  // Main rows: side columns null, center columns filled with cards
  let cardIndex = 0;
  for (let r = 0; r < mainRows; r++) {
    const rowArr: (BookCard | null)[] = [];
    for (let c = 0; c < totalColumns; c++) {
      if (c === 0 || c === totalColumns - 1) {
        rowArr.push(null); // side/corner
      } else if (cardIndex < allCards.length) {
        rowArr.push(allCards[cardIndex++]);
      } else {
        rowArr.push(null);
      }
    }
    grid.push(rowArr);
  }
  // Last row: all null (empty, half-height)
  grid.push(Array(totalColumns).fill(null));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageWrapper
        sx={{
          gridTemplateColumns: `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
          gridTemplateRows: `0.5fr repeat(${mainRows}, 1fr) 0.5fr`,
        }}
      >
        <GridContainer cardsPerRow={cardsPerRow} sx={{
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          display: 'grid',
          gridTemplateColumns: `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
          gridTemplateRows: `0.5fr repeat(${mainRows}, 1fr) 0.5fr`,
          gap: 0,
          background: 'none',
          gridAutoRows: '1fr',
          paddingTop: 0,
          paddingBottom: 0,
        }}>
          {grid.map((rowArr, rowIdx) =>
            rowArr.map((cell, colIdx) => {
              // Only render cards in center area (not in first/last row or first/last col)
              if (
                rowIdx === 0 || rowIdx === totalRows - 1 ||
                colIdx === 0 || colIdx === totalColumns - 1
              ) {
                // Render Bookshop info card in first center cell of top row
                if (rowIdx === 0 && colIdx === 1 && grid[0][1] && grid[0][1].id === 'info') {
                  return (
                    <GridItem
                      key={`info-toprow`}
                      col={colIdx}
                      row={rowIdx}
                      colCount={totalColumns}
                      rowCount={totalRows}
                    >
                      <CardHoverWrapper>
                        <CardContainer className="MuiCardContainer-hover" sx={{ alignItems: 'center' }}>
                          <CardInner sx={{ alignItems: 'center' }}>
                            <TextSection className="MuiTextSection-hover">
                              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                Bookshop
                              </Typography>

                            </TextSection>
                          </CardInner>
                        </CardContainer>
                      </CardHoverWrapper>
                    </GridItem>
                  );
                }
                return (
                  <GridItem
                    key={`empty-${rowIdx}-${colIdx}`}
                    col={colIdx}
                    row={rowIdx}
                    colCount={totalColumns}
                    rowCount={totalRows}
                  >
                    <Box sx={{ width: '100%', height: '100%', display: 'block' }} />
                  </GridItem>
                );
              }
              // Render book card
              return (
                <GridItem
                  key={`book-${rowIdx}-${colIdx}`}
                  col={colIdx}
                  row={rowIdx}
                  colCount={totalColumns}
                  rowCount={totalRows}
                >
                  {cell ? (
                    <Link to={`/book/${cell.id}`} style={{ width: '100%', height: '100%', textDecoration: 'none' }}>
                      <CardHoverWrapper>
                        <CardContainer className="MuiCardContainer-hover">
                          <CardInner>
                            <TextSection className="MuiTextSection-hover">
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'inherit',
                                  fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.6rem' },
                                  lineHeight: 1.1,
                                  wordBreak: 'break-word',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <b>{cell.title}</b><br />
                                Author: {cell.author}<br />
                                ISBN: {cell.isbn}<br />
                                Publisher: {cell.publisher}
                              </Typography>
                            </TextSection>
                            <ImageSection>
                              {cell.cover ? (
                                <img
                                  src={cell.cover}
                                  alt={cell.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                              ) : (
                                <PlaceholderImage>
                                  <ArchitecturalDrawing />
                                </PlaceholderImage>
                              )}
                            </ImageSection>
                          </CardInner>
                        </CardContainer>
                      </CardHoverWrapper>
                    </Link>
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'block' }} />
                  )}
                </GridItem>
              );
            })
          )}
        </GridContainer>
      </PageWrapper>
    </ThemeProvider>
  );
};

export default BookshopLanding;