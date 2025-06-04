import React, { useState } from 'react';
import Logo from '../assets/Logo.png';
import '../styles/header.css';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

const Header = ({ toggleSidebar }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setShowLogoutPopup(true);
        setTimeout(() => {
          setShowLogoutPopup(false);
          setShowSpinner(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          localStorage.clear()
        }, 2000);
      })
      .catch((error) => {
        alert('Error during logout: ' + error.message);
      });
  };

  return (
    <header className="header">
      <div className="left-section" style={{ cursor: "pointer" }}>
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          &#9776;
        </button>
        <img src={Logo} alt="Logo" className="logo" />
        <h1>MeetUpNow</h1>
      </div>
      <button className="logout-btn" aria-label="Logout" onClick={handleLogout}>
        Logout
      </button>

      {showLogoutPopup && (
        <div className="logout-popup">
          Logout successful 🔑
        </div>
      )}

    </header>
  );
};

export default Header;
