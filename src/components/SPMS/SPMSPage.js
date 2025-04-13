import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './SPMSPage.css';
import logo from '../../Assets/OCD-main.jpg';

const SPMSPage = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData({
            ...userDoc.data(),
            email: auth.currentUser.email
          });
        } else {
          setUserData({
            firstName: 'User',
            lastName: '',
            email: auth.currentUser.email
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const toggleProfile = () => {
    if (showProfile) {
      // Clear all password fields when closing profile
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setSuccessMessage('');
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    setShowProfile(!showProfile);
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setSuccessMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Password update error:', error);
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordError('Current password is incorrect');
          break;
        case 'auth/requires-recent-login':
          setPasswordError('Please login again to change your password');
          break;
        default:
          setPasswordError('Failed to update password. Please try again.');
      }
    }
  };

  return (
    <div className="spms-container">
      <div className="OCD-main-left">
        <img src={logo} alt="OCD logo" className="OCD-vertical-image" />
      </div>

      <div className="rightBUTTON-section">
        <div className="header-container">
          <h1 className="ocd-header">OCD</h1>
          <h2 className="spms-header">SUPPLY AND PROPERTY MANAGEMENT SYSTEM</h2>
          <button 
            className="profile-button" 
            onClick={toggleProfile}
          >
            Profile
          </button>
        </div>

        {showProfile && (
          <div className="profile-section">
            <div className="profile-header">
              <div className="user-info">
                {userData && (
                  <>
                    <div className="user-name">
                      {userData.firstName} {userData.lastName}
                    </div>
                    <div className="user-email">
                      {userData.email}
                    </div>
                  </>
                )}
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('old')}
                    aria-label={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {passwordError && <div className="error-message">{passwordError}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <button type="submit" className="update-password-button">
                Update Password
              </button>
            </form>
          </div>
        )}

        <div className="SPMS-button-grid">
          <button className="orange-button" onClick={() => handleNavigation('/office-supplies')}>
            OFFICE SUPPLIES
          </button>
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