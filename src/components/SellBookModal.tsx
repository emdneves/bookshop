import React, { useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import Pill from './Pill';
import { ARTIFACT_RED, ARTIFACT_RED_DARK, ARTIFACT_RED_TRANSPARENT_10, SHARED_BG, CANCEL_BLACK, CANCEL_BLACK_HOVER } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';

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
    'publication date': '',
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
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFields({ ...fields, coverFile: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAreaClick = () => {
    document.getElementById('cover-upload')?.click();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
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
        'publication date': fields['publication date'],
        ed: fields.ed,
        'Original price': fields['Original price'],
        Description: fields.Description,
        Pages: fields.Pages,
        Language: fields.Language,
        Cover: coverUrl,
      });
      setSuccess('Book listed successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
        setFields({
          name: '', isbn: '', publisher: '', author: '', 'publication date': '', ed: '', 'Original price': '', Description: '', Pages: '', Language: '', Cover: '', coverFile: null
        });
        setImagePreview(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccess(null);
    setFields({
      name: '', isbn: '', publisher: '', author: '', 'publication date': '', ed: '', 'Original price': '', Description: '', Pages: '', Language: '', Cover: '', coverFile: null
    });
    setImagePreview(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: SHARED_BG,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden',
          fontSize: FONT_SIZES.MEDIUM,
          fontWeight: FONT_WEIGHTS.BOLD,
          color: '#222',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Modal Title */}
          <div style={{
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: FONT_SIZES.XLARGE,
            fontWeight: FONT_WEIGHTS.BOLD,
            color: ARTIFACT_RED,
          }}>
            List a Book for Sale
          </div>

          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            minHeight: '400px',
          }}>
            {/* Left Column - Image Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                
                <div
                  onClick={handleImageAreaClick}
                  style={{
                    width: '100%',
                    height: '300px',
                    border: `2px dashed ${ARTIFACT_RED}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Book cover preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: ARTIFACT_RED,
                    }}>
                      <Skeleton
                        variant="rectangular"
                        width="80%"
                        height="80%"
                        sx={{
                          borderRadius: '4px',
                          bgcolor: 'rgba(211, 47, 47, 0.1)',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: ARTIFACT_RED, fontWeight: FONT_WEIGHTS.BOLD }}>
                        Click to upload cover image
                      </Typography>
                    </div>
                  )}
                </div>
                
                {fields.coverFile && (
                  <Pill fullWidth background={ARTIFACT_RED_TRANSPARENT_10} color={ARTIFACT_RED}>
                    {fields.coverFile.name}
                  </Pill>
                )}
              </div>
              
              {/* Cancel Button */}
              <Pill
                fullWidth
                background={CANCEL_BLACK}
                color="white"
                onClick={handleCancel}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { background: CANCEL_BLACK_HOVER },
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </Pill>
            </div>

            {/* Right Column - Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '400px' }}>
                {/* Title - Full Width */}
                <Pill fullWidth hoverBackground="#f9eaea">
                  <input
                    type="text"
                    name="name"
                    placeholder="Title"
                    value={fields.name}
                    onChange={handleChange}
                    required
                    style={pillInputStyle}
                  />
                </Pill>
                
                {/* Author - Full Width */}
                <Pill fullWidth hoverBackground="#f9eaea">
                  <input
                    type="text"
                    name="author"
                    placeholder="Author"
                    value={fields.author}
                    onChange={handleChange}
                    required
                    style={pillInputStyle}
                  />
                </Pill>
                
                {/* ISBN, Published Date, Edition - Three Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="number"
                      name="isbn"
                      placeholder="ISBN"
                      value={fields.isbn}
                      onChange={handleChange}
                      required
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="date"
                      name="publication date"
                      placeholder="Publication Date"
                      value={fields['publication date']}
                      onChange={handleChange}
                      required
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="number"
                      name="ed"
                      placeholder="Edition"
                      value={fields.ed}
                      onChange={handleChange}
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                </div>
                
                {/* Original Price, Pages, Language - Three Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="number"
                      name="Original price"
                      placeholder="Original Price"
                      value={fields['Original price']}
                      onChange={handleChange}
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="number"
                      name="Pages"
                      placeholder="Pages"
                      value={fields.Pages}
                      onChange={handleChange}
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%' }}>
                    <input
                      type="text"
                      name="Language"
                      placeholder="Language"
                      value={fields.Language}
                      onChange={handleChange}
                      style={{ ...pillInputStyle, width: '100%' }}
                    />
                  </Pill>
                </div>
                
                {/* Description - Full Width */}
                <Pill fullWidth hoverBackground="#f9eaea">
                  <textarea
                    name="Description"
                    placeholder="Description"
                    value={fields.Description}
                    onChange={handleChange}
                    style={{ ...pillInputStyle, minHeight: 48, resize: 'vertical', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}
                  />
                </Pill>
              </div>
              
              {/* List Book Button */}
              <Pill
                fullWidth
                background={ARTIFACT_RED}
                color="white"
                onClick={handleSubmit}
                sx={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  '&:hover': { background: ARTIFACT_RED_DARK },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Listing...' : 'List Book'}
              </Pill>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Pill
              fullWidth
              background="#ffebee"
              color="#c62828"
              sx={{ border: '1px solid #ffcdd2', fontWeight: FONT_WEIGHTS.BOLD }}
            >
              {error}
            </Pill>
          )}
          {success && (
            <Pill
              fullWidth
              background="#e8f5e8"
              color="#2e7d32"
              sx={{ border: '1px solid #c8e6c9', fontWeight: FONT_WEIGHTS.BOLD }}
            >
              {success}
            </Pill>
          )}


        </div>
      </div>
    </div>
  );
};

const pillInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'inherit',
  fontWeight: FONT_WEIGHTS.BOLD,
  fontSize: FONT_SIZES.MEDIUM,
  lineHeight: 'inherit',
  textAlign: 'center',
  padding: '8px 0',
};

export default SellBookModal; 