import React, { useState, useRef } from 'react';
import Pill from './Pill';
import { ARTIFACT_RED, ARTIFACT_RED_DARK, ARTIFACT_RED_TRANSPARENT_10, ARTIFACT_RED_TRANSPARENT_05, CANCEL_BLACK, CANCEL_BLACK_HOVER, getBorderStyle, getHoverBorderStyle } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useBookData } from '../hooks/useBookData';
import { useBookCoverImage } from '../hooks/useBookCoverImage';

interface SellBookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (book: Record<string, any>) => Promise<void>;
}

const SellBookModal: React.FC<SellBookModalProps> = ({ open, onClose, onSubmit }) => {
  const [fields, setFields] = useState({
    name: '', isbn: '', publisher: '', author: '', 'publication date': '', 
    ed: '', 'Original price': '', 'Price source': '', Description: '', Pages: '', Language: '', 
    Cover: '', coverFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isbnInput, setIsbnInput] = useState('');
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Custom hooks
  const { bookData, isLoading: prefillLoading, error, fetchBookData, reset: resetBookData } = useBookData();
  const { imageUrl: imagePreview, isSearching: imageSearching, noCoverFound, searchForCover, reset: resetCoverImage } = useBookCoverImage();

  // Upload cover image
  const uploadCoverImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('Cover', file);
    const contentTypeId = '481a065c-8733-4e97-9adf-dc64acacf5fb';
    const response = await fetch(`/api/content/upload?content_type_id=${contentTypeId}`, {
      method: 'POST', body: formData,
    });
    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    if (!data.success || !data.urls?.[0]?.url) throw new Error('Image upload failed');
    return data.urls[0].url;
  };

  // Prefill book data
  const handlePrefillFromISBN = async () => {
    const isbn = isbnInput.trim();
    if (!isbn) return;
    
    try {
      await Promise.all([fetchBookData(isbn), searchForCover(isbn)]);
    } catch (err) {
      // Error handling done by hooks
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  // Handle cover file upload
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFields({ ...fields, coverFile: e.target.files[0] });
      resetCoverImage();
    }
  };

  // Handle barcode scanning
  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setScanning(true);
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
      const result = await codeReader.decodeFromImage(img);
      
      if (result?.getText()) {
        const scannedText = result.getText();
        setIsbnInput(scannedText);
      }
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        // Handle other errors if needed
      }
    } finally {
      setScanning(false);
      // Reset file input to allow same file to be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Auto-prefill when ISBN is set by scanning
  React.useEffect(() => {
    if (isbnInput && !scanning) {
      handlePrefillFromISBN();
    }
  }, [isbnInput, scanning]);

  // Update form fields and show feedback when book data changes
  React.useEffect(() => {
    if (bookData) {
      setFields(prev => ({ ...prev, ...bookData }));
      
      // Create feedback message
      const found = [];
      const missing = [];
      
      if (bookData.name) found.push('Title');
      if (bookData.author) found.push('Author');
      if (bookData.publisher) found.push('Publisher/Editor');
      if (bookData['Original price'] && bookData['Original price'].trim() !== '') {
        found.push(`Price (${bookData['Price source'] || 'Unknown source'})`);
      }
      if (bookData.ed) found.push('Edition');
      if (bookData.Language) found.push('Language');
      if (bookData.Pages) found.push('Page count');
      if (bookData.Description) found.push('Description');
      
      if (!bookData.publisher) missing.push('Publisher/Editor');
      if (!bookData['Original price'] || bookData['Original price'].trim() === '') missing.push('Price');
      if (!bookData.ed) missing.push('Edition');
      if (!bookData.Language) missing.push('Language');
      if (!bookData.Pages) missing.push('Page count');
      
      let message = '';
      if (found.length > 0) message += `✅ Found: ${found.join(', ')}`;
      if (missing.length > 0) {
        if (message) message += '\n';
        message += `⚠️ Missing: ${missing.join(', ')}`;
      }
      
      setFeedbackMessage(message);
      setShowFeedbackPopup(true);
      setTimeout(() => {
        setShowFeedbackPopup(false);
        setFeedbackMessage('');
      }, 3000);
    }
  }, [bookData]);

  // Submit form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let coverUrl = '';
      if (fields.coverFile) {
        coverUrl = await uploadCoverImage(fields.coverFile);
      }

      const bookData = { ...fields, Cover: coverUrl || imagePreview || '' };
      await onSubmit(bookData);
      setSuccess('Book listed successfully!');
      setTimeout(() => handleCancel(), 1200);
    } catch (err: any) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Reset and close modal
  const handleCancel = () => {
    setFields({
      name: '', isbn: '', publisher: '', author: '', 'publication date': '', 
      ed: '', 'Original price': '', 'Price source': '', Description: '', Pages: '', Language: '', 
      Cover: '', coverFile: null
    });
    setSuccess(null);
    setShowFeedbackPopup(false);
    setFeedbackMessage('');
    resetCoverImage();
    resetBookData();
    setIsbnInput('');
    setActiveTab(0);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      {/* Modal Overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }} onClick={onClose}>
        
        {/* Modal Content */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '24px',
          maxWidth: '800px', width: '90%', maxHeight: '95vh', overflow: 'hidden',
          position: 'relative', display: 'flex', flexDirection: 'column',
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
            <h2 style={{ fontWeight: FONT_WEIGHTS.BOLD, color: ARTIFACT_RED, margin: 0 }}>
              List a Book for Sale
            </h2>
          </div>

          {/* Quick Fill Section */}
          <div style={{
            background: 'rgba(211, 47, 47, 0.05)', border: `1px solid ${ARTIFACT_RED_TRANSPARENT_10}`,
            borderRadius: '8px', padding: '16px', marginBottom: '24px', flexShrink: 0,
          }}>
            <div style={{
              fontSize: FONT_SIZES.MEDIUM, fontWeight: FONT_WEIGHTS.BOLD, color: ARTIFACT_RED,
              marginBottom: '12px', textAlign: 'center',
            }}>
              Quick Fill - Enter ISBN or Scan Barcode
            </div>
            
            {/* Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: FONT_SIZES.SMALL, color: activeTab === 0 ? ARTIFACT_RED : '#666', fontWeight: activeTab === 0 ? FONT_WEIGHTS.BOLD : FONT_WEIGHTS.NORMAL }}>
                scan image
              </span>
              <div onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)} style={{
                width: '48px', height: '24px', backgroundColor: activeTab === 1 ? ARTIFACT_RED : '#ccc',
                borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s ease',
                border: `1px solid ${activeTab === 1 ? ARTIFACT_RED : '#999'}`,
              }}>
                <div style={{
                  width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
                  position: 'absolute', top: '2px', left: activeTab === 0 ? '2px' : '26px',
                  transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: FONT_SIZES.SMALL, color: activeTab === 1 ? ARTIFACT_RED : '#666', fontWeight: activeTab === 1 ? FONT_WEIGHTS.BOLD : FONT_WEIGHTS.NORMAL }}>
                manual entry
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {activeTab === 0 ? (
                <Pill sx={{ width: '50%', textAlign: 'center', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.7 : 1, '&:hover': { background: ARTIFACT_RED_TRANSPARENT_10 }, transition: 'all 0.2s ease' }} background="transparent" color={ARTIFACT_RED} onClick={scanning ? undefined : () => fileInputRef.current?.click()}>
                  {scanning ? 'scanning...' : 'upload image to scan'}
                </Pill>
              ) : (
                <Pill sx={{ width: '50%', textAlign: 'center' }} fullWidth>
                  <input type="text" name="isbnInput" placeholder="enter ISBN or barcode" value={isbnInput} onChange={e => setIsbnInput(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontWeight: FONT_WEIGHTS.BOLD, fontSize: FONT_SIZES.MEDIUM, lineHeight: 'inherit', textAlign: 'center' }} />
                </Pill>
              )}
              
              <Pill sx={{ width: '50%', textAlign: 'center', cursor: prefillLoading ? 'not-allowed' : 'pointer', opacity: prefillLoading ? 0.7 : 1, '&:hover': { background: ARTIFACT_RED_DARK }, transition: 'all 0.2s ease' }} background={ARTIFACT_RED} color="white" onClick={prefillLoading ? undefined : handlePrefillFromISBN}>
                {prefillLoading ? 'prefilling...' : 'prefill book details'}
              </Pill>
            </div>
            
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageInputChange} />
          </div>

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, overflow: 'auto', paddingRight: '8px', marginBottom: '24px', alignItems: 'start' }}>
            
            {/* Left Column - Square Image Upload */}
            <div style={{ width: '100%', aspectRatio: '1', maxWidth: '400px', justifySelf: 'center' }}>
              <div 
                onClick={() => coverInputRef.current?.click()} 
                style={{
                  width: '100%', 
                  height: '100%', 
                  border: getBorderStyle(), 
                  borderRadius: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease', 
                  overflow: 'hidden', 
                  position: 'relative',
                  background: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = getHoverBorderStyle();
                  e.currentTarget.style.background = ARTIFACT_RED_TRANSPARENT_05;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = getBorderStyle();
                  e.currentTarget.style.background = 'white';
                }}
              >
                {imageSearching ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: ARTIFACT_RED }}>
                    <div style={{ width: '40px', height: '40px', border: `3px solid ${ARTIFACT_RED_TRANSPARENT_10}`, borderTop: `3px solid ${ARTIFACT_RED}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontSize: FONT_SIZES.MEDIUM, fontWeight: FONT_WEIGHTS.BOLD, color: ARTIFACT_RED, textAlign: 'center' }}>
                      Searching for cover image...
                    </div>
                  </div>
                ) : imagePreview ? (
                  <img src={imagePreview} alt="Book cover preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : noCoverFound ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: ARTIFACT_RED, textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: FONT_SIZES.MEDIUM, fontWeight: FONT_WEIGHTS.BOLD, color: ARTIFACT_RED }}>
                      No cover image found
                    </div>
                    <div style={{ fontSize: FONT_SIZES.SMALL, color: '#666', maxWidth: '200px' }}>
                      Click to upload your own cover image
                    </div>
                  </div>
                ) : (
                    <div style={{ fontSize: FONT_SIZES.MEDIUM, fontWeight: FONT_WEIGHTS.BOLD }}>
                      Upload Book Cover
                    </div>
                  
                )}
              </div>
              <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} ref={coverInputRef} onChange={handleCoverFileChange} />
            </div>

            {/* Right Column - Form Fields */}
            <div style={{ width: '100%', aspectRatio: '1', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'auto', paddingRight: '8px' }}>
                {/* Title */}
                <Pill fullWidth hoverBackground="#f9eaea">
                  <input type="text" name="name" placeholder="Title" value={fields.name} onChange={handleChange} required style={pillInputStyle} />
                </Pill>

                {/* Author, Publisher, ISBN */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="text" name="author" placeholder="Author" value={fields.author} onChange={handleChange} required style={pillInputStyle} /></Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="text" name="publisher" placeholder="Publisher/Editor" value={fields.publisher} onChange={handleChange} style={pillInputStyle} /></Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="text" name="isbn" placeholder="ISBN" value={fields.isbn} onChange={handleChange} required style={pillInputStyle} /></Pill>
                </div>

                {/* Date, Edition, Price */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="date" name="publication date" placeholder="Publication Date" value={fields['publication date']} onChange={handleChange} required style={pillInputStyle} /></Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="number" name="ed" placeholder="Edition" value={fields.ed} onChange={handleChange} style={pillInputStyle} /></Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="number" name="Original price" placeholder="Original Price" value={fields['Original price']} onChange={handleChange} style={pillInputStyle} /></Pill>
                </div>



                {/* Pages, Language */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', width: '100%' }}>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="number" name="Pages" placeholder="Pages" value={fields.Pages} onChange={handleChange} style={pillInputStyle} /></Pill>
                  <Pill fullWidth hoverBackground="#f9eaea" sx={{ width: '100%', minWidth: 0 }}><input type="text" name="Language" placeholder="Language" value={fields.Language} onChange={handleChange} style={pillInputStyle} /></Pill>
                </div>
                
                {/* Description - Flexible to fill remaining space */}
                <div style={{ 
                  width: '100%', 
                  border: getBorderStyle(), 
                  borderRadius: '16px', 
                  padding: '12px', 
                  background: 'white', 
                  minHeight: '120px',
                  flex: 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = getHoverBorderStyle();
                  e.currentTarget.style.background = ARTIFACT_RED_TRANSPARENT_05;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = getBorderStyle();
                  e.currentTarget.style.background = 'white';
                }}
                >
                  <textarea 
                    name="Description" 
                    placeholder="Description" 
                    value={fields.Description} 
                    onChange={handleChange} 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      minHeight: '100px', 
                      border: 'none', 
                      outline: 'none', 
                      background: 'transparent', 
                      color: 'inherit', 
                      fontWeight: FONT_WEIGHTS.BOLD, 
                      fontSize: FONT_SIZES.MEDIUM, 
                      lineHeight: '1.4', 
                      resize: 'none', 
                      fontFamily: 'inherit'
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Source Information - Full Width Section */}
          {fields['Price source'] && fields['Original price'] && fields['Original price'].trim() !== '' && (
            <div style={{ 
              width: '100%', 
              padding: '16px', 
              marginTop: '16px',
              background: '#e8f5e8', 
              border: '1px solid #2e7d32',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: FONT_SIZES.MEDIUM, 
                fontWeight: FONT_WEIGHTS.BOLD, 
                color: '#2e7d32',
                marginBottom: '4px'
              }}>
                💰 Price Information
              </div>
              <div style={{ 
                fontSize: FONT_SIZES.SMALL, 
                color: '#2e7d32'
              }}>
                Original price: ${fields['Original price']} | Source: {fields['Price source']}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexShrink: 0, paddingTop: '16px', borderTop: '1px solid #eee' }}>
            <Pill background={CANCEL_BLACK} color="white" onClick={handleCancel} sx={{ cursor: 'pointer', '&:hover': { background: CANCEL_BLACK_HOVER }, transition: 'all 0.2s ease', minWidth: 120, textAlign: 'center' }}>
              Cancel
            </Pill>
            <Pill background={ARTIFACT_RED} color="white" onClick={loading ? undefined : handleSubmit} sx={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, '&:hover': { background: ARTIFACT_RED_DARK }, transition: 'all 0.2s ease', minWidth: 120, textAlign: 'center' }}>
              {loading ? 'Listing...' : 'List Book'}
            </Pill>
          </div>

          {/* Error/Success Messages */}
          {error && <Pill fullWidth background="#ffebee" color="#c62828" sx={{ border: '1px solid #ffcdd2', fontWeight: FONT_WEIGHTS.BOLD }}>{error}</Pill>}
          {success && <Pill fullWidth background="#e8f5e8" color="#2e7d32" sx={{ border: '1px solid #c8e6c9', fontWeight: FONT_WEIGHTS.BOLD }}>{success}</Pill>}
        </div>
      </div>

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', borderRadius: '12px', padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', zIndex: 2000, 
          minWidth: '500px', maxWidth: '600px', border: '1px solid #e0e0e0',
        }}>
          <div style={{ 
            fontSize: FONT_SIZES.LARGE, 
            fontWeight: FONT_WEIGHTS.BOLD, 
            color: ARTIFACT_RED, 
            marginBottom: '24px', 
            textAlign: 'center' 
          }}>
            Book Data Results
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Found Data - Top Section */}
            {feedbackMessage.includes('Found:') && (
              <div style={{ width: '100%' }}>
                <div style={{ 
                  fontSize: FONT_SIZES.MEDIUM, 
                  fontWeight: FONT_WEIGHTS.BOLD, 
                  color: '#2e7d32', 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Found Data
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {feedbackMessage.split('Found:')[1]?.split(',')?.map((item, index) => (
                    <Pill
                      key={index}
                      fullWidth
                      background="#e8f5e8"
                      color="#2e7d32"
                      sx={{ 
                        border: '1px solid #c8e6c9',
                        fontSize: FONT_SIZES.MEDIUM,
                        fontWeight: FONT_WEIGHTS.BOLD,
                        textAlign: 'center',
                        padding: '12px 16px',
                      }}
                    >
                      {item.trim()}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Data - Bottom Section */}
            {feedbackMessage.includes('Missing:') && (
              <div style={{ width: '100%' }}>
                <div style={{ 
                  fontSize: FONT_SIZES.MEDIUM, 
                  fontWeight: FONT_WEIGHTS.BOLD, 
                  color: '#f57c00', 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Missing Data
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {feedbackMessage.split('Missing:')[1]?.split(',')?.map((item, index) => (
                    <Pill
                      key={index}
                      fullWidth
                      background="#fff3e0"
                      color="#f57c00"
                      sx={{ 
                        border: '1px solid #ffcc02',
                        fontSize: FONT_SIZES.MEDIUM,
                        fontWeight: FONT_WEIGHTS.BOLD,
                        textAlign: 'center',
                        padding: '12px 16px',
                      }}
                    >
                      {item.trim()}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {(prefillLoading || imageSearching) && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '12px', padding: '24px',
          zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <div style={{ color: 'white', fontSize: FONT_SIZES.MEDIUM, fontWeight: FONT_WEIGHTS.BOLD }}>
            {prefillLoading ? 'Searching for book data...' : 'Searching for cover image...'}
          </div>
        </div>
      )}
    </>
  );
};

const pillInputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent', border: 'none', outline: 'none',
  color: 'inherit', fontWeight: FONT_WEIGHTS.BOLD, fontSize: FONT_SIZES.MEDIUM,
  lineHeight: 'inherit', textAlign: 'center', padding: '8px 0',
  textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
};

export default SellBookModal; 