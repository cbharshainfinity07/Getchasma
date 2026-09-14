// Dynamic API Base URL configuration
// Automatically switches between local dev, custom VITE_API_URL, and production relative routes
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : '');

export default API_BASE_URL;
