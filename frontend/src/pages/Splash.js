import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

export default function Splash() {
    const navigate = useNavigate();

    return (
        <div className="splash-container" style={{
            backgroundColor: '#1565c0',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>
                CardioMind AI
            </h1>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <button
                    className="get-started-btn"
                    type="button"
                    onClick={() => navigate("/signup")}
                >
                    Get started
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{
                        background: "transparent",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.8)",
                        padding: "10px 28px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 16,
                    }}
                >
                    I already have an account
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.75)",
                        cursor: "pointer",
                        fontSize: 13,
                        textDecoration: "underline",
                    }}
                >
                    Staff admin
                </button>
            </div>
        </div>
    );
}