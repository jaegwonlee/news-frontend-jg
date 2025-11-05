export const BACKEND_BASE_URL = 'https://news02.onrender.com';

// A map of known favicon URLs for specific news sources.
// Can be populated over time.
export const FAVICON_URLS: { [key: string]: string } = {
  // Example: 'yna.co.kr': 'https://www.yna.co.kr/favicon.ico',
};

// A function to generate a fallback favicon URL using a generic service.
export const DEFAULT_FAVICON_URL = (domain: string) => 
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
