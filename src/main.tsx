import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle redirect from 404.html
if (window.location.pathname === '/404.html') {
  const redirect = sessionStorage.redirect;
  if (redirect) {
    sessionStorage.removeItem('redirect');
    window.history.replaceState({}, '', redirect);
  }
}

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
