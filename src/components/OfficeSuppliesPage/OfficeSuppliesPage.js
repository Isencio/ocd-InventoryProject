import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OfficeSuppliesPage.css';

const OfficeSuppliesPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="office-supplies-container">
      <h1>OFFICE SUPPLIES</h1>
      <div className="stock-cards">
        <button className="stock-card" onClick={() => handleNavigation('/rpci')}>RPCI</button>
        <button className="stock-card" onClick={() => handleNavigation('/rsmi')}>RSMI</button>
        <button className="stock-card" onClick={() => handleNavigation('/ris')}>RIS</button>
      </div>
      <footer className="footer">
        Footer
      </footer>
    </div>
  );
};

export default OfficeSuppliesPage;