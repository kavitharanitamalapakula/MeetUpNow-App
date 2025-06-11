import React, { useEffect, useRef, useState } from 'react'
import { FaVideo, FaReply } from 'react-icons/fa';
import '../styles/meetingPanel.css';
import axios from 'axios';
import { Modal, Button, Form, Toast } from 'react-bootstrap';
import { Plus, Calendar, Link } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

import bubbleSound from '../assets/bubble-sound.wav';

import { baseUrl } from '../App';
import { fetchWithToken } from '../services/fetchWithToken';

const MeetingPanel = () => {
    const navigate = useNavigate()
    const [meetingId, setMeetingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', datetime: null });
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const panelRef = useRef(null);

    const audioRef = useRef(new Audio(bubbleSound));

    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showOptions]);

    useEffect(() => {
        if (showOptions) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    }, [showOptions]);

    useEffect(() => {
        if (showModal) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    }, [showModal]);

    useEffect(() => {
        if (showConfirmation) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    }, [showConfirmation]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        const now = new Date();
        const selectedDate = formData.datetime;

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!selectedDate) newErrors.datetime = 'Date & time is required';
        else if (selectedDate < now) newErrors.datetime = 'Cannot select a past date/time';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const [roomIdInput, setRoomIdInput] = useState('');

    const handleMeetingRoom = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"))
            // First, create a meeting
            const createResponse = await fetch(`${baseUrl}/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ title: 'Instant Meet', date: new Date().toISOString() }),
            });

            if (!createResponse.ok) {
                const contentType = createResponse.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const errorData = await createResponse.json();
                    throw new Error(errorData.message || 'Failed to create meeting');
                } else {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create meeting: ${errorText}`);
                }
            }

            const createData = await createResponse.json();
            const meetingId = createData.meetingId;
            if (!meetingId) throw new Error('Failed to get meeting ID');

            // Then, start the meeting
            const startResponse = await fetch(`${baseUrl}/meetings/startmeet/${meetingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ title: 'Instant Meet' }),
            });

            if (!startResponse.ok) {
                const contentType = startResponse.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const errorData = await startResponse.json();
                    throw new Error(errorData.message || 'Failed to start meeting');
                } else {
                    const errorText = await startResponse.text();
                    throw new Error(`Failed to start meeting: ${errorText}`);
                }
            }

            const startData = await startResponse.json();
            if (!startData.data.meetingId) throw new Error('Failed to start meeting');

            navigate(`/room/${startData.data.meetingId}`, { state: { roomId: startData.data.meetingId } });
        } catch (err) {
            console.error(err);
            alert(`Failed to start meeting: ${err.message}`);
        }
    }

    const handleJoinMeeting = async () => {
        if (!meetingId.trim()) {
            setError('Please enter a valid meeting ID');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const meetingResponse = await fetch(`${baseUrl}/meetings/${meetingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            if (!meetingResponse.ok) {
                if (meetingResponse.status === 404) {
                    setError('Meeting not found');
                } else {
                    setError('Failed to fetch meeting details');
                }
                setLoading(false);
                return;
            }
            const meetingData = await meetingResponse.json();
            console.log(meetingData.status)
            if (!meetingData.status) {
                setError('Meeting is not active');
                setLoading(false);
                return;
            }
            if (!meetingData.host) {
                setError('Meeting host not found');
                setLoading(false);
                return;
            }
            // Add participant to meeting
            const joinResponse = await fetch(`${baseUrl}/meetings/joinmeet/${meetingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ email: userInfo.email })
            });
            if (!joinResponse.ok) {
                const joinErrorData = await joinResponse.json();
                setError(joinErrorData.message || 'Failed to join meeting');
                setLoading(false);
                return;
            }
            setLoading(false);
            // Navigate to meeting room
            navigate(`/room/${meetingId}`, { state: { roomId: meetingId } });
        } catch (err) {
            setError('An error occurred while joining the meeting');
            setLoading(false);
        }
    }

    const toggleOptions = () => setShowOptions(!showOptions);
    const openModal = () => {
        setShowOptions(false);
        setShowModal(true);
    };
    const handleSubmit = async () => {
        if (validateForm()) {
            const meetingData = {
                title: formData.title,
                description: formData.description,
                date: formData.datetime.toISOString()
            };
            try {
                const response = await fetchWithToken(`/meetings`, {
                    method: 'POST',
                    body: JSON.stringify(meetingData),
                });

                if (typeof onMeetingAdd === 'function') {
                    onMeetingAdd(response);
                }

                setFormData({ title: '', description: '', datetime: null });
                setShowModal(false);
                setShowConfirmation(true);
                setTimeout(() => setShowConfirmation(false), 100000);
            } catch (error) {
                console.error('Error saving meeting:', error.message);
            }
        }
    };
    return (
        <div className="new-meeting-panel">
            <h3 className="title">Video Calls and meetings for everyone</h3>
            <p className="description">
                Connect, collaborate and celebrate from anywhere with MeepUpNow
            </p>
            <button onClick={toggleOptions} className="new-meeting-button">
                <FaVideo className="icon me-3" />
                <span>New Meeting</span>
            </button>
            {showOptions && (
                <div ref={panelRef} className="popup-panel">
                    <button className="popup-option" onClick={openModal}>
                        <Link size={18} className="icon" />
                        Create a meeting for later
                    </button>
                    <button className="popup-option" onClick={handleMeetingRoom} >
                        <Plus size={18} className="icon" />
                        Start Instant Meeting
                    </button>
                </div>
            )}


            {error && (
                <div className="error-message" style={{ color: 'red' }}>
                    <p>{error}</p>
                    {error === 'Meeting is not active' && (
                        <button
                            onClick={handleJoinMeeting}
                            disabled={loading}
                            style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Checking...' : 'Retry'}
                        </button>
                    )}
                </div>
            )}

            <div className="join-meeting-container">
                <input
                    type="text"
                    className="meeting-id-input"
                    placeholder="Enter Meeting ID"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                />
                <button onClick={handleJoinMeeting} className="join-button" disabled={!meetingId.trim() || loading}>
                    <FaReply className="join-icon" />
                    {loading ? 'Joining...' : 'Join'}
                </button>
            </div>

            {/* Bootstrap Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Meeting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                isInvalid={!!errors.title}
                            />
                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mt-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mt-2">
                            <Form.Label>Date & Time</Form.Label>
                            <DatePicker
                                selected={formData.datetime}
                                onChange={(date) => handleChange('datetime', date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={5}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                minDate={new Date()}
                                minTime={
                                    formData.datetime && new Date().toDateString() === formData.datetime.toDateString()
                                        ? new Date()
                                        : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()
                                }
                                maxTime={
                                    (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })()
                                }
                                className={`form-control ${errors.datetime ? 'is-invalid' : ''}`}
                                placeholderText="Select date and time"
                            />
                            {errors.datetime && (
                                <div className="invalid-feedback d-block">{errors.datetime}</div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Popup Toast */}
            {showConfirmation && (
                <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="toast-notification-container"
                >
                    <Toast
                        onClose={() => setShowConfirmation(false)}
                        show={showConfirmation}
                        delay={3000}
                        autohide
                        className="toast-notification"
                    >
                        <Toast.Body>
                            ✅ <strong>Success:</strong> Your meeting has been scheduled!
                        </Toast.Body>
                    </Toast>
                </div>
            )}

        </div>
    )
}

export default MeetingPanel
