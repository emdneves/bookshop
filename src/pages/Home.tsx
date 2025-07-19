import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  styled,
  Button
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { API_BASE_URL } from '../config/api';
import SEO from '../utils/seo';
import Subheader from '../components/subheader/Subheader';
import SearchBar from '../components/subheader/SearchBar';
import FilterButton from '../components/subheader/FilterButton';
import { getCardsPerRow, getTotalColumns } from '../utils/helpers';
import { ARTIFACT_RED, getBorderStyle, getHoverBorderStyle } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';

// Remove the old BookCard interface and replace with a new one for API data
interface BookCard {
  id: string;
  title: string;
  author: string;
  isbn: string | number;
  cover: string;
  publisher?: string;
  originalPrice?: number;
  description?: string;
  highestOffer?: number;
}

interface Order {
  id: string;
  content_type_id: string;
  data: {
    book: string;
    price: number;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
    body2: {
      fontSize: FONT_SIZES.MEDIUM,
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
const PageWrapper = styled(Box)<{cardsPerRow: number}>(({ theme, cardsPerRow }) => ({
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : '1fr 5fr 1fr',
  gridTemplateRows: '0.5fr auto', // top row is half height, rest is auto (will be set in GridContainer)
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : '1fr 4fr 1fr',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : '1fr 3fr 1fr',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : '1fr 2fr 1fr',
  },
}));

// Update GridContainer to start at gridRow 2 so cards start after the empty top row
const GridContainer = styled(Box)<{cardsPerRow: number}>(({ cardsPerRow }) => ({
  gridColumn: '1 / -1',
  gridRow: 2,
  display: 'grid',
  gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
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
}>(({ col, row, colCount, rowCount, theme }) => ({
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
  background: 'none',
  borderRight: col < colCount - 1 ? `1px dashed ${ARTIFACT_RED}` : 'none',
  borderBottom: row < rowCount - 1 ? `1px dashed ${ARTIFACT_RED}` : 'none',
  padding: '8px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  [theme.breakpoints.down('sm')]: {
    borderRight: col < colCount - 1 ? `0.5px solid ${ARTIFACT_RED}` : 'none',
    borderBottom: row < rowCount - 1 ? `0.5px solid ${ARTIFACT_RED}` : 'none',
  },
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
    border: getHoverBorderStyle(),
  },
  '&:hover .MuiTextSection-hover': {
    color: ARTIFACT_RED,
  },
});

// Card container is a perfect square, fills the padded area, and uses flex column
const CardContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  borderRadius: 4, // Slightly rounded corners
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  border: '0.5px solid transparent', // No border by default
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
  padding: '0 4px 24px 4px', // Increased bottom padding from 12px to 20px for more space
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



interface HomeProps {}

// Subheader slot components for Home
const HomeSubheaderLeft = ({ fullWidth }: { fullWidth?: boolean }) => (
          <SearchBar fullWidth={fullWidth} />
);

const HomeSubheaderRight = ({ fullWidth }: { fullWidth?: boolean }) => (
          <FilterButton fullWidth={fullWidth} />
);

const Home: React.FC<HomeProps> = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [bookCards, setBookCards] = useState<BookCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());
  const { searchTerm } = useSearch();
  const totalColumns = cardsPerRow + 2;
  const mainRows = Math.ceil(bookCards.length / cardsPerRow);
  const totalRows = mainRows + 2; // +2 for top and bottom half-height rows

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/content/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type_id: 'cec824c6-1e37-4b1f-8cf6-b69cd39e52b2',
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      if (!data.success) throw new Error('API returned error');
      setOrders(data.contents || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  };

  // Calculate highest offer for a book
  const getHighestOffer = (bookId: string): number => {
    const bookOrders = orders.filter(order => order.data.book === bookId);
    if (bookOrders.length === 0) return 0;
    return Math.max(...bookOrders.map(order => order.data.price));
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/content/list`, {
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
          originalPrice: item.data['Original price'],
          description: item.data.Description,
          highestOffer: getHighestOffer(item.id),
        }));
        cards = cards.sort((a, b) => (a.publisher || '').localeCompare(b.publisher || '', undefined, { sensitivity: 'base' }));
        setBookCards(cards);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    const initializeData = async () => {
      await fetchOrders();
      await fetchBooks();
    };
    
    initializeData();
    
    // Responsive columns
    const handleResize = () => setCardsPerRow(getCardsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // ✅ Only run once on mount

  // Update book cards when orders change (without causing infinite loops)
  useEffect(() => {
    if (orders.length > 0) {
      setBookCards(prevCards => 
        prevCards.map(card => ({
          ...card,
          highestOffer: getHighestOffer(card.id),
        }))
      );
    }
  }, [orders]);

  // Filter books based on search term
  const filteredBooks = bookCards.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(book.isbn).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const allCards = [...filteredBooks]; // Only books in main area

  // Build a 2D array for the grid: [row][col]
  const grid: (BookCard | null)[][] = [];
  // Remove the first row: all null (empty, half-height)
  // const topRow: (BookCard | null)[] = Array(totalColumns).fill(null);
  // if (totalColumns > 2) {
  //   topRow[1] = infoCard;
  // }
  // grid.push(topRow);
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
  // Remove the last row: all null (empty, half-height)
  // grid.push(Array(totalColumns).fill(null));

  return (
    <>
      <SEO 
        title="the artifact - Buy and Sell Books Online | Modern Book Marketplace"
        description="Discover, buy, and sell books in our modern marketplace. Connect with book lovers, find rare editions, and build your personal library. Join thousands of readers and sellers today."
        keywords="books, the artifact, buy books, sell books, online bookstore, rare books, used books, book marketplace, reading, literature"
        url="https://theartifact.shop"
        type="website"
      />
      {/* Export subheader slot elements for use in App.tsx */}
      {/* This is a placeholder for the actual Subheader component */}
      <PageWrapper cardsPerRow={cardsPerRow}
      sx={{
        gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
        gridTemplateRows: `repeat(${mainRows}, 1fr)`,
      }}
    >
          <GridContainer cardsPerRow={cardsPerRow} sx={{
            gridColumn: '1 / -1',
            gridRow: '1 / -1',
            display: 'grid',
            gridTemplateColumns: cardsPerRow === 1 ? '0.125fr 0.75fr 0.125fr' : `0.5fr repeat(${cardsPerRow}, 1fr) 0.5fr`,
            gridTemplateRows: `repeat(${mainRows}, 1fr)`,
            gap: 0,
            background: 'none',
            gridAutoRows: '1fr',
            paddingTop: 0,
            paddingBottom: 0,
          }}>
            {grid.map((rowArr, rowIdx) =>
              rowArr.map((cell, colIdx) => {
                // Only render cards in center area (not in first/last col)
                if (
                  colIdx === 0 || colIdx === totalColumns - 1
                ) {
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
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateRows: 'auto auto auto auto',
                                    gridTemplateColumns: '1fr 1fr',
                                    rowGap: 4,
                                    columnGap: 4,
                                    width: '100%',
                                    padding: 0,
                                  }}
                                >
                                  {/* Title: row 1, spans 2 columns, left-aligned */}
                                  <span
                                    style={{
                                      gridColumn: '1 / span 2',
                                      fontWeight: FONT_WEIGHTS.BOLD,
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.10,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      color: '#222',
                                      padding: 0,
                                      textAlign: 'left',
                                    }}
                                    title={String(cell.title)}
                                  >
                                    {cell.title}
                                  </span>
                                  {/* Author: row 2, spans 2 columns, left-aligned */}
                                  <span
                                    style={{
                                      gridColumn: '1 / span 2',
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.10,
                                      color: '#444',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      padding: 0,
                                      textAlign: 'left',
                                    }}
                                    title={cell.author}
                                  >
                                    {cell.author}
                                  </span>
                                  {/* ISBN (left) and Original price (right): row 3 */}
                                  <span
                                    style={{
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.10,
                                      color: '#444',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      padding: 0,
                                      textAlign: 'left',
                                    }}
                                    title={String(cell.isbn)}
                                  >
                                    ISBN: {cell.isbn}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.10,
                                      color: cell.highestOffer && cell.highestOffer > 0 ? '#888' : '#444',
                                      textDecoration: cell.highestOffer && cell.highestOffer > 0 ? 'line-through' : 'none',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      padding: 0,
                                      textAlign: 'right',
                                    }}
                                  >
                                    Original: {cell.originalPrice ? `€${cell.originalPrice}` : '-'}
                                    </span>
                                  {/* Publisher (left) and Highest offer (right): row 4 */}
                                  <span
                                    style={{
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.10,
                                      color: '#444',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      padding: 0,
                                      textAlign: 'left',
                                    }}
                                    title={String(cell.publisher)}
                                  >
                                    {cell.publisher}
                                    </span>
                                  <span
                                    style={{
                                      fontSize: FONT_SIZES.SMALL,
                                      lineHeight: 1.1,
                                      color: cell.highestOffer && cell.highestOffer > 0 ? ARTIFACT_RED : '#666',
                                      fontWeight: cell.highestOffer && cell.highestOffer > 0 ? 700 : 400,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      padding: 0,
                                      textAlign: 'right',
                                    }}
                                  >
                                    {cell.highestOffer && cell.highestOffer > 0 ? `Highest: €${cell.highestOffer}` : 'No offers yet'}
                                    </span>
                                </div>
                              </TextSection>
                              <ImageSection>
                                {cell.cover ? (
                                  <img
                                    src={cell.cover}
                                    alt={cell.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                  />
                                ) : (
                                  <PlaceholderImage />
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
    </>
  );
};

export { HomeSubheaderLeft, HomeSubheaderRight };
export default Home;