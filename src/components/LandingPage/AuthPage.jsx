import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoDesktop from '../../assets/Transparent.png';
import logoMobile from '../../assets/ResponsiveLogo.png';
import "../../styles/authpage.css"
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../../App';
import { googleSignIn, sendPasswordResetEmail } from '../../services/authServices';
import { FcGoogle } from 'react-icons/fc';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        setFadeIn(true);
    }, []);

    const toggleForm = () => {
        setFadeIn(false);
        setError("");
        setFormErrors({ username: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
            setIsLogin(!isLogin);
            setFadeIn(true);
        }, 300);
    };

    const validateField = (name, value) => {
        let error = '';

        if (name === 'username') {
            if (!value.trim()) {
                error = 'Full Name is required';
            }
        }

        if (name === 'email') {
            const emailPattern = /^[a-z\d]+@(gmail|yahoo|outlook)+\.(com|in|org|co)$/;
            if (!value.trim()) {
                error = 'Email is required';
            } else if (!emailPattern.test(value)) {
                error = 'Invalid email format';
            }
        }

        if (name === 'password') {
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[$%&#@]).{8,16}$/;
            if (!value.trim()) {
                error = 'Password is required';
            } else if (!passwordPattern.test(value)) {
                if (!isLogin) {
                    error = 'Password must be 8-16 chars, with uppercase, number & special char';
                } else {
                    error = '';
                }
            }
        }

        if (name === 'confirmPassword') {
            if (!value.trim()) {
                error = 'Confirm password is required';
            } else if (value !== formData.password) {
                error = 'Passwords do not match';
            }
        }

        setFormErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        validateField(id, value);
    };

    const validationForm = () => {
        setError("");

        const fieldsToValidate = isLogin ? ['email', 'password'] : ['username', 'email', 'password', 'confirmPassword'];
        let valid = true;

        fieldsToValidate.forEach(field => {
            validateField(field, formData[field]);
            if (formErrors[field]) {
                valid = false;
            }
        });

        for (let field of fieldsToValidate) {
            if (!formData[field]) {
                valid = false;
                break;
            }
        }

        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validationForm()) {
            setError("");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isLogin ? {
                    email: formData.email,
                    password: formData.password
                } : {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            };

            const endpoint = isLogin ? `${baseUrl}/users/signin` : `${baseUrl}/users/signup`;
            const response = await fetch(endpoint, options);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }

            if (isLogin) {
                localStorage.setItem("userInfo", JSON.stringify(data));
                navigate("/dashboard");
            } else {
                toggleForm();
                setError("Signup successful! Please SignIn");
            }

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");
        try {
            const { user } = await googleSignIn();
            const idToken = await user.getIdToken();

            const res = await fetch(`${baseUrl}/users/google-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: user.displayName,
                    email: user.email,
                    avatar: user.photoURL
                })
            });

            if (!res.ok) {
                throw new Error("Failed to save user in database");
            }

            const result = await res.json();
            localStorage.setItem("userInfo", JSON.stringify(result));
            navigate("/dashboard");
        } catch (error) {
            setError(error.errorMessage || "Google sign-in failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-subContainer">

                <div className="auth-logo-section">
                    <img
                        src={isMobile ? logoMobile : logoDesktop}
                        alt="LinkUp Logo"
                        className={`auth-logo ${fadeIn ? 'fade-in' : ''}`}
                    />
                </div>

                <div className={`auth-form-section ${fadeIn ? 'fade-in' : ''}`}>
                    <div className={`auth-form-container ${fadeIn ? 'fade-in' : ''}`}>
                        <h2 className="auth-title">{isLogin ? 'Sign In' : 'Sign Up'}</h2>

                        {error && (
                            <div style={{ color: error.includes("successful") ? "green" : "red", textAlign: "center" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="username">Full Name<sup style={{ color: "red" }}>*</sup> </label>
                                    <input
                                        id='username'
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter full name"
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={(e) => validateField('username', e.target.value)}
                                    />

                                    {formErrors.username && <p className="error-text">{formErrors.username}</p>}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email address<sup style={{ color: "red" }}>*</sup></label>
                                <input
                                    id='email'
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField('email', e.target.value)}
                                />
                                {formErrors.email && <p className="error-text">{formErrors.email}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password<sup style={{ color: "red" }}>*</sup></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id='password'
                                        type={showPassword ? "text" : "password"}
                                        className="form-input"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={(e) => validateField('password', e.target.value)}
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            color: '#888'
                                        }}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setShowPassword(!showPassword);
                                            }
                                        }}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash size={20} />
                                        ) : (
                                            <FaEye size={20} />
                                        )}
                                    </span>
                                </div>
                                {formErrors.password && <p className="error-text">{formErrors.password}</p>}
                                {isLogin && (
                                    <p
                                        className="forgot-password"
                                        style={{ color: "#007bff", cursor: "pointer", marginTop: "5px", fontSize: "0.9em", textAlign: "end" }}
                                        onClick={async () => {
                                            if (!formData.email) {
                                                setError("Please enter your email to reset password");
                                                return;
                                            }
                                            setIsLoading(true);
                                            setError("");
                                            try {
                                                await sendPasswordResetEmail(formData.email);
                                                setError("Password reset email sent! Please check your inbox.");
                                            } catch (err) {
                                                setError(err.errorMessage || "Failed to send password reset email");
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                    >
                                        Forgot Password?
                                    </p>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password<sup style={{ color: "red" }}>*</sup></label>
                                    <input
                                        id='confirmPassword'
                                        type="password"
                                        className="form-input"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={(e) => validateField('confirmPassword', e.target.value)}
                                    />
                                    {formErrors.confirmPassword && <p className="error-text">{formErrors.confirmPassword}</p>}
                                </div>
                            )}
                            {isLogin && (
                                <div className="auth-continue-options" style={{ marginTop: "10px", textAlign: "center" }}>
                                    <button
                                        type="button"
                                        className="auth-continue-button google"
                                        onClick={handleGoogleSignIn}
                                        style={{
                                            margin: "5px",
                                            padding: "10px 20px",
                                            backgroundColor: "#2c3e50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "1.1rem"
                                        }}
                                    >
                                        <FcGoogle /> Continue with Google
                                    </button>
                                    <button
                                        type="button"
                                        className="auth-continue-button guest"
                                        onClick={async () => {
                                            setIsLoading(true);
                                            setError("");
                                            try {
                                                const options = {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        email: "guest@gmail.com",
                                                        password: "Guest@12"
                                                    })
                                                };
                                                const response = await fetch(`${baseUrl}/users/signin`, options);
                                                const data = await response.json();
                                                if (!response.ok) {
                                                    throw new Error(data.message || "Request failed");
                                                }
                                                localStorage.setItem("userInfo", JSON.stringify(data));
                                                navigate("/dashboard");
                                            } catch (error) {
                                                setError(error.message || "Sign in failed");
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        style={{
                                            margin: "5px",
                                            padding: "10px 20px",
                                            backgroundColor: "#2c3e50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "1.1rem"
                                        }}
                                    >
                                        Continue as Guest
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`auth-button ${isHovering ? 'button-hover' : ''}`}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : isLogin ? 'Sign In' : 'Sign Up'}
                            </button>
                        </form>

                        <p className="auth-toggle-text">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button
                                className="auth-toggle-link"
                                onClick={toggleForm}
                                disabled={isLoading}
                            >
                                {isLogin ? 'Sign Up here' : 'Sign In here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default AuthPage;