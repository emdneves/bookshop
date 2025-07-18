import React, { useState } from 'react';
import { Box } from '@mui/material';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  background?: string;
}

const Pill: React.FC<PillProps> = ({ children, color = '#d32f2f', background = 'transparent' }) => {
  const [active, setActive] = useState(false);

  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        border: active ? `1px solid ${color}` : `1.5px dashed ${color}`,
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
        width: active ? '100%' : undefined,
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