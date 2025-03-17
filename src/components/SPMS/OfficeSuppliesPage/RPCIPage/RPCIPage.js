import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RPCIPage.css';
import logo from '../../../../Assets/OCD-main.jpg';

const RPCIPage = () => {
    const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };

    return (
        <div className="rpci-container">
            <button className="return-button" onClick={onBack}> &larr; </button>
            <div className="rpci-header">
                <h1>RPCI</h1>
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