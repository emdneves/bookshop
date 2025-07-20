// API Configuration
// Use relative URL in development (goes through Vite proxy)
// Use full URL in production
export const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://theartifact.shop/api');
// For local development, use:
// export const API_BASE_URL = 'http://localhost:3000'; 