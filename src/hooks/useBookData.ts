import { useState } from 'react';
import { useBookPricing } from './useBookPricing';

interface BookData {
  name: string; // Changed from 'title' to match form field name
  author: string;
  publisher: string;
  isbn: string;
  'publication date': string;
  ed: string;
  'Original price': string;
  'Price source': string; // Add price source field
  Description: string;
  Pages: string;
  Language: string;
  Cover: string;
}

interface BookDataResult {
  bookData: BookData | null;
  isLoading: boolean;
  error: string | null;
  fetchBookData: (isbn: string) => Promise<void>;
  reset: () => void;
}

export const useBookData = (): BookDataResult => {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the separate pricing hook
  const { price, priceSource, fetchPrice } = useBookPricing();

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



  const fetchBookData = async (isbn: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setBookData(null);

    try {
      // Generate all possible ISBN variants
      const isbnVariants = generateISBNVariants(isbn);
      console.log('Trying ISBN variants:', isbnVariants);
      
      let data: any = null;
      let bookFound = false;
      let sourceName = '';
      let workingISBN = '';

      // Primary Source: Open Library API
      try {
        const openLibraryCall = async (isbn: string) => {
          const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
          if (res.ok) {
            const bookData = await res.json();
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
        
        const openLibraryResult = await tryISBNVariants(isbn, openLibraryCall);
        if (openLibraryResult) {
          data = openLibraryResult.result;
          workingISBN = openLibraryResult.isbn;
          bookFound = true;
          sourceName = 'Open Library';
        }
      } catch (err) {
        // Open Library API failed, continue to next source
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
          
          const googleResult = await tryISBNVariants(isbn, googleBooksCall);
          if (googleResult) {
            data = googleResult.result;
            workingISBN = googleResult.isbn;
            bookFound = true;
            sourceName = 'Google Books';
          }
        } catch (err) {
          // Google Books API failed, continue to next source
        }
      }
      
      // Only show error if both sources failed
      if (!bookFound) {
        throw new Error(`Book not found for ISBN: ${isbn}. Please check the ISBN or enter book details manually.`);
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

      // Enhanced publisher/editor handling
      let publisher = '';
      if (Array.isArray(data.publishers) && data.publishers.length > 0) {
        // Handle both string publishers and object publishers
        const firstPublisher = data.publishers[0];
        if (typeof firstPublisher === 'string') {
          publisher = firstPublisher;
        } else if (firstPublisher && typeof firstPublisher === 'object' && firstPublisher.name) {
          publisher = firstPublisher.name;
        }
      } else if (data.editors && Array.isArray(data.editors) && data.editors.length > 0) {
        // If no publisher, try editors
        const firstEditor = data.editors[0];
        if (typeof firstEditor === 'string') {
          publisher = firstEditor;
        } else if (firstEditor && typeof firstEditor === 'object' && firstEditor.name) {
          publisher = firstEditor.name;
        }
      } else if (data.contributors && Array.isArray(data.contributors) && data.contributors.length > 0) {
        // If no editors, try contributors
        const contributors = data.contributors.filter((c: any) => 
          c.role && (c.role.includes('editor') || c.role.includes('publisher'))
        );
        if (contributors.length > 0) {
          const firstContributor = contributors[0];
          if (typeof firstContributor === 'string') {
            publisher = firstContributor;
          } else if (firstContributor && typeof firstContributor === 'object' && firstContributor.name) {
            publisher = firstContributor.name;
          }
        }
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
        subjects = data.subjects.slice(0, 5).join(', '); // Limit to first 5 subjects
      }

      // Format publication date
      let publicationDate = '';
      if (data.publish_date) {
        try {
          const date = new Date(data.publish_date);
          if (!isNaN(date.getTime())) {
            publicationDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format for input[type="date"]
          }
        } catch {}
      }

      // Get pricing information using the separate pricing hook
      const pricingResult = await fetchPrice(workingISBN, data.title);

      // Enhanced description handling - try multiple sources
      let description = '';
      
      // Try description first (could be string or object with value)
      if (typeof data.description === 'string' && data.description.trim()) {
        description = data.description.trim();
      } else if (data.description && typeof data.description === 'object' && data.description.value) {
        description = data.description.value.trim();
      }
      
      // If no description, try excerpt
      if (!description && data.excerpt) {
        if (typeof data.excerpt === 'string' && data.excerpt.trim()) {
          description = data.excerpt.trim();
        } else if (data.excerpt && typeof data.excerpt === 'object' && data.excerpt.value) {
          description = data.excerpt.value.trim();
        }
      }
      
      // If still no description, try subjects
      if (!description && subjects) {
        description = subjects;
      }
      
      // If still no description, try other potential fields
      if (!description && data.notes) {
        if (typeof data.notes === 'string' && data.notes.trim()) {
          description = data.notes.trim();
        } else if (data.notes && typeof data.notes === 'object' && data.notes.value) {
          description = data.notes.value.trim();
        }
      }
      
      // If description is still empty or very short, try Google Books for better description
      if (!description || description.length < 100) {
        try {
          // Build search query with title, subtitle, and author
          let searchQuery = data.title;
          if (data.subtitle) {
            searchQuery += ` ${data.subtitle}`;
          }
          if (author) {
            searchQuery += ` ${author}`;
          }
          
          const encodedQuery = encodeURIComponent(searchQuery);
          const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}`);
          
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            if (googleData.items && googleData.items.length > 0) {
              const book = googleData.items[0].volumeInfo;
              if (book.description && book.description.length > description.length) {
                description = book.description;
              }
            }
          }
        } catch (err) {
          // Google Books description fetch failed, continue with what we have
        }
      }

      // Transform data to match form fields
      const transformedData: BookData = {
        name: data.title || '', // Changed from 'title' to 'name' to match form field
        author: author,
        publisher: publisher, // Use the enhanced publisher handling
        isbn: workingISBN,
        'publication date': publicationDate,
        ed: data.edition_name || '',
        'Original price': pricingResult.price, // Use the price result directly
        'Price source': pricingResult.source, // Add the price source
        Description: description,
        Pages: data.number_of_pages ? data.number_of_pages.toString() : '',
        Language: language,
        Cover: '',
      };



      setBookData(transformedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch book info');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setBookData(null);
    setIsLoading(false);
    setError(null);
  };

  return {
    bookData,
    isLoading,
    error,
    fetchBookData,
    reset
  };
}; 