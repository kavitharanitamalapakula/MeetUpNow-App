import React, { useState, useEffect } from 'react';
import { FaPlay, FaCopy, FaEllipsisV, FaTimesCircle } from 'react-icons/fa';
import '../styles/MeetingSchedule.css';
import { getMeetings, startMeeting } from '../services/meetingServices';
import meetingLogo from '../assets/meeting.png';
import { baseUrl } from '../App';
import { useNavigate } from 'react-router-dom';

const MeetingSchedule = ({ meetings: propMeetings }) => {
  const [meetings, setMeetings] = useState(propMeetings || []);
  const [loading, setLoading] = useState(!propMeetings);
  const [error, setError] = useState(null);
  const [copiedMeetingId, setCopiedMeetingId] = useState(null);
  const [startMessage, setStartMessage] = useState(null);

  const navigate = useNavigate();

  const handleCopyClick = (meetingId) => {
    if (!meetingId) return;
    navigator.clipboard.writeText(meetingId.toString())
      .then(() => {
        setCopiedMeetingId(meetingId);
        setTimeout(() => {
          setCopiedMeetingId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleStartMeeting = async (meetingId) => {
    if (!meetingId.trim()) {
      setStartMessage({ type: 'error', text: 'Please provide a valid meeting ID.' });
      setTimeout(() => setStartMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await startMeeting(meetingId);

      setStartMessage({ type: 'success', text: 'Meeting started successfully.' });
      fetchMeetings();
      setTimeout(() => setStartMessage(null), 3000);

      // Optionally navigate to the meeting room
      navigate(`/room/${meetingId}`, { state: { roomId: meetingId } });
    } catch (error) {
      console.error('Error starting meeting:', error);
      setStartMessage({ type: 'error', text: error.message || 'An error occurred while starting the meeting.' });
      setTimeout(() => setStartMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingStatus = (meeting) => {
    if (meeting.status === "inactive") return "Completed";
    if (meeting.status === "active") return "Now";

    const now = new Date();
    const start = new Date(meeting.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    if (now < start) return "Upcoming";
    else if (now >= start && now <= end) return "Ongoing";
    else return "Completed";
  };

  const getMeetingStatusIcon = (meeting) => {
    const status = getMeetingStatus(meeting);
    if (status === "Upcoming") return <FaPlay />;
    if (status === "Ongoing" || status === "Now") return <FaPlay />;
    return <FaTimesCircle />;
  };

  const fetchMeetings = async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      console.error(err.message);
      setError('Unable to load meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  if (loading) return <p>Loading meetings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="meeting-schedule">
      {copiedMeetingId && (
        <span className="copied-notification">Copied!</span>
      )}
      {startMessage && (
        <div className={`start-message ${startMessage.type}`}>
          {startMessage.text}
        </div>
      )}
      {meetings.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <img src={meetingLogo} alt="MeetingLogo" width={"80%"} height={"20%"} />
          <h4 >No meetings scheduled.</h4>
        </div>
      ) : (
        <div className="meeting-list">
          <h2>Meeting Scheduled</h2>
          <div className='scheduleRoom'>
{meetings.map((meeting) => (
  <div key={meeting.meetingId} className="meeting-card">
    <div className="card-header">
      <h3>{meeting.title}</h3>
      <button className="menu-btn" disabled>
        <FaEllipsisV />
      </button>
    </div>
    <p className="datetime">
      {new Date(meeting.date).toLocaleString()}
    </p>
    <p className={`status ${getMeetingStatus(meeting).toLowerCase()}`}>
      {getMeetingStatusIcon(meeting)} {getMeetingStatus(meeting)}
    </p>
    <p className="description">{meeting.description}</p>
    <div className="card-actions">
      <button className="start-btn" onClick={() => handleStartMeeting(meeting.meetingId)}>
        <FaPlay /> Start
      </button>
      <button
        className="copy-btn"
        onClick={() => handleCopyClick(meeting.meetingId)}
      >
        <FaCopy /> Copy Link
      </button>
    </div>
  </div>
))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingSchedule;
