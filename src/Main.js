import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import SPMSPage from './components/SPMS/SPMSPage';
import OfficeSuppliesPage from './components/SPMS/OfficeSuppliesPage/OfficeSuppliesPage';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/spms" element={<SPMSPage />} />
        <Route path="/office-supplies" element={<OfficeSuppliesPage />} />
      </Routes>
    </Router>
  );
}

export default Main;