import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Assets/OCD-logo.png';
import './SignUpPage.css';

function SignUpPage({ onBack }) {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validatePassword = (password) => {
    const alphanumericRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return alphanumericRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const password = e.target.elements.password.value;
    const confirmPassword = e.target.elements['confirm-password'].value;

    
    setPasswordError('');
    setConfirmPasswordError('');

    
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long and include both letters and numbers.');
      return;
    }

    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    
    setPasswordError('');
    setConfirmPasswordError('');
    alert('Sign Up Successful!');
    onBack();
  };

  return (
    <div className="signup-page">
      <button className="return-button" onClick={onBack}> 
        &larr;
      </button>
      <div className="signup-container">
        <div className="signup-logo">
          <img src={logo} alt="OCD Logo" />
        </div>

        <div className="signup-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="first-name">First Name:</label>
            <input type="text" id="first-name" name="first-name" required />

            <label htmlFor="last-name">Last Name:</label>
            <input type="text" id="last-name" name="last-name" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
            {isSubmitted && passwordError && (
              <p className="password-error">
                {passwordError}
              </p>
            )}

            <label htmlFor="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" name="confirm-password" required />
            {isSubmitted && confirmPasswordError && (
              <p className="password-error">
                {confirmPasswordError}
              </p>
            )}

            <p className="have-account-link">
              Have an account?{' '}
              <a href="#" className="link-button" onClick={(e) => { e.preventDefault(); onBack(); }}>
                Sign In
              </a>
            </p>

            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;