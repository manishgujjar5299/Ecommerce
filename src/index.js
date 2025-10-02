import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async'; 
// Import other wrappers
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; 
import { WishlistProvider } from './context/WishlistContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter must be the outermost for routing */}
    <BrowserRouter> 
      {/* HelmetProvider can be here to wrap the entire functional app */}
      <HelmetProvider> 
        <AuthProvider> 
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);