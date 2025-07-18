import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { ARTIFACT_RED } from '../constants/colors';

interface CenteredMessageProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  showSpinner?: boolean;
  color?: string;
}

const CenteredMessage: React.FC<CenteredMessageProps> = ({
  icon = <WarningIcon sx={{ fontSize: 48, color: ARTIFACT_RED, mb: 2 }} />,
  title,
  description,
  showSpinner = false,
  color = ARTIFACT_RED,
}) => (
  <Box
    sx={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 2,
      px: 2,
    }}
  >
    {icon}
    <Typography variant="h5" sx={{ fontWeight: 700, color, mb: 1 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body1" sx={{ color: '#444', mb: 2 }}>
        {description}
      </Typography>
    )}
    {showSpinner && <CircularProgress color="inherit" sx={{ mt: 2 }} />}
  </Box>
);

export default CenteredMessage; 