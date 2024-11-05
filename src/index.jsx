import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import './index.css';

// pages for react js in order
import Vote_join from './Vote_join';
import Vote_start from './Vote_start';
import Vote_pref from './Vote_pref';
import Vote_voting from './Vote_voting';
import Vote_final from './Vote_final';
import NotFound from './NotFound';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Vote_join />} />
          <Route path="/start" element={<Vote_start />} />
          <Route path="/pref" element={<Vote_pref />} />
          <Route path="/voting" element={<Vote_voting />} />
          <Route path="/final" element={<Vote_final />} />
          <Route path="/*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
);