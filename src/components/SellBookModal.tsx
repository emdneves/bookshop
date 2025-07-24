import React, { useState, useRef } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import Pill from './Pill';
import { ARTIFACT_RED, ARTIFACT_RED_DARK, ARTIFACT_RED_TRANSPARENT_10, SHARED_BG, CANCEL_BLACK, CANCEL_BLACK_HOVER } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';
// Import zxing-js/browser for barcode recognition
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

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
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [isbnInput, setIsbnInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [noCoverFound, setNoCoverFound] = useState(false);

  // Upload image to S3 via backend
  const uploadCoverImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('Cover', file);
    // Book content_type_id
    const contentTypeId = '481a065c-8733-4e97-9adf-dc64acacf5fb';
    const response = await fetch(`/api/content/upload?content_type_id=${contentTypeId}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    if (!data.success || !data.urls || !data.urls[0]?.url) throw new Error('Image upload failed');
    return data.urls[0].url;
  };

  // Prefill handler
  const handlePrefillFromISBN = async () => {
    const isbn = isbnInput.trim();
    if (!isbn) {
      setError('Please enter an ISBN or barcode.');
      return;
    }
    setPrefillLoading(true);
    setError(null);
    setNoCoverFound(false);
    
    // Helper function to try different ISBN formats
    const tryISBNVariants = async (baseISBN: string, apiCall: (isbn: string) => Promise<any>) => {
      const variants = [
        baseISBN,
        baseISBN.replace(/-/g, ''),
        baseISBN.replace(/\s/g, ''),
        baseISBN.length === 10 ? `978${baseISBN.slice(0, -1)}` : baseISBN,
        baseISBN.length === 13 && baseISBN.startsWith('978') ? baseISBN.slice(3, -1) : baseISBN,
      ].filter((variant, index, arr) => arr.indexOf(variant) === index);
      
      for (const variant of variants) {
        try {
          const result = await apiCall(variant);
          if (result) return result;
        } catch (err) {
          console.log(`[ISBN Variant] Failed for ${variant}:`, err);
        }
      }
      return null;
    };
    
    let data = null;
    let bookFound = false;
    let sourceName = '';
    
    // Primary Source: Open Library API
    try {
      const openLibraryCall = async (isbn: string) => {
        const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        if (res.ok) {
          const bookData = await res.json();
          console.log('[OpenLibrary API] Found book:', bookData);
          return {
            title: bookData.title,
            by_statement: bookData.by_statement || '',
            authors: bookData.authors || [],
            publishers: bookData.publishers || [],
            publish_date: bookData.publish_date,
            description: bookData.description,
            number_of_pages: bookData.number_of_pages,
            language: bookData.language,
            languages: bookData.languages || [],
            subjects: bookData.subjects || [],
            edition_name: bookData.edition_name,
            covers: bookData.covers || [],
            source: 'openlibrary'
          };
        }
        return null;
      };
      
      data = await tryISBNVariants(isbn, openLibraryCall);
      if (data) {
        bookFound = true;
        sourceName = 'Open Library';
      }
    } catch (err) {
      console.log('[OpenLibrary API] Failed:', err);
    }
    
    // Fallback Source: Google Books API
    if (!bookFound) {
      try {
        const googleBooksCall = async (isbn: string) => {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
          if (res.ok) {
            const googleData = await res.json();
            if (googleData.items && googleData.items.length > 0) {
              const book = googleData.items[0].volumeInfo;
              console.log('[Google Books API] Found book:', book);
              return {
                title: book.title,
                by_statement: book.authors ? book.authors.join(', ') : '',
                authors: book.authors || [],
                publishers: book.publisher ? [book.publisher] : [],
                publish_date: book.publishedDate,
                description: book.description,
                number_of_pages: book.pageCount,
                language: book.language,
                categories: book.categories || [],
                imageLinks: book.imageLinks,
                source: 'googlebooks'
              };
            }
          }
          return null;
        };
        
        data = await tryISBNVariants(isbn, googleBooksCall);
        if (data) {
          bookFound = true;
          sourceName = 'Google Books';
        }
      } catch (err) {
        console.log('[Google Books API] Failed:', err);
      }
    }
    
    // Only show error if both sources failed
    if (!bookFound) {
      throw new Error(`Book not found for ISBN: ${isbn}. Please check the ISBN or enter book details manually.`);
    }
    
    try {
      // Optionally fetch cover image (always set preview to Open Library cover if available)
      let coverUrl = '';
      let coverFound = false;
      // Try cover by cover ID
      if (data.covers && data.covers.length > 0) {
        coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
        // Test if image exists
        try {
          const resp = await fetch(coverUrl, { method: 'HEAD' });
          if (resp.ok) {
            setImagePreview(coverUrl);
            coverFound = true;
            setNoCoverFound(false);
          }
        } catch {}
      }
      // Fallback: Try cover by ISBN if not found
      if (!coverFound && isbn) {
        const isbnCoverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        try {
          const resp = await fetch(isbnCoverUrl, { method: 'HEAD' });
          if (resp.ok) {
            coverUrl = isbnCoverUrl;
            setImagePreview(coverUrl);
            coverFound = true;
            setNoCoverFound(false);
          }
        } catch {}
      }
      if (!coverFound) {
        coverUrl = '';
        setImagePreview(null);
        setNoCoverFound(true);
      }
      // Use by_statement for author if present, otherwise fetch author names
      let author = data.by_statement || '';
      if (!author && Array.isArray(data.authors) && data.authors.length > 0) {
        try {
          const authorNames = await Promise.all(
            data.authors.map(async (a: any) => {
              if (!a.key) return '';
              const resp = await fetch(`https://openlibrary.org${a.key}.json`);
              if (!resp.ok) return '';
              const authorData = await resp.json();
              return authorData.name || '';
            })
          );
          author = authorNames.filter(Boolean).join(', ');
        } catch {}
      }
      // Use language code
      let language = '';
      if (Array.isArray(data.languages) && data.languages.length > 0) {
        try {
          const langKey = data.languages[0].key; // e.g. '/languages/por'
          language = langKey.split('/').pop() || '';
        } catch {}
      }
      // Subjects as comma-separated string
      let subjects = '';
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        subjects = data.subjects.join(', ');
      }
      setFields(f => ({
        ...f,
        name: data.title || '',
        author: author,
        publisher: Array.isArray(data.publishers) && data.publishers.length > 0 ? data.publishers[0] : '',
        isbn: isbn,
        'publication date': data.publish_date ? new Date(data.publish_date).toISOString().slice(0, 10) : '',
        Description: typeof data.description === 'string' ? data.description : (data.description?.value || ''),
        Cover: coverUrl,
        Pages: data.number_of_pages || '',
        ed: data.edition_name || '',
        Language: language,
        // Optionally fill Description with subjects if Description is empty
        ...(subjects && !(typeof data.description === 'string' ? data.description : (data.description?.value || '')) ? { Description: subjects } : {}),
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch book info');
    } finally {
      setPrefillLoading(false);
    }
  };

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

  // Barcode/ISBN image scan handler (does NOT set cover preview or Cover field)
  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setScanning(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const codeReader = new BrowserMultiFormatReader();
      try {
        const result = await codeReader.decodeFromImage(img);
        if (result && result.getText()) {
          setIsbnInput(result.getText());
          // handlePrefillFromISBN will be triggered by useEffect below
        } else {
          setError('No barcode or ISBN found in the image.');
          setScanning(false);
        }
      } catch (err) {
        if (err instanceof NotFoundException) {
          setError('No barcode or ISBN found in the image.');
        } else {
          setError('Failed to recognize barcode/ISBN in the image.');
        }
        setScanning(false);
      }
    } catch (err: any) {
      setError('Failed to recognize barcode/ISBN in the image.');
      setScanning(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dedicated cover upload handler (this is the only place user-uploaded cover sets the preview)
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFields(f => ({ ...f, coverFile: file }));
      // Create preview URL for user-uploaded cover
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-prefill when isbnInput is set by scanning
  React.useEffect(() => {
    if (scanning && isbnInput) {
      handlePrefillFromISBN();
      setScanning(false);
    }
  }, [isbnInput, scanning]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // If a cover file is provided, upload it and get the URL
      let coverUrl = fields.Cover;
      // Only upload the image if the user uploaded a file (coverFile)
      if (fields.coverFile) {
        coverUrl = await uploadCoverImage(fields.coverFile);
      }
      // Submit the book with the correct Cover URL
      await onSubmit({
        ...fields,
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
          {/* ISBN/Barcode input and Prefill button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Pill fullWidth hoverBackground="#f9eaea">
              <input
                type="text"
                name="isbnInput"
                placeholder="ISBN or Barcode"
                value={isbnInput}
                onChange={e => setIsbnInput(e.target.value)}
                style={{ ...pillInputStyle, flex: 1 }}
              />
            </Pill>
            {/* Hidden file input for image upload */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageInputChange}
            />
            <Pill
              background={ARTIFACT_RED_TRANSPARENT_10}
              color={ARTIFACT_RED}
              sx={{
                border: '1px solid ' + ARTIFACT_RED,
                borderRadius: 6,
                padding: '6px 12px',
                fontWeight: FONT_WEIGHTS.BOLD,
                fontSize: FONT_SIZES.MEDIUM,
                cursor: scanning ? 'not-allowed' : 'pointer',
                opacity: scanning ? 0.7 : 1,
                minWidth: 120,
                textAlign: 'center',
              }}
              onClick={scanning ? undefined : () => fileInputRef.current?.click()}
            >
              {scanning ? 'Scanning...' : 'Scan Image'}
            </Pill>
            <Pill
              background={ARTIFACT_RED}
              color="white"
              sx={{
                borderRadius: 6,
                padding: '6px 16px',
                fontWeight: FONT_WEIGHTS.BOLD,
                fontSize: FONT_SIZES.MEDIUM,
                cursor: prefillLoading ? 'not-allowed' : 'pointer',
                opacity: prefillLoading ? 0.7 : 1,
                minWidth: 120,
                textAlign: 'center',
              }}
              onClick={prefillLoading ? undefined : handlePrefillFromISBN}
            >
              {prefillLoading ? 'Prefilling...' : 'Prefill'}
            </Pill>
          </div>
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
                  onChange={handleCoverFileChange}
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
                  minWidth: 120,
                  textAlign: 'center',
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
                {/* Publisher - Full Width */}
                <Pill fullWidth hoverBackground="#f9eaea">
                  <input
                    type="text"
                    name="publisher"
                    placeholder="Publisher"
                    value={fields.publisher}
                    onChange={handleChange}
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
                onClick={loading ? undefined : handleSubmit}
                sx={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  '&:hover': { background: ARTIFACT_RED_DARK },
                  transition: 'all 0.2s ease',
                  minWidth: 120,
                  textAlign: 'center',
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