import React from 'react';
import { Box, Typography } from '@mui/material';
import PageLayout from '../components/PageLayout';
import SubheaderSearchBar from '../components/SubheaderSearchBar';
import SubheaderFilterButton from '../components/SubheaderFilterButton';
import SEO from '../components/SEO';

const TestLayout: React.FC = () => {
  return (
    <PageLayout
      showSubheader={true}
      subheaderProps={{
        left: <SubheaderSearchBar fullWidth={true} />,
        right: <SubheaderFilterButton fullWidth={true} />,
      }}
    >
      <SEO 
        title="Test Layout - the artifact"
        description="Testing the new layout component with side columns"
        url="https://theartifact.shop/test-layout"
      />
      
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 700, 
            color: '#222', 
            mb: 3,
            textAlign: 'center'
          }}
        >
          Test Layout Page
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#666', 
            mb: 4,
            textAlign: 'center',
            maxWidth: '600px'
          }}
        >
          This page demonstrates the new LayoutTest component with consistent side columns and subheader.
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            width: '100%',
            maxWidth: '800px',
          }}
        >
          <Box
            sx={{
              p: 3,
              border: '0.5px dashed #d32f2f',
              borderRadius: 2,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#d32f2f', mb: 1 }}>
              Side Columns
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Consistent side columns with dashed borders
            </Typography>
          </Box>
          
          <Box
            sx={{
              p: 3,
              border: '0.5px dashed #d32f2f',
              borderRadius: 2,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#d32f2f', mb: 1 }}>
              Subheader
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Search and filter components in subheader
            </Typography>
          </Box>
          
          <Box
            sx={{
              p: 3,
              border: '0.5px dashed #d32f2f',
              borderRadius: 2,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#d32f2f', mb: 1 }}>
              Responsive
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Adapts to different screen sizes
            </Typography>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default TestLayout; 