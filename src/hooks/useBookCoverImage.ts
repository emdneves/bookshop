import { useState } from 'react';

interface BookCoverImageResult {
  imageUrl: string | null;
  isSearching: boolean;
  noCoverFound: boolean;
  searchForCover: (isbn: string, title?: string) => Promise<void>;
  reset: () => void;
}

export const useBookCoverImage = (): BookCoverImageResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [noCoverFound, setNoCoverFound] = useState(false);

  // ISBN check digit calculation functions
  const calculateISBN13CheckDigit = (isbn12: string): string => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn12[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  };

  const calculateISBN10CheckDigit = (isbn9: string): string => {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn9[i]) * (10 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    return checkDigit === 10 ? 'X' : checkDigit.toString();
  };

  // Helper function to generate all possible ISBN variants
  const generateISBNVariants = (baseISBN: string): string[] => {
    const cleanIsbn = baseISBN.replace(/[^0-9X]/gi, '');
    const variants = new Set<string>();
    
    // Add the original cleaned ISBN
    variants.add(cleanIsbn);
    
    // Add versions with/without hyphens and spaces
    variants.add(baseISBN.replace(/-/g, ''));
    variants.add(baseISBN.replace(/\s/g, ''));
    
    // Convert ISBN-10 to ISBN-13
    if (cleanIsbn.length === 10) {
      const isbn13 = `978${cleanIsbn.slice(0, -1)}${calculateISBN13CheckDigit(`978${cleanIsbn.slice(0, -1)}`)}`;
      variants.add(isbn13);
    }
    
    // Convert ISBN-13 to ISBN-10 (if it starts with 978)
    if (cleanIsbn.length === 13 && cleanIsbn.startsWith('978')) {
      const isbn10 = cleanIsbn.slice(3, -1) + calculateISBN10CheckDigit(cleanIsbn.slice(3, -1));
      variants.add(isbn10);
    }
    
    return Array.from(variants).filter(variant => variant.length >= 10);
  };

  // Helper function to try different ISBN formats
  const tryISBNVariants = async (baseISBN: string, apiCall: (isbn: string) => Promise<any>) => {
    const variants = generateISBNVariants(baseISBN);
    
    for (const variant of variants) {
      try {
        const result = await apiCall(variant);
        if (result) return { result, isbn: variant };
      } catch (err) {
        // Continue to next variant
      }
    }
    return null;
  };

  // Validate image by loading it and checking dimensions
  const validateImage = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check if image is actually a real cover (not a 1x1 placeholder)
        resolve(img.naturalWidth > 10 && img.naturalHeight > 10);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = url;
    });
  };

  // Validate Google Books image with enhanced placeholder detection
  const validateGoogleBooksImage = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Validating Google Books image: ${url}`);
        console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
        
        // Check if the URL contains "no image available" indicators
        if (url.includes('no-image-available') || 
            url.includes('noimage') ||
            url.includes('nobook') ||
            url.includes('no_image') ||
            url.includes('placeholder') ||
            url.includes('default') ||
            url.includes('books.google.com/books/content') ||
            url.includes('gbs_api')) {
          console.log('❌ Rejected: URL contains placeholder indicators');
          resolve(false);
          return;
        }

        // Check if image is too small (likely a placeholder)
        if (img.naturalWidth < 50 || img.naturalHeight < 50) {
          console.log('❌ Rejected: Image too small');
          resolve(false);
          return;
        }
        
        // More aggressive check: if it's a Google Books image, be extra strict
        if (url.includes('books.google.com') || url.includes('googleusercontent.com')) {
          console.log('⚠️ Google Books image detected - applying strict validation');
          
          // For Google Books, reject if image is too small or has suspicious dimensions
          if (img.naturalWidth < 200 || img.naturalHeight < 200) {
            console.log('❌ Rejected: Google Books image too small for strict validation');
            resolve(false);
            return;
          }
        }

        // Additional check: if the image is mostly transparent or has very low contrast
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx?.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            // Check if image is mostly transparent or very light (placeholder)
            let transparentPixels = 0;
            let lightPixels = 0;
            let totalPixels = imageData.data.length / 4;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              const r = imageData.data[i];
              const g = imageData.data[i + 1];
              const b = imageData.data[i + 2];
              const alpha = imageData.data[i + 3];
              
              // Check for very transparent pixels
              if (alpha < 50) {
                transparentPixels++;
              }
              
              // Check for very light pixels (likely placeholder text)
              const brightness = (r + g + b) / 3;
              if (brightness > 240 && alpha > 200) {
                lightPixels++;
              }
            }
            
            const transparentRatio = transparentPixels / totalPixels;
            const lightRatio = lightPixels / totalPixels;
            
            console.log(`Transparent pixels: ${transparentPixels}/${totalPixels} (${(transparentRatio * 100).toFixed(1)}%)`);
            console.log(`Light pixels: ${lightPixels}/${totalPixels} (${(lightRatio * 100).toFixed(1)}%)`);
            
            // If more than 80% is transparent, it's likely a placeholder
            if (transparentRatio > 0.8) {
              console.log('❌ Rejected: Too many transparent pixels');
              resolve(false);
              return;
            }
            
            // If more than 70% is very light, it might be a placeholder with text
            if (lightRatio > 0.7) {
              console.log('❌ Rejected: Too many light pixels (likely placeholder text)');
              resolve(false);
              return;
            }
            
            // Additional check: Look for patterns that suggest "image not available" text
            // This checks for large areas of consistent light color that might be text
            let consistentLightAreas = 0;
            const sampleSize = Math.min(100, totalPixels); // Sample 100 pixels or all if less
            const step = Math.max(1, Math.floor(totalPixels / sampleSize));
            
            for (let i = 0; i < imageData.data.length && i < sampleSize * 4; i += step * 4) {
              const r = imageData.data[i];
              const g = imageData.data[i + 1];
              const b = imageData.data[i + 2];
              const alpha = imageData.data[i + 3];
              
              // Check for very light gray/white pixels (typical for placeholder text)
              if (r > 200 && g > 200 && b > 200 && alpha > 150) {
                consistentLightAreas++;
              }
            }
            
            const consistentLightRatio = consistentLightAreas / sampleSize;
            console.log(`Consistent light areas: ${consistentLightAreas}/${sampleSize} (${(consistentLightRatio * 100).toFixed(1)}%)`);
            
            if (consistentLightRatio > 0.6) {
              console.log('❌ Rejected: Too many consistent light areas (likely placeholder text)');
              resolve(false);
              return;
            }
          }
        } catch (err) {
          console.log('Canvas analysis failed:', err);
          // If canvas analysis fails, assume it's valid
        }
        
        console.log('✅ Google Books image validation passed');
        resolve(true);
      };
      img.onerror = () => {
        console.log('❌ Google Books image failed to load');
        resolve(false);
      };
      img.src = url;
    });
  };

  const searchForCover = async (isbn: string, title?: string): Promise<void> => {
    setIsSearching(true);
    setNoCoverFound(false);
    setImageUrl(null);

    console.log('=== COVER IMAGE SEARCH STARTED ===');
    console.log('Searching for ISBN:', isbn);
    console.log('Title:', title || 'NOT PROVIDED');

    try {
      let coverUrl = '';
      let coverFound = false;

      // Source 1: Open Library Cover ID
      console.log('--- Trying Open Library Cover ID ---');
      if (!coverFound) {
        try {
          const openLibraryCall = async (isbn: string) => {
            console.log(`Trying Open Library Cover ID with ISBN: ${isbn}`);
            const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
            if (res.ok) {
              const bookData = await res.json();
              console.log('Open Library Cover ID response:', bookData);
              return {
                covers: bookData.covers || [],
                source: 'openlibrary'
              };
            }
            console.log(`❌ Open Library Cover ID failed with status: ${res.status}`);
            return null;
          };
          
          const data = await tryISBNVariants(isbn, openLibraryCall);
          if (data?.result?.covers && data.result.covers.length > 0) {
            coverUrl = `https://covers.openlibrary.org/b/id/${data.result.covers[0]}-L.jpg`;
            console.log(`Trying Open Library Cover ID URL: ${coverUrl}`);
            const isValid = await validateImage(coverUrl);
            if (isValid) {
              console.log(`✅ Cover found: Open Library Cover ID`);
              setImageUrl(coverUrl);
              coverFound = true;
            } else {
              console.log('❌ Open Library Cover ID image validation failed');
            }
          } else {
            console.log('❌ No covers found in Open Library Cover ID response');
          }
        } catch (err) {
          console.log('❌ Open Library Cover ID error:', err);
          // Open Library cover ID image failed, try next source
        }
      }

      // Source 2: Open Library ISBN (try all variants)
      console.log('--- Trying Open Library ISBN ---');
      if (!coverFound) {
        const isbnVariants = generateISBNVariants(isbn);
        for (const variant of isbnVariants) {
          try {
            const isbnCoverUrl = `https://covers.openlibrary.org/b/isbn/${variant}-L.jpg`;
            console.log(`Trying Open Library ISBN URL: ${isbnCoverUrl}`);
            const isValid = await validateImage(isbnCoverUrl);
            if (isValid) {
              console.log(`✅ Cover found: Open Library ISBN`);
              coverUrl = isbnCoverUrl;
              setImageUrl(coverUrl);
              coverFound = true;
              break; // Found a valid cover, exit the loop
            } else {
              console.log(`❌ Open Library ISBN image validation failed for ${variant}`);
            }
          } catch (err) {
            console.log(`❌ Open Library ISBN error for ${variant}:`, err);
            // Open Library ISBN cover image failed for this variant, continue to next
          }
        }
      }

      // Source 3: Google Books by ISBN (try all variants) - SKIP FOR NOW
      // Google Books often returns placeholder images, so we'll skip this source
      console.log('--- Skipping Google Books ISBN search (too many placeholders) ---');
      
      // Source 3: Google Books by title - SKIP FOR NOW
      // Google Books often returns placeholder images, so we'll skip this source
      console.log('--- Skipping Google Books title search (too many placeholders) ---');

      // Source 4: Google Books by title - SKIPPED
      // Google Books often returns placeholder images, so we'll skip this source
      if (!coverFound && title) {
        console.log('--- Skipping Google Books title search (too many placeholders) ---');
      }

      // Source 5: Amazon (try all variants)
      if (!coverFound) {
        const isbnVariants = generateISBNVariants(isbn);
        for (const variant of isbnVariants) {
          try {
            // Amazon has a simple URL pattern for book covers
            // Format: https://images-na.ssl-images-amazon.com/images/P/{ASIN}.{size}.jpg
            // We'll try different sizes: L (large), M (medium), S (small)
            const amazonSizes = ['L', 'M', 'S'];
            
            for (const size of amazonSizes) {
              try {
                const amazonUrl = `https://images-na.ssl-images-amazon.com/images/P/${variant}.${size}.jpg`;
                const isValid = await validateImage(amazonUrl);
                if (isValid) {
                  coverUrl = amazonUrl;
                  setImageUrl(coverUrl);
                  coverFound = true;
                  break; // Found a valid cover, exit the size loop
                }
              } catch (err) {
                // Continue to next size if this one failed
              }
            }
            if (coverFound) break; // Found a valid cover, exit the variant loop
          } catch (err) {
            // Amazon cover image failed for this variant, continue to next
          }
        }
      }

      // If no cover found, set the state to show "no image found" message
      if (!coverFound) {
        console.log('❌ No cover image found from any source');
        setImageUrl(null);
        setNoCoverFound(true);
      } else {
        console.log(`✅ Cover image search completed successfully`);
      }
    } catch (err) {
      console.log('❌ Cover image search error:', err);
      setImageUrl(null);
      setNoCoverFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setIsSearching(false);
    setNoCoverFound(false);
  };

  return {
    imageUrl,
    isSearching,
    noCoverFound,
    searchForCover,
    reset
  };
}; 