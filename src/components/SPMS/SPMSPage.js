import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SPMSPage.css';
import logo from '../../Assets/OCD-main.jpg';

const SPMSPage = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();

    const storedPassword = localStorage.getItem('password');
    if (oldPassword !== storedPassword) {
      setPasswordError('Old password is incorrect.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    localStorage.setItem('password', newPassword);
    setPasswordError('');
    alert('Password updated successfully!');
  };

  return (
    <div className="spms-container">
      <div className="OCD-main-left">
        <img
          src={logo}
          alt="OCD logo"
          className="OCD-vertical-image"
        />
      </div>

      <div className="rightBUTTON-section">
        <div className="header-container">
          <h1 className="ocd-header">OCD</h1>
          <h2 className="spms-header">SUPPLY AND PROPERTY MANAGEMENT SYSTEM</h2>
          <button className="profile-button" onClick={() => setShowProfile(!showProfile)}>
            Profile
          </button>
        </div>

        {showProfile && (
          <div className="profile-section">
            <div className="profile-header">
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Old Password:</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {passwordError && <p className="error-message">{passwordError}</p>}
              <button type="submit" className="update-password-button">
                Update Password
              </button>
            </form>
          </div>
        )}

        <div className="SPMS-button-grid">
          <button className="orange-button" onClick={() => handleNavigation('/office-supplies')}>OFFICE SUPPLIES</button>
          <button className="orange-button">OTHER SUPPLIES</button>
          <button className="orange-button">FUEL AND OTHER LUBRICANT (FOL)</button>
          <button className="orange-button">PROPERTY AND PLANT EQUIPMENT</button>
          <button className="orange-button">SEMI-EXPENDABLE EQUIPMENT</button>
          <button className="orange-button">UN SERVICEABLE EQUIPMENT</button>
        </div>
      </div>
    </div>
  );
};

export default SPMSPage;