import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

// Add logging to check environment variables
console.log('ENV CHECK:', {
  isDev: import.meta.env.DEV,
  useMockApi: import.meta.env.VITE_USE_MOCK_API
});

// Monitor all network requests in development
if (import.meta.env.DEV) {
  // Monitor ALL fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log("FETCH REQUEST:", args[0]);
    return originalFetch.apply(this, args);
  };
  
  // Log when XMLHttpRequest is used (without intercepting)
  console.log("XHR monitoring available but not enabled due to TypeScript complexities");
}

// Import the mock API server if enabled
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
  console.log('LOADING MOCK API SERVER');
  import('./services/mockApiServer').then(({ makeServer }) => {
    const server = makeServer({ environment: 'development' });
    // @ts-expect-error - Adding server to window for debugging
    window.server = server;
    console.log('MOCK API SERVER INITIALIZED AND ATTACHED TO WINDOW');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);