import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Chat & Info State
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { text: "Welcome to HeartAI. How can I assist your health journey today?", sender: "ai" }
    ]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const username = localStorage.getItem("userName") || "Radhikamuvva61";

    const slides = [
        { title: "Smart Prevention", content: "30 minutes of brisk walking daily reduces heart risk by 18%." },
        { title: "Clinical Update", content: "Your last BP reading was within the optimal range. Keep it up!" },
        { title: "Dietary Insight", content: "Increasing Magnesium intake can help stabilize heart rhythms." }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleChat = () => {
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "Analysis complete. I recommend checking the 'Predict' tab.", sender: "ai" }]);
        }, 1200);
    };

    return (
        <div className="app-shell">
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="top-nav">
                <div className="nav-left">
                    <button className="menu-icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                    <div className="brand-logo">
                        <span className="heart-icon">❤️</span>
                        <span className="brand-text">HeartAI</span>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="notification-icon">🔔</div>
                    <div className="profile-container" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <div className="avatar">RA</div>
                        {isProfileOpen && (
                            <div className="profile-dropdown-card">
                                <div className="user-info">
                                    <p className="u-name">{username}</p>
                                    <p className="u-role">Patient ID: #8821</p>
                                </div>
                                <hr />
                                <div className="drop-item" onClick={() => navigate('/settings')}>Account Settings</div>
                                <div className="drop-item logout" onClick={handleLogout}>Sign Out</div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- LEFT SIDEBAR (DRAWER) --- */}
            <aside className={`sidebar-drawer ${isMenuOpen ? 'show' : ''}`}>
                <nav className="side-nav-links">
                    <div className="s-link active" onClick={() => navigate('/home')}>🏠 Dashboard</div>
                    <div className="s-link" onClick={() => navigate('/bio')}>📊 Predict Risk</div>
                    <div className="s-link" onClick={() => navigate('/history')}>📜 Medical History</div>
                    <div className="s-link" onClick={() => navigate('/settings')}>⚙️ Settings</div>
                </nav>
                <div className="sidebar-footer">
                    <p>App Version 2.4.0</p>
                </div>
            </aside>

            {/* --- MAIN PAGE CONTENT (CENTERED) --- */}
            <main className="main-viewport">
                <div className="hero-center-content">
                    <section className="welcome-banner">
                        <h1>Good Morning, <span className="blue-text">{username}</span></h1>
                        <p className="tagline">Here is your cardiovascular health summary for today.</p>
                    </section>

                    <div className="info-carousel-card">
                        <div className="carousel-inner">
                            <h3>{slides[currentSlide].title}</h3>
                            <p>{slides[currentSlide].content}</p>
                        </div>
                        <div className="carousel-dots">
                            {slides.map((_, i) => (
                                <span key={i} className={i === currentSlide ? "active-dot" : "dot"}></span>
                            ))}
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button className="primary-action" onClick={() => navigate('/bio')}>
                            Start New Heart Analysis →
                        </button>
                    </div>
                </div>
            </main>

            {/* --- RIGHT BOTTOM CHAT ASSISTANT --- */}
            <div className={`chat-box-fixed ${isChatOpen ? 'expanded' : ''}`}>
                <div className="chat-header-tab" onClick={() => setIsChatOpen(!isChatOpen)}>
                    <span className="status-dot"></span>
                    <span>AI Assistant</span>
                    <span className="arrow">{isChatOpen ? '▼' : '▲'}</span>
                </div>
                {isChatOpen && (
                    <div className="chat-content-area">
                        <div className="chat-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`message-bubble ${m.sender}`}>{m.text}</div>
                            ))}
                        </div>
                        <div className="chat-input-row">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe symptoms..."
                                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                            />
                            <button onClick={handleChat}>➤</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;