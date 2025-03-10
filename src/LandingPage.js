import React, { useState, useEffect } from 'react';
import logo from './Assets/OCD-logo.png';
import visionImage from './Assets/Vision.png';
import missionImage from './Assets/Mission.png';
import coreValuesImage from './Assets/OCD-logo.png';
import qualityPolicyImage from './Assets/OCD-logo.png';
import ocdIllustration from './Assets/OCD-illustration.jpg'; // Import the new image
import './LandingPage.css';
import LoginPage from './components/LoginPage/LoginPage';
import SignUpPage from './components/SignUpPage/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage/ForgotPasswordPage';

function LandingPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showSignUpPage, setShowSignUpPage] = useState(false);
  const [showForgotPasswordPage, setShowForgotPasswordPage] = useState(false);

  const updateDateTime = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setCurrentDate(formattedDate);
    setCurrentTime(formattedTime);
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAccount = () => {
    setShowLoginPage(true);
  };

  const handleBackToMain = () => {
    setShowLoginPage(false);
    setShowSignUpPage(false);
    setShowForgotPasswordPage(false);
  };

  const handleSignUp = () => {
    setShowSignUpPage(true);
  };

  const handleBackToLogin = () => {
    setShowSignUpPage(false);
    setShowForgotPasswordPage(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordPage(true);
  };

  return (
    <div className="App">
      {showLoginPage ? (
        showSignUpPage ? (
          <SignUpPage onBack={handleBackToLogin} />
        ) : showForgotPasswordPage ? (
          <ForgotPasswordPage onBack={handleBackToLogin} />
        ) : (
          <LoginPage onBack={handleBackToMain} onSignUp={handleSignUp} onForgotPassword={handleForgotPassword} />
        )
      ) : (
        <>
          <header className="header-small">
            <p>OCD - National Capital Region</p>
          </header>

          <header className="header-large">
            <div className="header-left">
              <img src={logo} className="logo" alt="logo" />
              <div className="header-text">
                <h1>Republic of the Philippines</h1>
                <h2>Department of National Defense</h2>
                <h3>OFFICE OF CIVIL DEFENSE</h3>
              </div>
            </div>

            <div className="header-right">
              <p className="time">{currentTime}</p>
              <p className="date">{currentDate}</p>
            </div>
          </header>

          <section className="content">
            <div className="vision-section">
              <div className="vision-text">
                <h1>VISION</h1>
                <p>Office of Civil Defense is the premier organization in Civil Defense and Disaster Risk Reduction 
                  and Management towards building a safe, secured and resilient Filipino nation by 2030.</p>
              </div>
              <div className="vision-image">
                <img src={visionImage} alt="Vision" />
              </div>
            </div>

            <div className="mission-section">
              <div className="mission-image">
                <img src={missionImage} alt="Mission" />
              </div>
              <div className="mission-text">
                <h1>MISSION</h1>
                <p>To lead in the administration of comprehensive national Civil Defense and Disaster Risk Reduction and 
                  Management programs for adaptive, safer, and disaster resilient communities towards sustainable development.</p>
                </div>
            </div>

            <div className="core-values-section">
              <div className="core-values-text">
                <h1>CORE VALUES</h1>
                <p>Office of Civil Defense is the premier organization in Civil Defense and Disaster Risk Reduction 
                  and Management towards building a safe, secured and resilient Filipino nation by 2030.</p>
              </div>
              <div className="core-values-image">
                <img src={coreValuesImage} alt="Core Values" />
              </div>
            </div>

            <div className="quality-policy-section">
              <div className="quality-policy-image">
                <img src={qualityPolicyImage} alt="Quality Policy" />
              </div>
              <div className="quality-policy-text">
                <h1>QUALITY POLICY</h1>
                <p>The OFFICE OF CIVIL DEFENSE commits to:</p>
                <p>I.   Uphold a culture of excellence, professionalism, integrity, and commitment; </p>
                <p>II.  Comply with legal and applicable requirements; and </p>
                <p>III. Ensure continual improvement of its quality management system. </p>
                <p>To meet the highest level of stakeholder satisfaction in the administration of the country's comprehensive civil defense 
                  and disaster risk reduction and management program for an adaptive, safer, and resilient Filipino community.</p>
                </div>
            </div>

            {/* News Image Section */}
            <div className="news section">
              <img src={ocdIllustration} alt="OCD Illustration" className="full-width-image" />
            </div>

            <div className="social-media section">
              <img src={ocdIllustration} alt="OCD Illustration" className="full-width-image" />
            </div>
          </section>

          {/* About Us Section */}
          <footer className="about-us-section">
            <div className="about-us-content">
              <p>ABOUT US</p>
                <div className="create-account">
                <button className="create-account-button" onClick={handleCreateAccount}>
                  Create Account
                </button>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default LandingPage;