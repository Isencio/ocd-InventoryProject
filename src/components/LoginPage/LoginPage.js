import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Assets/OCD-logo.png';
import './LoginPage.css';

function LoginPage({ onBack, onSignUp, onForgotPassword, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="login-page">
      <button className="return-button" onClick={onBack}> &larr;
       </button>
      <div className="login-container">
        <div className="login-logo">
          <img src={logo} alt="OCD Logo" />
        </div>

        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p className="create-account-link">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onSignUp(); }}>
              Sign Up
            </a>
          </p>

          <p className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword();}}>
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;