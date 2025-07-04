import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';

const getColumns = (width: number) => {
  if (width < 600) return 1;
  if (width < 900) return 2;
  if (width < 1500) return 4;
  return 5;
};

const ProductBox = ({ background = '#FFFAF0', color, children }: { background?: string; color?: string; children: React.ReactNode }) => (
  <Box
    sx={{
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background,
      color,
      borderRadius: 3,
      maxWidth: '100%',
      maxHeight: '100%',
      margin: 'auto',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </Box>
);

// Shared style for main content boxes (text/info and image)
const mainContentBoxSx = {
  p: 1,
  m: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  zIndex: 1,
};

// Reusable MainCard component
const MainCard = ({ children, gridColumn, gridRow, gridColumnEnd, gridRowEnd, background = '#FFFAF0', color = '#111' }: any) => (
  <Box
    sx={{
      ...mainContentBoxSx,
      gridColumn,
      gridRow,
      ...(gridColumnEnd ? { gridColumnEnd } : {}),
      ...(gridRowEnd ? { gridRowEnd } : {}),
    }}
  >
    <ProductBox background={background} color={color}>
      {children}
    </ProductBox>
  </Box>
);

// Card content renderers
const renderInfoCard = (loading: boolean, book: any) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3, mb: 2 }} />
  ) : (
    <div style={{ width: '100%' }}>
      <strong>Title:</strong> {book.name || '-'}<br />
      <strong>Author:</strong> {book.author || '-'}<br />
      <strong>ISBN:</strong> {book.isbn || '-'}<br />
      <strong>Publisher:</strong> {book.publisher || '-'}<br />
      <strong>Publication date:</strong> {book['publication date'] || '-'}<br />
      <strong>Edition:</strong> {book.ed || '-'}<br />
      <strong>Original price:</strong> {book['Original price'] || '-'}<br />
      <strong>Pages:</strong> {book.Pages || '-'}<br />
      <strong>Language:</strong> {book.Language || '-'}<br />
      <br />
      <strong>Description:</strong><br />
      <span>{book.Description || '-'}</span>
    </div>
  );

const renderImageCard = (loading: boolean, book: any) =>
  loading || !book ? (
    <Skeleton variant="rectangular" width="100%" height="100%"  />
  ) : (
    book.Cover ? (
      <img src={book.Cover} alt={book.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 3 }} />
    ) : (
      <Skeleton variant="rectangular" width="100%" height="100%"  />
    )
  );

// Layout config for breakpoints
const getCardLayout = (columns: number) => {
  if (columns === 2) {
    return [
      {
        type: 'info',
        gridColumn: 2,
        gridRow: 2,
        gridColumnEnd: 'span 2',
        gridRowEnd: 6,
      },
      {
        type: 'image',
        gridColumn: 2,
        gridRow: 6,
        gridColumnEnd: 'span 2',
        gridRowEnd: 10,
      },
    ];
  }
  // columns >= 4
  return [
    {
      type: 'info',
      gridColumn: 2,
      gridRow: 2,
      gridColumnEnd: 'span 2',
      gridRowEnd: 'span 2',
    },
    {
      type: 'image',
      gridColumn: columns,
      gridRow: 2,
      gridColumnEnd: 'span 2',
      gridRowEnd: 'span 2',
    },
  ];
};

