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
      maxWidth: '100%',
      minWidth: 0,
    }}>
      <Box sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{ color: ARTIFACT_RED, fontWeight: 600, flexShrink: 0 }}>Home</span>
        <span style={{ color: '#888', fontWeight: 600, margin: '0 0.5em', flexShrink: 0 }}>&gt;</span>
        <span style={{ 
          color: '#222', 
          fontWeight: 600, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          minWidth: 0,
          flex: 1,
          maxWidth: '100%',
        }}>{bookName}</span>
      </Box>
    </Pill>
  </Box>
);

export default Breadcrumbs; 