import React, { useState } from 'react';
import { Box } from '@mui/material';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  background?: string;
  fullWidth?: boolean;
}

const Pill: React.FC<PillProps> = ({ children, color = '#d32f2f', background = 'transparent', fullWidth = false }) => {
  const [active, setActive] = useState(false);

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
        fontSize: '0.98em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '100%',
        minWidth: 0,
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      title={typeof children === 'string' ? children : undefined}
      onClick={() => setActive(true)}
    >
      {children}
    </Box>
  );
};

export default Pill; 