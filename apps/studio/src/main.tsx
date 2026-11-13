import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';

// The hosting page supplies the outer document, so the app declares its own language for screen readers.
if (!document.documentElement.lang) document.documentElement.lang = 'en';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
