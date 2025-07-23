import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, Stack } from '@mui/material';
// Try to import DatePicker, fallback to text input if not available
let DatePickerComponent: any = null;
try {
  // @ts-ignore
  DatePickerComponent = require('@mui/x-date-pickers/DatePicker').DatePicker;
} catch {
  DatePickerComponent = null;
}

interface SellBookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (book: Record<string, any>) => Promise<void>;
}

const SellBookModal: React.FC<SellBookModalProps> = ({ open, onClose, onSubmit }) => {
  const [fields, setFields] = useState({
    name: '',
    isbn: '',
    publisher: '',
    author: '',
    'publication date': null as Date | null,
    ed: '',
    'Original price': '',
    Description: '',
    Pages: '',
    Language: '',
    Cover: '',
    coverFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    setFields({ ...fields, 'publication date': date });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFields({ ...fields, coverFile: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // If a cover file is provided, upload it and get the URL
      let coverUrl = fields.Cover;
      if (fields.coverFile) {
        // Assume uploadAndProcessImage is globally available or imported
        const result = await (window as any).uploadAndProcessImage(
          fields.coverFile,
          'Cover',
          '481a065c-8733-4e97-9adf-dc64acacf5fb',
          'book',
          fields.name
        );
        coverUrl = result.url;
      }
      await onSubmit({
        name: fields.name,
        isbn: fields.isbn,
        publisher: fields.publisher,
        author: fields.author,
        'publication date': fields['publication date'] ? (fields['publication date'] as Date).toISOString() : '',
        ed: fields.ed,
        'Original price': fields['Original price'],
        Description: fields.Description,
        Pages: fields.Pages,
        Language: fields.Language,
        Cover: coverUrl,
      });
      onClose();
      setFields({
        name: '', isbn: '', publisher: '', author: '', 'publication date': null, ed: '', 'Original price': '', Description: '', Pages: '', Language: '', Cover: '', coverFile: null
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sell a Book</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" name="name" value={fields.name} onChange={handleChange} required fullWidth />
          <TextField label="ISBN" name="isbn" value={fields.isbn} onChange={handleChange} required fullWidth type="number" />
          <TextField label="Publisher" name="publisher" value={fields.publisher} onChange={handleChange} required fullWidth />
          <TextField label="Author" name="author" value={fields.author} onChange={handleChange} required fullWidth />
          {/* Publication Date */}
          {DatePickerComponent ? (
            <DatePickerComponent
              label="Publication Date"
              value={fields['publication date']}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          ) : (
            <TextField
              label="Publication Date (yyyy-mm-dd)"
              name="publication date"
              value={fields['publication date'] || ''}
              onChange={handleChange}
              fullWidth
              required
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          <TextField label="Edition (ed)" name="ed" value={fields.ed} onChange={handleChange} fullWidth type="number" />
          <TextField label="Original Price" name="Original price" value={fields['Original price']} onChange={handleChange} fullWidth type="number" />
          <TextField label="Description" name="Description" value={fields.Description} onChange={handleChange} fullWidth multiline rows={2} />
          <TextField label="Pages" name="Pages" value={fields.Pages} onChange={handleChange} fullWidth type="number" />
          <TextField label="Language" name="Language" value={fields.Language} onChange={handleChange} fullWidth />
          <Box>
            <Button variant="outlined" component="label">
              {fields.coverFile ? 'Change Cover Image' : 'Upload Cover Image'}
              <input type="file" accept="image/*" hidden onChange={handleFileChange} />
            </Button>
            {fields.coverFile && (
              <Typography variant="caption" sx={{ ml: 2 }}>{fields.coverFile.name}</Typography>
            )}
          </Box>
        </Stack>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{loading ? 'Selling...' : 'Sell'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellBookModal; 