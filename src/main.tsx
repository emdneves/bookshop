import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import { SHARED_BG } from './constants/colors';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Set global background color
if (typeof document !== 'undefined') {
  document.body.style.background = SHARED_BG;
}

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);