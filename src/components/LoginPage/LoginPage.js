import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import logo from '../../Assets/OCD-logo.png';
import './LoginPage.css';

function LoginPage({ onBack, onSignUp, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResent(false);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        // Optionally resend verification email
        await sendEmailVerification(user);
        throw new Error('Email not verified. We sent you a new verification link.');
      }

      // Redirect to /spms instead of /dashboard
      navigate('/spms'); // Changed this line
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later.';
          break;
        default:
          if (error.message.includes('Email not verified')) {
            errorMessage = error.message;
            setVerificationResent(true);
          } else {
            console.error('Login error:', error);
          }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setVerificationResent(true);
        setError('Verification email resent. Please check your inbox.');
      }
    } catch (error) {
      setError('Failed to resend verification. Try logging in again.');
    }
  };

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
          {error && (
            <div className={`error-message ${verificationResent ? 'verification-message' : ''}`}>
              {error}
              {error.includes('Email not verified') && (
                <div>
                  <p>Didn&apos;t receive the email?</p>
                  <button 
                    onClick={handleResendVerification}
                    className="resend-button"
                    disabled={verificationResent}
                  >
                    {verificationResent ? 'Sent!' : 'Resend Verification'}
                  </button>
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="create-account-link">
            Don&apos;t have an account?{' '}
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