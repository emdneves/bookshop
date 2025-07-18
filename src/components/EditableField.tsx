import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import Pill from './Pill';

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  disabled?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  placeholder,
  type = 'text',
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setEditValue(String(value));
    }
  };

  const handleSave = () => {
    if (editValue !== String(value)) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <Pill fullWidth>
        <Box
          component="input"
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          sx={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit',
            fontWeight: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            textAlign: 'center',
            '&::placeholder': {
              color: 'inherit',
              opacity: 0.7,
              textAlign: 'center',
            },
          }}
        />
      </Pill>
    );
  }

  return (
    <Pill onClick={handleClick} fullWidth>
      {value || (placeholder ? (
        <Box sx={{ color: 'inherit', opacity: 0.5 }}>
          {placeholder}
        </Box>
      ) : '')}
    </Pill>
  );
};

export default EditableField; 