import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SPMSPage.css';
import logo from '../../Assets/OCD-main.jpg';

const SPMSPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="spms-container">
      {/* Left Section - Vertical Image */}
      <div className="OCD-main-left">
        <img
          src={logo}
          alt="OCD logo"
          className="OCD-vertical-image"
        />
      </div>

      {/* Right Section - Buttons and Headers */}
      <div className="rightBUTTON-section">
        {/* Headers */}
        <div className="header-container">
          <h1 className="ocd-header">OCD</h1>
          <h2 className="spms-header">SUPPLY AND PROPERTY MANAGEMENT SYSTEM</h2>
        </div>

        {/* Button Grid */}
        <div className="SPMS-button-grid">
          <button className="orange-button" onClick={() => handleNavigation('/office-supplies')}>OFFICE SUPPLIES</button>
          <button className="orange-button">OTHER SUPPLIES</button>
          <button className="orange-button">FUEL AND OTHER LUBRICANT (FOL)</button>
          <button className="orange-button">PROPERTY AND PLANT EQUIPMENT</button>
          <button className="orange-button">SEMI-EXPENDABLE EQUIPMENT</button>
          <button className="orange-button">UN SERVICEABLE EQUIPMENT</button>
        </div>
      </div>
    </div>
  );
};

export default SPMSPage;