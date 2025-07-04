import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BookshopLanding from './BookshopLanding';
import ProductPageLayout from './ProductPageLayout';
// import BaseLayoutDemo from './BaseLayoutDemo';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Set global background color
if (typeof document !== 'undefined') {
  document.body.style.background = 'floralwhite';
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookshopLanding />} />
        <Route path="/book/:id" element={<ProductPageLayout />} />
        {/* <Route path="/base-layout" element={<BaseLayoutDemo />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);