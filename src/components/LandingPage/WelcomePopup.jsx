import React, { useState, useEffect } from 'react';
import '../../styles/WelcomePopup.css';
import bubbleSound from '../../assets/bubble-sound.wav';

const WelcomePopup = () => {
  const [username, setUsername] = useState('');
  const [visible, setVisible] = useState(true);

  const audio = new Audio(bubbleSound);

  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo.isAnonymous) {
          setUsername('Guest');
        }
        else if (userInfo.user && userInfo.user.username) {
          setUsername(userInfo.user.username);
        } else if (userInfo.username) {
          setUsername(userInfo.username);
        } else if (userInfo.email) {
          setUsername(userInfo.email);
        } else {
          setUsername('User');
        }
      } catch (error) {
        setUsername('User');
      }
    } else {
      setUsername('User');
    }
  }, []);

  useEffect(() => {
    if (visible) {
      audio.play();
    }
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="welcome-popup">
      <div className="welcome-popup-content">
        <span>🎉 Welcome, {username}!</span>
      </div>
    </div>
  );
};

export default WelcomePopup;
