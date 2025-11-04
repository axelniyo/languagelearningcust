import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

const root = document.getElementById('root');

if (root.hasChildNodes()) {
  // If there's server-side rendered content, hydrate it
  hydrateRoot(root, <App />);
} else {
  // Otherwise, do a normal client-side render
  const rootElement = ReactDOM.createRoot(root);
  rootElement.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
