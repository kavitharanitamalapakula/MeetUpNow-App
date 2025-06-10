import React, { useState, useEffect } from 'react';
import Logo from '../assets/Logo.png';
import "../styles/dashboard.css"
import '../styles/header.css';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import Loader from './LandingPage/Loader';
import bubbleSound from '../assets/bubble-sound.wav';

const Header = ({ toggleSidebar }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Create audio object
  const audio = new Audio(bubbleSound);

  useEffect(() => {
    if (showLogoutPopup) {
      audio.play();
    }
  }, [showLogoutPopup]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setShowLogoutPopup(true);
        setTimeout(() => {
          setShowLogoutPopup(false);
          setShowSpinner(true);
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/';
          }, 1500);
        }, 1500);
      })
      .catch((error) => {
        alert('Error during logout: ' + error.message);
      });
  };

  return (
    <>
      <header className="header">
        <div className="left-section" onClick={toggleSidebar} role="button" tabIndex={0} aria-label="Toggle sidebar" style={{ cursor: 'pointer' }}>
          <button className="menu-btn" aria-label="Toggle sidebar">
            &#9776;
          </button>
          <img src={Logo} alt="MeetUpNow Logo" className="logo" />
          <h1 className="app-title">MeetUpNow</h1>
        </div>

        <button className="logout-btn" aria-label="Logout" onClick={handleLogout}>
          Logout
        </button>

        {showLogoutPopup && (
          <div className="logout-popup">
            Logout successful
          </div>
        )}
      </header>

      {showSpinner && (
        <div className="loader-overlay">
          <Loader />
        </div>
      )}
    </>
  );
};

export default Header;
