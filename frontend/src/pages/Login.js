import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

export default function Login() {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        window.location.href = "https://accounts.google.com/signin";
    };

    return (
        <div className="card">
            <h3 className="form-title">Login</h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                const email = loginData.email.trim();
                if (email) {
                    localStorage.setItem("userEmail", email);
                    localStorage.setItem("userName", email.split("@")[0] || "User");
                }
                navigate("/home");
            }} className="neat-form-list">
                <div className="form-row">
                    <label>Email Address</label>
                    <input type="email" name="email" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Password</label>
                    <input type="password" name="password" className="form-input" onChange={handleChange} required />
                </div>

                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <span className="link-text" style={{ fontSize: '13px', color: '#1565c0', cursor: 'pointer' }}
                        onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <button type="submit" className="next-btn">Login</button>

                <div className="separator" style={{ margin: '20px 0', textAlign: 'center', borderBottom: '1px solid #ddd', lineHeight: '0.1em' }}>
                    <span style={{ background: '#fff', padding: '0 10px', color: '#888' }}>OR</span>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="google-btn" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', cursor: 'pointer' }}>
                    <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" width="20px" alt="G" />
                    Continue with Google
                </button>
            </form>
            <div className="auth-footer">
                <p>New here? <span className="link-text" onClick={() => navigate("/signup")}> Sign Up</span></p>
                <p style={{ marginTop: 10 }}>
                    <span className="link-text" onClick={() => navigate("/admin/login")}>Staff admin</span>
                </p>
            </div>
        </div>
    );
}