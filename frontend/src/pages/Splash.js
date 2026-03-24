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

            {/* The button is now neatly sized */}
            <button
                className="get-started-btn"
                onClick={() => navigate("/signup")}
            >
                Get Started
            </button>
        </div>
    );
}