const ProductPageLayout: React.FC = () => {
  const { id } = useParams();
  console.log('Book ID from URL:', id);
  const [columns, setColumns] = React.useState(getColumns(window.innerWidth));
  const [loading, setLoading] = React.useState(true);
  const [book, setBook] = React.useState<any>(null);

  React.useEffect(() => {
    const handleResize = () => setColumns(getColumns(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch('http://localhost:3000/content/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('API response:', data);
        if (data.success && data.content && data.content.data) {
          setBook(data.content.data);
          console.log('Book data set:', data.content.data);
        } else {
          setBook(null);
          console.log('Book data set: null');
        }
      })
      .catch((err) => { setBook(null); console.log('API error:', err); })
      .finally(() => setLoading(false));
  }, [id]);

  const mainCol = `calc(100vw / ${columns + 1})`;
  const sCol = `calc(0.5 * 100vw / ${columns + 1})`;
  const colCount = columns + 2;
  const rowCount = columns === 2 ? 8 : 4;

  const getCellBorder = (col: number, row: number): React.CSSProperties => ({
    borderRight: col < colCount - 1 ? '1px dashed #d32f2f' : 'none',
    borderBottom: row < rowCount - 1 ? '1px dashed #d32f2f' : 'none',
    borderLeft: 'none',
    borderTop: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    zIndex: 0,
  });

  // Dynamic grid row count for 2-column breakpoint
  const gridTemplateRows = columns === 2
    ? `repeat(8, 1fr)`
    : `calc(0.5 * ${mainCol}) repeat(2, ${mainCol}) 1fr`;

  // Also log book in render
  console.log('Book in render:', book);

  return (
    <Box
      sx={{
        display: 'grid',
        width: '100vw',
        minHeight: '100vh',
        gridTemplateColumns: `${sCol} repeat(${columns}, ${mainCol}) ${sCol}`,
        gridTemplateRows      }}
    >
      {/* Top border row */}
      <Box style={{ ...getCellBorder(0, 0), gridColumn: 1, gridRow: 1 }} />
      {Array.from({ length: columns }).map((_, i) => (
        <Box key={`top-${i}`} style={{ ...getCellBorder(i + 1, 0), gridColumn: i + 2, gridRow: 1 }} />
      ))}
      <Box style={{ ...getCellBorder(colCount - 1, 0), gridColumn: colCount, gridRow: 1 }} />

      {/* Side and middle rows for 2-column layout */}
      {columns === 2 && Array.from({ length: 6 }).map((_, rowIdx) => (
        <React.Fragment key={rowIdx}>
          <Box style={{ ...getCellBorder(0, rowIdx + 1), gridColumn: 1, gridRow: rowIdx + 2 }} />
          <Box style={{ ...getCellBorder(colCount - 1, rowIdx + 1), gridColumn: colCount, gridRow: rowIdx + 2 }} />
        </React.Fragment>
      ))}
      {/* Side and middle rows for 4/5-column layout */}
      {columns !== 2 && [1, 2].map((rowIdx) => (
        <React.Fragment key={rowIdx}>
          <Box style={{ ...getCellBorder(0, rowIdx), gridColumn: 1, gridRow: rowIdx + 1 }} />
          {Array.from({ length: columns }).map((_, i) => (
            <Box
              key={`mid-${rowIdx}-${i}`}
              style={{
                ...getCellBorder(i + 1, rowIdx),
                gridColumn: i + 2,
                gridRow: rowIdx + 1,
                padding: 8,
              }}
            >
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: '#FFFAF0' }} />
            </Box>
          ))}
          <Box style={{ ...getCellBorder(colCount - 1, rowIdx), gridColumn: colCount, gridRow: rowIdx + 1 }} />
        </React.Fragment>
      ))}

      {/* Bottom border row */}
      <Box style={{ ...getCellBorder(0, rowCount - 1), gridColumn: 1, gridRow: rowCount }} />
      {Array.from({ length: columns }).map((_, i) => (
        <Box key={`bot-${i}`} style={{ ...getCellBorder(i + 1, rowCount - 1), gridColumn: i + 2, gridRow: rowCount }} />
      ))}
      <Box style={{ ...getCellBorder(colCount - 1, rowCount - 1), gridColumn: colCount, gridRow: rowCount }} />

      {/* Bookshop details in the first center column at the top */}
      <Box
        sx={{
          gridColumn: 2,
          gridRow: 1,
          p: 1,
          m: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ProductBox color="#222">
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 22 }}>
            Red Spine Books
          </div>
        </ProductBox>
      </Box>

      {/* Main content cards (info and image) rendered via config */}
      {getCardLayout(columns).map((card, idx) => (
        <MainCard
          key={card.type + idx}
          gridColumn={card.gridColumn}
          gridRow={card.gridRow}
          gridColumnEnd={card.gridColumnEnd}
          gridRowEnd={card.gridRowEnd}
          color="#111"
        >
          {card.type === 'info'
            ? renderInfoCard(loading, book)
            : renderImageCard(loading, book)}
        </MainCard>
      ))}
    </Box>
  );
};

export default ProductPageLayout; 