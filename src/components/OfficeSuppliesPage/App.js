import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfficeSuppliesPage from './OfficeSuppliesPage';
import RPCIPage from './RPCIPage'; // Create these components
import RSMIpage from './RSMIpage'; // Create these components
import RISPage from './RISPage'; // Create these components

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OfficeSuppliesPage />} />
        <Route path="/rpci" element={<RPCIPage />} />
        <Route path="/rsmi" element={<RSMIpage />} />
        <Route path="/ris" element={<RISPage />} />
      </Routes>
    </Router>
  );
}

export default App;