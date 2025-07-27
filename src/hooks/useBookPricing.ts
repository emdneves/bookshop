import { useState } from 'react';

interface BookPricingResult {
  price: string;
  priceSource: string;
  isLoading: boolean;
  error: string | null;
  fetchPrice: (isbn: string, title?: string) => Promise<{ price: string; source: string }>;
  reset: () => void;
}

export const useBookPricing = (): BookPricingResult => {
  const [price, setPrice] = useState<string>('');
  const [priceSource, setPriceSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Helper function to get pricing information from multiple sources
  const getPricingInfo = async (isbn: string, title?: string): Promise<{ price: string; source: string }> => {
    let price = '';
    let source = '';
    
    // Generate all possible ISBN variants
    const isbnVariants = generateISBNVariants(isbn);
    console.log('=== PRICING SEARCH STARTED ===');
    console.log('Searching for ISBN:', isbn);
    console.log('Title:', title || 'NOT PROVIDED');
    console.log('ISBN Variants to try:', isbnVariants);
    
    // Source 1: Google Books API (most reliable open source)
    console.log('--- Trying Google Books API ---');
    for (const variant of isbnVariants) {
      try {
        console.log(`Trying Google Books with ISBN: ${variant}`);
        const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${variant}`);
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          console.log('Google Books response:', googleData);
          if (googleData.items && googleData.items.length > 0) {
            const book = googleData.items[0];
            console.log('Google Books book found:', book.title);
            if (book.saleInfo) {
              console.log('Google Books sale info:', book.saleInfo);
              if (book.saleInfo.listPrice) {
                price = book.saleInfo.listPrice.amount.toString();
                source = 'Google Books (List Price)';
                console.log(`✅ Price found: $${price} from ${source}`);
                return { price, source };
              } else if (book.saleInfo.retailPrice) {
                price = book.saleInfo.retailPrice.amount.toString();
                source = 'Google Books (Retail Price)';
                console.log(`✅ Price found: $${price} from ${source}`);
                return { price, source };
              } else if (book.saleInfo.offers && book.saleInfo.offers.length > 0) {
                price = book.saleInfo.offers[0].listPrice?.amount?.toString() || '';
                if (price) {
                  source = 'Google Books (Offer Price)';
                  console.log(`✅ Price found: $${price} from ${source}`);
                  return { price, source };
                }
              }
            } else {
              console.log('❌ No sale info in Google Books response');
            }
          } else {
            console.log('❌ No items found in Google Books response');
          }
        } else {
          console.log(`❌ Google Books API failed with status: ${googleResponse.status}`);
        }
      } catch (err) {
        console.log(`❌ Google Books API error for ISBN ${variant}:`, err);
        // Google Books failed for this variant, continue to next
      }
    }
    
    // Source 2: OpenLibrary (try all variants)
    console.log('--- Trying OpenLibrary API ---');
    for (const variant of isbnVariants) {
      try {
        console.log(`Trying OpenLibrary with ISBN: ${variant}`);
        const openLibraryResponse = await fetch(`https://openlibrary.org/isbn/${variant}.json`);
        if (openLibraryResponse.ok) {
          const openLibraryData = await openLibraryResponse.json();
          console.log('OpenLibrary response:', openLibraryData);
          if (openLibraryData.price) {
            price = openLibraryData.price.toString();
            source = 'OpenLibrary';
            console.log(`✅ Price found: $${price} from ${source}`);
            return { price, source };
          } else {
            console.log('❌ No price found in OpenLibrary response');
          }
        } else {
          console.log(`❌ OpenLibrary API failed with status: ${openLibraryResponse.status}`);
        }
      } catch (err) {
        console.log(`❌ OpenLibrary API error for ISBN ${variant}:`, err);
        // OpenLibrary failed for this variant, continue to next
      }
    }

    // Source 3: Google Books by title search
    console.log('--- Trying Google Books Title Search ---');
    if (title) {
      try {
        const searchQuery = encodeURIComponent(title);
        console.log(`Searching Google Books by title: "${title}"`);
        const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`);
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          console.log('Google Books title search response:', googleData);
          if (googleData.items && googleData.items.length > 0) {
            const book = googleData.items[0];
            console.log('Google Books title search book found:', book.title);
            if (book.saleInfo && book.saleInfo.listPrice) {
              price = book.saleInfo.listPrice.amount.toString();
              source = 'Google Books (Title Search)';
              console.log(`✅ Price found: $${price} from ${source}`);
              return { price, source };
            } else {
              console.log('❌ No sale info or list price in Google Books title search');
            }
          } else {
            console.log('❌ No items found in Google Books title search');
          }
        } else {
          console.log(`❌ Google Books title search failed with status: ${googleResponse.status}`);
        }
      } catch (err) {
        console.log('❌ Google Books title search error:', err);
        // Title search failed
      }
    } else {
      console.log('❌ No title provided for Google Books title search');
    }

    // Source 4: Price estimation based on publication year
    console.log('--- Trying Price Estimation ---');
    try {
      const currentYear = new Date().getFullYear();
      const publicationYear = title ? parseInt(title.match(/\b(19|20)\d{2}\b/)?.[0] || currentYear.toString()) : currentYear;
      const yearsOld = currentYear - publicationYear;
      
      console.log(`Current year: ${currentYear}, Publication year: ${publicationYear}, Years old: ${yearsOld}`);
      
      if (yearsOld < 5) {
        price = '25';
      } else if (yearsOld < 15) {
        price = '20';
      } else if (yearsOld < 30) {
        price = '15';
      } else {
        price = '10';
      }
      source = 'Estimated (Based on Publication Year)';
      console.log(`✅ Estimated price: $${price} from ${source}`);
      return { price, source };
    } catch (err) {
      console.log('❌ Price estimation failed:', err);
      // Estimation failed
    }

    console.log('❌ No price found from any source');
    return { price: '', source: '' };
  };

  const fetchPrice = async (isbn: string, title?: string): Promise<{ price: string; source: string }> => {
    setIsLoading(true);
    setError(null);
    setPrice('');
    setPriceSource('');

    try {
      const result = await getPricingInfo(isbn, title);
      setPrice(result.price);
      setPriceSource(result.source);
      
      if (result.price) {
        console.log(`Price found: $${result.price} from ${result.source}`);
      } else {
        console.log(`No price found for ISBN ${isbn}`);
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pricing info');
      return { price: '', source: '' };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPrice('');
    setPriceSource('');
    setIsLoading(false);
    setError(null);
  };

  return {
    price,
    priceSource,
    isLoading,
    error,
    fetchPrice,
    reset
  };
}; 