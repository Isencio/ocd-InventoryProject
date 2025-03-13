import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OfficeSuppliesPage.css';
import logo from '../../../Assets/OCD-main.jpg';

const OfficeSuppliesPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <div className="office-supplies-container">
      <button className="return-button" onClick={onBack}> &larr; </button>
          <div className="Office-Supplies-section">
            <h1>OFFICE SUPPLIES</h1>
            <div className="office-stock-grid">
              <button className="stock-card" onClick={() => handleNavigation('/rpci')}>STOCK CARDS</button>
              <button className="stock-card">RPCI</button>
              <button className="stock-card">RSMI</button>
              <button className="stock-card">RIS</button>
            </div>
          </div>
          <div className="right-image-section">
            <img src={logo} 
            alt="OCD logo" 
            className="vertical-OCD-image" />
          </div>
    </div>
  );
};

export default OfficeSuppliesPage;