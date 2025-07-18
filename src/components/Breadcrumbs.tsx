import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Pill from './Pill';

interface BreadcrumbsProps {
  bookName: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ bookName }) => (
  <Box sx={{
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
  }}>
    <Pill>
      <span style={{ color: '#d32f2f', fontWeight: 600 }}>Home</span>
      <span style={{ color: '#888', fontWeight: 600, margin: '0 0.5em' }}>&gt;</span>
      <span style={{ color: '#222', fontWeight: 600 }}>{bookName}</span>
    </Pill>
  </Box>
);

export default Breadcrumbs; 