// RISPage.js
import React from 'react';
import './RISPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RISPage = () => {
    return (
        <div className="ris-container">
            <div className="ris-header">
                <h1>RIS</h1>
            </div>
            <div className="right-image-section">
                <img src={logo} 
                alt="OCD logo" 
                className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default RISPage;