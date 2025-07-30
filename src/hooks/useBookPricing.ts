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
    
    // Source 1: OpenLibrary (try all variants) - get book info first
    let bookTitle = title;
    let openLibraryData: any = null;
    
    for (const variant of isbnVariants) {
      try {
        const openLibraryUrl = `https://openlibrary.org/isbn/${variant}`;
        const openLibraryResponse = await fetch(`${openLibraryUrl}.json`);
        if (openLibraryResponse.ok) {
          const data = await openLibraryResponse.json();
          openLibraryData = data; // Store the data for later use
          
          // Get the title if we don't have it
          if (!bookTitle && data.title) {
            bookTitle = data.title;
          }
          // Check for price
          if (data.price) {
            price = data.price.toString();
            source = openLibraryUrl;
            return { price, source };
          }
        }
      } catch (err) {
        // OpenLibrary failed for this variant, continue to next
      }
    }
    
    // Source 2: Google Books API using title, subtitle, and author (if we have them)
    if (bookTitle) {
      try {
        // Build a comprehensive search query with title, subtitle, and author
        let searchQuery = bookTitle;
        
        // Add subtitle if available
        if (openLibraryData?.subtitle) {
          searchQuery += ` ${openLibraryData.subtitle}`;
        }
        
        // Add author if available
        if (openLibraryData?.authors && openLibraryData.authors.length > 0) {
          const authorName = openLibraryData.authors[0].name || openLibraryData.authors[0];
          searchQuery += ` ${authorName}`;
        }
        
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}`;
        const googleResponse = await fetch(googleUrl);
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.items && googleData.items.length > 0) {
            const book = googleData.items[0];
            if (book.saleInfo) {
              if (book.saleInfo.listPrice) {
                price = book.saleInfo.listPrice.amount.toString();
                source = `https://books.google.com/books?id=${book.id}`;
                return { price, source };
              } else if (book.saleInfo.retailPrice) {
                price = book.saleInfo.retailPrice.amount.toString();
                source = `https://books.google.com/books?id=${book.id}`;
                return { price, source };
              } else if (book.saleInfo.offers && book.saleInfo.offers.length > 0) {
                price = book.saleInfo.offers[0].listPrice?.amount?.toString() || '';
                if (price) {
                  source = `https://books.google.com/books?id=${book.id}`;
                  return { price, source };
                }
              }
            }
          }
        }
      } catch (err) {
        // Google Books failed
      }
    }

    // No price found from any real source
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