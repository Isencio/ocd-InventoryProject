import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import logo from '../../Assets/OCD-logo.png';
import './SignUpPage.css';

function SignUpPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const validatePassword = (password) => {
    const alphanumericRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return alphanumericRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setIsLoading(true);
    
    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    setFirebaseError('');

    // Validate password
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long and include both letters and numbers.');
      setIsLoading(false);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      setVerificationSent(true);

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email,
        emailVerified: false,
        createdAt: new Date(),
        uid: user.uid
      });

    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          console.error('Firebase error:', error);
      }
      setFirebaseError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="signup-page">
        <div className="verification-sent">
          <h2>Verify Your Email</h2>
          <p>We've sent a verification email to <strong>{email}</strong>.</p>
          <p>Please check your inbox and click the verification link to activate your account.</p>
          <button onClick={onBack}>Return to Login</button>
        </div>
      </div>
    );
  }

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
          {firebaseError && (
            <p className="firebase-error">
              {firebaseError}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="first-name">First Name:</label>
            <input
              type="text"
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />

            <label htmlFor="last-name">Last Name:</label>
            <input
              type="text"
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {isSubmitted && passwordError && (
              <p className="password-error">
                {passwordError}
              </p>
            )}

            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
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

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;