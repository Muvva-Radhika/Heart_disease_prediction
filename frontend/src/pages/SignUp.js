import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

export default function SignUp() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ username: "", email: "", password: "" });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        localStorage.setItem("hasSignedUp", "true");
        if (userData.email) {
            localStorage.setItem("userEmail", userData.email.trim());
            localStorage.setItem("userName", (userData.username || userData.email.split("@")[0] || "User").trim());
        }
        alert("Registration Successful!");
        navigate("/login");
    };

    return (
        <div className="card">
            <h3 className="form-title">Sign Up</h3>
            <form onSubmit={handleSignUp} className="neat-form-list">
                <div className="form-row">
                    <label>Username</label>
                    <input type="text" name="username" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Email</label>
                    <input type="email" name="email" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Password</label>
                    <input type="password" name="password" className="form-input" onChange={handleChange} required />
                </div>
                <button type="submit" className="next-btn">Register</button>
                <div className="separator"><span>OR</span></div>
                <button type="button" onClick={() => window.location.href = "https://accounts.google.com"} className="google-btn">
                    Continue with Google
                </button>
            </form>
            <div className="auth-footer">
                <p>Already have an account? <span className="link-text" onClick={() => navigate("/login")}>Login</span></p>
            </div>
        </div>
    );
}