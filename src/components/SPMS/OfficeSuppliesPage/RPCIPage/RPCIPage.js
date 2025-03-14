// RPCIPage.js
import React from 'react';
import './RPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RPCIPage = () => {
    return (
        <div>
            <div className="rpci-container">
                <div className="rpci-header">RPCI</div>
                <div className="rpci-content">
                    <p><strong>Footer</strong></p>
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

export default RPCIPage;