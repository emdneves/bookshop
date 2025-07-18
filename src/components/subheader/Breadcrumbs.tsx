import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Pill from '../Pill';
import { ARTIFACT_RED } from '../../constants/colors';

interface BreadcrumbsProps {
  bookName: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ bookName }) => (
  <Box sx={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  }}>
    <Pill fullWidth sx={{ 
      justifyContent: 'flex-start',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    }}>
      <Box sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
      }}>
        <span style={{ color: ARTIFACT_RED, fontWeight: 600 }}>Home</span>
        <span style={{ color: '#888', fontWeight: 600, margin: '0 0.5em' }}>&gt;</span>
        <span style={{ color: '#222', fontWeight: 600 }}>{bookName}</span>
      </Box>
    </Pill>
  </Box>
);

export default Breadcrumbs; 