import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import SPMSPage from './components/SPMS/SPMSPage';
import OfficeSuppliesPage from './components/SPMS/OfficeSuppliesPage/OfficeSuppliesPage';
import RISPage from './components/SPMS/OfficeSuppliesPage/RISPage/RISPage';
import RSMIPage from './components/SPMS/OfficeSuppliesPage/RSMIPage/RSMIPage';
import StockCardsPage from './components/SPMS/OfficeSuppliesPage/StockCardsPage/StockCardsPage';
import RPCIPage from './components/SPMS/OfficeSuppliesPage/RPCIPage/RPCIPage';
import OtherSuppliesPage from './components/SPMS/OtherSuppliesPage/OtherSuppliesPage';
import OtherRPCIPage from './components/SPMS/OtherSuppliesPage/OtherRPCIPage/OtherRPCIPage';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/spms" element={<SPMSPage />} />
          <Route path="/office-supplies" element={<OfficeSuppliesPage />} />
            <Route path="/stock-cards" element={<StockCardsPage />} />
            <Route path="/rsmi" element={<RSMIPage />} />
            <Route path="/ris" element={<RISPage />} />
            <Route path="/rpci" element={<RPCIPage />} />
            <Route path="/other-supplies" element={<OtherSuppliesPage />} />
            <Route path='/other-rpci' element={<OtherRPCIPage />}/>
      </Routes>
    </Router>
  );
}

export default Main;