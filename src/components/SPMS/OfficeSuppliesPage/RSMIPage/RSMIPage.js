import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RSMIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RSMIPage = () => {
    const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };
    return (
        <div className="rsmi-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
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