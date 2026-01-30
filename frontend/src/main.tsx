import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerServiceWorker } from './sw-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
import { initPwaPrompt } from './utils/pwa';

// Register service worker for PWA support
registerServiceWorker();

// Initialize PWA prompt capture
initPwaPrompt();
