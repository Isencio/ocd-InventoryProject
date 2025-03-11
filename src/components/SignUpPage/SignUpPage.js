import React from 'react';
import logo from '../../Assets/OCD-logo.png';
import './SignUpPage.css';

function SignUpPage({ onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
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

            <label htmlFor="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" name="confirm-password" required />

            <p className="have-account-link">
              Have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
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