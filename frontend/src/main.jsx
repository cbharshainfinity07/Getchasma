import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import './index.css'
import App from './App.jsx'

// Intercept fetch calls in production or when VITE_API_URL is configured
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('http://localhost:5001')) {
      const apiUrl = import.meta.env.VITE_API_URL || (
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5001'
          : ''
      );
      const newUrl = url.replace('http://localhost:5001', apiUrl);
      return originalFetch(newUrl, options);
    }
    return originalFetch(url, options);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
