import { useEffect, useRef, useState } from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Ensure Bootstrap JS is imported for modal events
import {
    Edit, Check, Linkedin, Github, Mail, Phone, Calendar, Upload
} from "lucide-react";
import '../styles/profileCard.css';
import { baseUrl } from "../App";
import bubbleSound from '../assets/bubble-sound.wav';

// const BASE_URL = "http://localhost:5000/api/users";

function Profile() {
    const [user, setUser] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [showNoFilePopup, setShowNoFilePopup] = useState(false);

    // Create audio object
    const audio = new Audio(bubbleSound);

    // Image Preview
    const inputRef = useRef(null)
    const handleImage = () => {
        const fileObj = inputRef.current.files[0]
        if (fileObj) {
            const url = URL.createObjectURL(fileObj)
            setAvatarPreview(url)
        }
    }

    // Clear file input and avatar preview when modal closes
    useEffect(() => {
        const modalElement = document.getElementById("exampleModal");
        if (!modalElement) return;

        const handleModalClose = () => {
            if (inputRef.current) {
                inputRef.current.value = "";
            }
            setAvatarPreview(null);
        };

        modalElement.addEventListener("hidden.bs.modal", handleModalClose);

        return () => {
            modalElement.removeEventListener("hidden.bs.modal", handleModalClose);
        };
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const id = parsedUser.user._id || parsedUser.user.id;
            if (!id) {
                setError("User ID is missing");
                setLoading(false);
                return;
            }

            fetch(`${baseUrl}/users/profile/${id}`)
                .then(res => res.json())
                .then(data => {
                    setUser(data);
                    setFormData(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError("Failed to load user profile");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[$%&#@]).{8,16}$/;

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));

        if (name === "newPassword") {
            if (!value.trim()) {
                setPasswordError("")
            } else if (!passwordPattern.test(value)) {
                setPasswordError("Password must be 8-16 chars, with uppercase, number & special char.");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSaveField = async (field) => {
        try {
            const res = await fetch(`${baseUrl}/users/profile/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: formData[field] }),
            });
            const updatedUser = await res.json();
            setUser(updatedUser);
            setFormData(updatedUser);
            setEditingField(null);
        } catch (err) {
            alert("Failed to update profile.");
        }
    };

    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/di6hzb7ik/upload";
    const UPLOAD_PRESET = "MeetUpNow";

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            try {
                const cloudinaryData = new FormData();
                cloudinaryData.append("file", file);
                cloudinaryData.append("upload_preset", UPLOAD_PRESET);

                // Upload to Cloudinary
                const cloudinaryRes = await fetch(CLOUDINARY_URL, {
                    method: "POST",
                    body: cloudinaryData,
                });

                if (!cloudinaryRes.ok) {
                    throw new Error("Cloudinary upload failed");
                }

                const cloudinaryResult = await cloudinaryRes.json();
                const imageUrl = cloudinaryResult.secure_url;  // this is the URL to store

                // Now update the user's avatar URL in your backend
                const res = await fetch(`${baseUrl}/users/profile/${user._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar: imageUrl }),
                });

                if (!res.ok) {
                    throw new Error("Failed to update avatar URL in profile");
                }

                const updatedUser = await res.json();
                setUser(updatedUser);
                setFormData(updatedUser);
                setAvatarPreview(null);
            } catch (err) {
                alert(err.message || "Failed to upload avatar.");
            }
        }
    };

    const handleResetPassword = async () => {
        const { newPassword, confirmPassword } = passwordData;

        if (!newPassword || !confirmPassword) {
            alert("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch(`${baseUrl}/users/profile/${user._id}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            if (res.ok) {
                setShowPopup(true);
                setPasswordData({ newPassword: "", confirmPassword: "" });
                setShowPasswordFields(false);
                setTimeout(() => setShowPopup(false), 3000);
            } else {
                alert("Failed to reset password.");
            }
        } catch (err) {
            alert("Error resetting password.");
        }
    };

    const isValidPassword = (password) => {
        return passwordPattern.test(password);
    };

    // Play sound when showPopup or showNoFilePopup changes to true
    useEffect(() => {
        if (showPopup || showNoFilePopup) {
            audio.play();
        }
    }, [showPopup, showNoFilePopup]);

    const renderField = (label, fieldName, icon, isLink = false) => {
        const value = user[fieldName];
        const isDefaultLink =
            (fieldName === "linkedin" && value === "https://www.linkedin.com") ||
            (fieldName === "github" && value === "https://github.com");

        return (
            <p>
                {icon} <strong>{label}:</strong>{" "}
                {editingField === fieldName ? (
                    <>
                        <input
                            name={fieldName}
                            value={formData[fieldName] || ""}
                            onChange={handleChange}
                            className="profile-edit-input"
                        />
                        <button onClick={() => handleSaveField(fieldName)} className="inline-btn">
                            <Check size={16} />
                        </button>
                    </>
                ) : isLink ? (
                    <>
                        {isDefaultLink || !value ? (
                            ""
                        ) : (
                            <a href={value} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", textDecorationColor: "black" }}>
                                {value}
                            </a>
                        )}
                        <button onClick={() => setEditingField(fieldName)} className="inline-btn">
                            <Edit size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        {value || ""}
                        <button onClick={() => setEditingField(fieldName)} className="inline-btn">
                            <Edit size={16} />
                        </button>
                    </>
                )}
            </p>
        );
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }} className="profile-container" >Loading...</div>;
    if (error) return <div className="profile-container error-text">{error}</div>;
    if (!user) return <div className="profile-container">User not found</div>;
    return (
        <div className="profile-container">
            {showPopup && (
                <div className="popup-message" style={{ color: "gray" }}>
                    Password updated successful.
                </div>
            )}
            {showNoFilePopup && (
                <div className="popup-message" style={{ color: "red" ,backgroundColor:"white"}}>
                    No file selected.
                </div>
            )}
            <div className="profile-header">
                <div className="avatar-upload-wrapper">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={avatarPreview || user.avatar || "https://via.placeholder.com/120"}
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <label
                            className="upload-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                        >
                            <Upload size={16} />
                        </label>
                    </div>
                    <h2 className="profile-name">{user.username}</h2>
                    <div
                        className="modal fade"
                        id="exampleModal"
                        tabIndex="-1"
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog custom-modal-dialog">
                            <div className="modal-content custom-modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">Upload Profile Picture</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        onChange={handleImage}
                                        className="custom-file-input"
                                        accept="image/*"
                                    />
                                </div>
                                <div className="modal-footer custom-modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary custom-btn-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary custom-btn-primary"
                                        onClick={async () => {
                                            const file = inputRef.current?.files?.[0];
                                            if (file) {
                                                const e = { target: { files: [file] } };

                                                await handleAvatarChange(e);
                                                document
                                                    .querySelector("#exampleModal .btn.btn-secondary")
                                                    ?.click();
                                                if (inputRef.current) {
                                                    inputRef.current.value = '';
                                                }
                                            } else {
                                                // alert("No file selected.");
                                                setShowNoFilePopup(true);
                                                setTimeout(() => setShowNoFilePopup(false), 3000);
                                            }
                                        }}
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-details">
                    {renderField("Phone", "phone", <Phone size={16} />)}
                    {renderField("LinkedIn", "linkedin", <Linkedin size={16} />, true)}
                    {renderField("GitHub", "github", <Github size={16} />, true)}
                    <p><Mail size={16} /> <strong>Email:</strong> {user.email}</p>
                    {user.joinDate && (
                        <p><Calendar size={16} /> <strong>Joined on</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
                    )}

                    {/* Password Reset Section */}
                    <div className="password-section">
                        {!showPasswordFields ? (
                            <button className="reset-btn" onClick={() => setShowPasswordFields(true)}>
                                Change Password
                            </button>
                        ) : (
                            <>
                                <div className="password-inputs">
                                    <div className="input-with-error">
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="New password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="profile-edit-input"
                                        />
                                        <p className="error-text">
                                            {passwordError}
                                        </p>
                                    </div>
                                    <div className="input-with-error">
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="profile-edit-input"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="reset-btn"
                                    onClick={handleResetPassword}
                                    disabled={!isValidPassword(passwordData.newPassword) || !passwordData.confirmPassword}
                                >
                                    Update
                                </button>
                                <button className="cancel-btn" onClick={() => setShowPasswordFields(false)}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
