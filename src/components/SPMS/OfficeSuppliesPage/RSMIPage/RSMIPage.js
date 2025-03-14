// RPCIPage.js
import React from 'react';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    return (
        <div className="rsmi-container">
            <div className="rsmi-header">
                <h1>RSMI</h1>
            </div>
            <div className="right-image-section">
                <img src={logo} 
                alt="OCD logo" 
                className="vertical-OCD-image" />
            </div>
        </div>
    );
};

export default RSMIPage;