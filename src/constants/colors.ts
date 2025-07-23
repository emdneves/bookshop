// Shared background color for header, footer, subheader, and global
export const SHARED_BG = 'rgba(250,250,250,0.75)';

// Red color used throughout the application
export const ARTIFACT_RED = '#8B0000';

// Variations of ARTIFACT_RED for different use cases
export const ARTIFACT_RED_LIGHT = '#B22222'; // Lighter version for hover states
export const ARTIFACT_RED_LIGHTER = '#DC143C'; // Even lighter for subtle effects
export const ARTIFACT_RED_TRANSPARENT_10 = 'rgba(139, 0, 0, 0.1)'; // 10% opacity
export const ARTIFACT_RED_TRANSPARENT_05 = 'rgba(139, 0, 0, 0.05)'; // 5% opacity
export const ARTIFACT_RED_TRANSPARENT_08 = 'rgba(139, 0, 0, 0.08)'; // 8% opacity
export const ARTIFACT_RED_TRANSPARENT_04 = 'rgba(139, 0, 0, 0.04)'; // 4% opacity
export const ARTIFACT_RED_TRANSPARENT_03 = 'rgba(139, 0, 0, 0.03)'; // 3% opacity
export const ARTIFACT_RED_DARK = '#660000'; // Darker version for hover states
export const ARTIFACT_RED_DARKER = '#4A0000'; // Even darker for active states

// Cancel button colors for modals
export const CANCEL_BLACK = '#333333'; // Dark gray/black for cancel buttons
export const CANCEL_BLACK_HOVER = '#222222'; // Darker version for hover states

// Line types based on breakpoints
// For 1-2 columns (mobile/tablet): solid lines
// For 3+ columns (desktop): dashed lines
import { getCardsPerRow } from '../utils/helpers';

export const getLineStyle = () => {
  const cardsPerRow = getCardsPerRow();
  const isSmallBreakpoint = cardsPerRow <= 2;
  return {
    border: isSmallBreakpoint ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`,
    borderTop: isSmallBreakpoint ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`,
    borderBottom: isSmallBreakpoint ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`,
    borderLeft: isSmallBreakpoint ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`,
    borderRight: isSmallBreakpoint ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`,
  };
};

// Main border style function - use this for all borders
export const getBorderStyle = () => {
  const cardsPerRow = getCardsPerRow();
  return cardsPerRow <= 2 ? `0.5px solid ${ARTIFACT_RED}` : `0.5px dashed ${ARTIFACT_RED}`;
};

// Hover border style function
// Large breakpoints (3+ columns): make line continuous (solid)
// Small breakpoints (1-2 columns): double the width
export const getHoverBorderStyle = () => {
  const cardsPerRow = getCardsPerRow();
  if (cardsPerRow <= 2) {
    // Small breakpoints: double the width (1px instead of 0.5px)
    return `1px solid ${ARTIFACT_RED}`;
  } else {
    // Large breakpoints: make continuous (solid instead of dashed)
    return `0.5px solid ${ARTIFACT_RED}`;
  }
}; 