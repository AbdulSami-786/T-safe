import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import './base.css';
import './hero.css';
import './app.css';
import './sections.css';
import './responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
