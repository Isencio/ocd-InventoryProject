// StockCardsPage.js
import React from 'react';
import './StockCardsPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const StockCardsPage = () => {
    const stockCards = [
        { id: 1, name: 'Stock 1', description: 'Description for Stock 1' },
        { id: 2, name: 'Stock 2', description: 'Description for Stock 2' },
        { id: 3, name: 'Stock 3', description: 'Description for Stock 3' },
        // Add more stock cards as needed
    ];

    return (
        <div>
            <div className="stock-cards-container">
            <div className="stock-cards-header">
                <h1>Stock Card</h1>
            </div>
                {stockCards.map((card) => (
                    <div key={card.id} className="stock-card">
                        <h3>{card.name}</h3>
                        <p>{card.description}</p>
                    </div>
                ))}
            </div>
            <div className="right-image-section">
                    <img src={logo} 
                    alt="OCD logo" 
                    className="vertical-OCD-image" />
                </div>
            <div className="footer">
                <p>Footer</p>
            </div>
        </div>
    );
};

export default StockCardsPage;