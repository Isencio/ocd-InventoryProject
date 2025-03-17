import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };
    return (
        <div className="stock-cards-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
            <div className="stock-cards-header">
                <h1>Stock Card</h1>
            </div>
            <div className="right-image-section">
                <img src={logo} 
                alt="OCD logo" 
                className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default StockCardsPage;