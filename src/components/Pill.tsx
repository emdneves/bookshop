import React, { useState, useRef, useEffect } from 'react';
import { Box, SxProps, Theme, useTheme, useMediaQuery } from '@mui/material';
import { 
  ARTIFACT_RED, 
  ARTIFACT_RED_TRANSPARENT_10, 
  ARTIFACT_RED_TRANSPARENT_05,
  getBorderStyle,
  getHoverBorderStyle 
} from '../constants/colors';
import { FONT_SIZES } from '../constants/typography';

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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  // Check if this pill contains an input element
  const hasInput = React.Children.toArray(children).some(child => 
    React.isValidElement(child) && 
    (child.type === 'input' || child.props?.component === 'input')
  );

  // Handle focus events on input elements
  useEffect(() => {
    if (!hasInput || !pillRef.current) return;

    const handleFocusIn = (e: FocusEvent) => {
      if (pillRef.current?.contains(e.target as Node)) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (pillRef.current?.contains(e.target as Node)) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [hasInput]);

  // Extract width-related properties from sx
  const widthSx = sx && typeof sx === 'object' && !Array.isArray(sx) ? {
    width: (sx as any).width,
    minWidth: (sx as any).minWidth,
    maxWidth: (sx as any).maxWidth,
  } : {};

  // Determine border style based on state and breakpoint
  const getBorderStyleForState = () => {
    if (isInputFocused) {
      if (isLargeScreen) {
        // Large breakpoints: continuous border
        return `1px solid ${color}`;
      } else {
        // Small breakpoints: double weight border
        return `2px solid ${color}`;
      }
    }
    
    if (active) {
      return `0.5px solid ${color}`;
    }
    
    return getBorderStyle().replace(ARTIFACT_RED, color);
  };

  return (
    <Box
      ref={pillRef}
      onClick={onClick}
      sx={{
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px', // Fixed height
        padding: '4px 12px', // Fixed padding
        borderRadius: '16px',
        background,
        color,
        border: getBorderStyleForState(),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        fontSize: FONT_SIZES.MEDIUM, // Fixed font size
        fontWeight: 'inherit',
        boxSizing: 'border-box',
        ...(fullWidth && { width: '100%' }),
        // Only allow width-related sx overrides
        ...widthSx,
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