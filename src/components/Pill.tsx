import React, { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { 
  ARTIFACT_RED, 
  ARTIFACT_RED_TRANSPARENT_10, 
  ARTIFACT_RED_TRANSPARENT_05,
  getBorderStyle,
  getHoverBorderStyle 
} from '../constants/colors';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  background?: string;
  fullWidth?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  sx?: SxProps<Theme>;
}

const Pill: React.FC<PillProps> = ({ children, color = ARTIFACT_RED, background = 'transparent', fullWidth = false, onClick, sx }) => {
  const [active, setActive] = useState(false);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: '16px',
        background,
        color,
        border: active ? `0.5px solid ${color}` : getBorderStyle().replace(ARTIFACT_RED, color),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        minHeight: '1.2em',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        ...(fullWidth && { width: '100%' }),
        ...sx,
        '&:hover': onClick ? {
          background: active ? ARTIFACT_RED_TRANSPARENT_10 : ARTIFACT_RED_TRANSPARENT_05,
          border: getHoverBorderStyle().replace(ARTIFACT_RED, color),
        } : {},
      }}
    >
      {children}
    </Box>
  );
};

export default Pill; 