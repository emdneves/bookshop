import React, { useState, useRef, useEffect } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { createPortal } from 'react-dom';
import { ARTIFACT_RED, ARTIFACT_RED_TRANSPARENT_05 } from '../constants/colors';
import { FONT_SIZES } from '../constants/typography';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  trigger, 
  options, 
  onSelect, 
  sx = {}, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTriggerClick = (event: React.MouseEvent) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
    if (!isOpen) setFocusedIndex(0); // Focus first option when opening
  };

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % options.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleOptionClick(options[focusedIndex].value);
        }
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, options]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRefs.current[focusedIndex]) {
      optionsRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  return (
    <>
      <Box
        ref={triggerRef}
        onClick={handleTriggerClick}
        sx={{
          display: 'inline-block',
          cursor: disabled ? 'default' : 'pointer',
          ...sx
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
            setIsOpen(true);
            setFocusedIndex(0);
          }
        }}
      >
        {trigger}
      </Box>

      {isOpen && createPortal(
        <Box
          sx={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            background: 'white',
            border: `1px solid ${ARTIFACT_RED}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 99999,
            overflow: 'hidden',
          }}
        >
          {options.map((option, idx) => (
            <Box
              key={option.value}
              ref={el => { optionsRefs.current[idx] = el as HTMLDivElement | null; }}
              onClick={() => handleOptionClick(option.value)}
              sx={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: FONT_SIZES.SMALL,
                borderBottom: `1px solid ${ARTIFACT_RED_TRANSPARENT_05}`,
                background: focusedIndex === idx ? ARTIFACT_RED_TRANSPARENT_05 : 'white',
                fontWeight: focusedIndex === idx ? 700 : 400,
                '&:hover': {
                  background: ARTIFACT_RED_TRANSPARENT_05,
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
              tabIndex={-1}
            >
              {option.label}
            </Box>
          ))}
        </Box>,
        document.body
      )}
    </>
  );
};

export default Dropdown; 