// StockCardsPage.js
import React from 'react';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    return (
        <div className="stock-cards-container">
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