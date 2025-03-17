// RISPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RISPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RISPage = () => {
    const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };
    return (
        <div className="ris-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
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