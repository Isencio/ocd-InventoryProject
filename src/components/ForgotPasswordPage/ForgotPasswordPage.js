import React, { useState } from 'react';
import logo from '../../Assets/OCD-logo.png';
import './ForgotPasswordPage.css';

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    alert('Searching for your account...');
    onBack();
  };

  return (
    <div className="forgot-password-page">
      <button className="return-button" onClick={onBack}> 
        &larr;
      </button>
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <img src={logo} alt="OCD Logo" className="forgot-password-logo" />
          <div className="forgot-password-buttons">
            <button className="email-button">Email</button>
            <button className="password-button">Password</button>
            <button className="signin-button">Sign In</button>
          </div>
        </div>

        <div className="forgot-password-form">
          <h2>Find Your Account</h2>
          <p>Please enter your email to search for your account.</p>
          <form onSubmit={handleSearch}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button
                type="button"
                onClick={onBack}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>
        </div>

        <footer className="forgot-password-footer">
          <p>OCD</p>
        </footer>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;