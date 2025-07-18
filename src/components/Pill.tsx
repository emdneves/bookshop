import React, { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  background?: string;
  fullWidth?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  sx?: SxProps<Theme>;
}

const Pill: React.FC<PillProps> = ({ children, color = '#d32f2f', background = 'transparent', fullWidth = false, onClick, sx }) => {
  const [active, setActive] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setActive(true);
    onClick?.(event);
  };

  return (
    <Box
      sx={{
        display: fullWidth ? 'block' : 'inline-block',
        width: fullWidth ? '100%' : undefined,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        border: active ? `0.5px solid ${color}` : `0.5px dashed ${color}`,
        color,
        background,
        fontWeight: 600,
        fontSize: 'inherit',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '100%',
        minWidth: 0,
        minHeight: '1.2em',
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      title={typeof children === 'string' ? children : undefined}
      onClick={handleClick}
    >
      {children}
    </Box>
  );
};

export default Pill; 