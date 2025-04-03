import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import logo from '../../Assets/OCD-logo.png';
import './ForgotPasswordPage.css';

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Password reset email sent to ${email}. Check your inbox!`);
    } catch (err) {
      console.error('Password reset error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            <button className="signin-button" onClick={onBack}>
              Sign In
            </button>
          </div>
        </div>

        <div className="forgot-password-form">
          <h2>Reset Your Password</h2>
          <p>Enter your email and we'll send you a link to reset your password.</p>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="form-buttons">
              <button
                type="button"
                onClick={onBack}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="search-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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