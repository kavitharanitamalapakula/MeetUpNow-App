import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { APP_ID, SERVER_SECRET } from './constants';
import { baseUrl } from '../App';
import '../styles/MeetingRoom.css';

const MeetingRoom = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [user, setUser] = useState(null);
  const [meetingNotFound, setMeetingNotFound] = useState(false);
  const [meetingNotStarted, setMeetingNotStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasStartedMeeting = useRef(false);
  const hasJoinedMeeting = useRef(false);
  const zpInstance = useRef(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const savedToken = userInfo?.token;
    const userId = userInfo.user?.id || userInfo.user?._id;

    if (!savedToken) {
      localStorage.setItem('roomID', meetingId);
      navigate('/');
      return;
    }
    setToken(savedToken);
    localStorage.removeItem('roomID');
    const fetchUser = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }
        const res = await axios.get(`${baseUrl}/users/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate, meetingId]);

  useEffect(() => {
    if (!token) return;

    const fetchMeeting = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/meetings/${meetingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data) {
          setMeetingNotFound(true);
        } else {
          setMeeting(response.data);
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
        setMeetingNotFound(true);
      }
      setLoading(false);
    };

    fetchMeeting();
  }, [token, meetingId]);

  const startMeetByHost = async () => {
    try {
      await axios.post(
        `${baseUrl}/meetings/startmeet/${meetingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error starting meeting:", error);
    }
  };

  const joinMeet = async (email, id) => {
    if (hasJoinedMeeting.current) return;
    hasJoinedMeeting.current = true;

    try {
      const response = await axios.post(
        `${baseUrl}/meetings/joinmeet/${meetingId}`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "Meeting not started yet") {
        setMeetingNotStarted(true);
      }
    } catch (error) {
      if (error.response?.status === 404 && error.response.data.message === "Meeting not started yet") {
        setMeetingNotStarted(true);
        return error.response.data.message;
      } else {
        console.error("Error joining meeting:", error);
      }
    }
  };

  const [deviceError, setDeviceError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

  useEffect(() => {
    const myMeeting = async () => {
      const layout = window.innerHeight > 576;
      if (!user || !meeting) return;
      const isHost = user._id == meeting.host;

      if (isHost && !meeting.isActive && !hasStartedMeeting.current) {
        hasStartedMeeting.current = true;
        await startMeetByHost();
      }

      if (!isHost) {
        const message = await joinMeet(user.email ?? "anonymous@gmail.com", meetingId);
        if (message === "Meeting not started yet") return;
      }
      try {
        const appID = APP_ID;
        const serverSecret = SERVER_SECRET;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          meetingId,
          user._id ?? Date.now().toString(),
          user.username ?? "Guest"
        );

        zpInstance.current = ZegoUIKitPrebuilt.create(kitToken);

        await zpInstance.current.joinRoom({
          container: document.querySelector('.myCallContainer'),
          sharedLinks: [
            {
              name: 'Personal link',
              url: `${window.location.origin}/room/${meetingId}`,
            },
          ],
          scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
          showPreJoinView: true,
          preJoinViewConfig: { title: "Join the Meeting" },
          layout: "Grid",
          showLayoutButton: layout,
          turnOnMicrophoneWhenJoining: false,
          turnOnCameraWhenJoining: true,
          useFrontFacingCamera: true,
          videoResolutionDefault: "720p",
          enableStereo: true,
          showTurnOffRemoteCameraButton: isHost,
          showTurnOffRemoteMicrophoneButton: isHost,
          showRemoveUserButton: isHost,
          videoScreenConfig: 'fill',
        });
        setDeviceError(null);
      } catch (err) {
        console.error("Error initializing meeting:", err);
        if (err.name === 'NotAllowedError' || err.message.includes('NotAllowedError')) {
          setDeviceError('Camera and microphone access was denied. Please allow access and retry.');
        } else {
          setDeviceError('Failed to access media devices. Please check your device and permissions.');
        }
      }
    };

    myMeeting();
  }, [user, meeting, retryCount]);

  const handleRetry = () => {
    setDeviceError(null);
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  if (deviceError) {
    return (
      <div className="room-error">
        <h1>Device Access Error</h1>
        <p>{deviceError}</p>
        <button onClick={handleRetry}>Retry</button>
        <button onClick={() => navigate('/dashboard')}>Go to Home</button>
      </div>
    );
  }

  if (meetingNotFound) {
    return (
      <div className="room-error">
        <h1>
          Meeting Not Found
        </h1>
        <p>The meeting you're trying to join doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Home</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  if (meetingNotFound) {
    return (
      <div className="room-error">
        <h1>
          Meeting Not Found
        </h1>
        <p>The meeting you're trying to join doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Home</button>
      </div>
    );
  }

  if (meetingNotStarted) {
    return (
      <div className="room-error">
        <h1>
          Meeting Not Started
        </h1>
        <p>The host hasn't started the meeting yet. Please wait and try again later.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div id="meeting-container" style={{ width: '100%', height: '100vh' }}>
      <div className='myCallContainer' style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default MeetingRoom;
