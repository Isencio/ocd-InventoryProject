import React from 'react';
import logo from '../../Assets/OCD-logo.png';
import './LoginPage.css';

function LoginPage({ onBack, onSignUp, onForgotPassword }) {
  return (
    <div className="login-page">
      <button className="return-button" onClick={onBack}>
        &larr;
      </button>
      <div className="login-container">
        <div className="login-logo">
          <img src={logo} alt="OCD Logo" />
        </div>

        <div className="login-form">
          <h2>Login</h2>
          <form>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />

            <button type="submit">Login</button>
          </form>

          <p className="create-account-link">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onSignUp(); }}>
              Sign Up
            </a>
          </p>

          <p className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;