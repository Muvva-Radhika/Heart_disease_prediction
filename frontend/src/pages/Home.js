import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './Home.css';

function SIcon({ children, ...rest }) {
    return (
        <svg
            className="s-link-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            {...rest}
        >
            {children}
        </svg>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="recharts-custom-tooltip">
            <span className="recharts-custom-tooltip-day">{label}</span>
            <strong className="recharts-custom-tooltip-val">{payload[0].value}%</strong>
            <span className="recharts-custom-tooltip-hint">estimated index</span>
        </div>
    );
}

function riskTone(status) {
    if (!status) return 'neutral';
    const s = String(status).toLowerCase();
    if (s.includes('high')) return 'high';
    if (s.includes('moderate')) return 'moderate';
    if (s.includes('low')) return 'low';
    return 'neutral';
}

function parseRiskPercent(risk) {
    if (risk == null) return null;
    const n = parseInt(String(risk).replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
}

const Home = ({ data }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('welcome');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { text: 'Welcome to HeartAI. How can I assist your health journey today?', sender: 'ai' },
    ]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const username = localStorage.getItem('userName') || 'there';

    const [storedSummary, setStoredSummary] = useState(null);
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('lastPrediction');
            if (raw) setStoredSummary(JSON.parse(raw));
        } catch (_) {}
    }, []);

    const summary = data || storedSummary;
    const riskPct = parseRiskPercent(summary?.risk);
    const statusTone = riskTone(summary?.status);
    const lastAtRaw = sessionStorage.getItem('lastPredictionAt');

    const lastAssessedLabel = useMemo(() => {
        if (!lastAtRaw) return null;
        try {
            return new Date(lastAtRaw).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
        } catch (_) {
            return null;
        }
    }, [lastAtRaw]);

    const trendData = [
        { day: 'Mon', risk: 20 },
        { day: 'Tue', risk: 18 },
        { day: 'Wed', risk: 25 },
        { day: 'Thu', risk: 22 },
        { day: 'Fri', risk: 15 },
        { day: 'Sat', risk: 10 },
        { day: 'Sun', risk: 12 },
    ];

    const slides = [
        { title: 'Smart Prevention', content: 'Thirty minutes of brisk walking most days supports vascular health and healthy blood pressure.' },
        { title: 'Clinical rhythm', content: 'Consistent sleep and stress management are associated with more stable heart rate variability.' },
        { title: 'Nutrition', content: 'A Mediterranean-style pattern—vegetables, olive oil, fish—aligns with long-term cardiovascular outcomes.' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMenuOpen]);

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const avatarLetters = (username || 'U')
        .trim()
        .slice(0, 2)
        .toUpperCase();

    const handleChat = () => {
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: 'user' }]);
        setInput('');
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { text: "I've noted your question. For clinical decisions, use Predict Risk or speak with your care team.", sender: 'ai' },
            ]);
        }, 900);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="app-shell">
            {isMenuOpen ? (
                <button type="button" className="sidebar-backdrop" aria-label="Close menu" onClick={closeMenu} />
            ) : null}

            <header className="top-nav">
                <div className="nav-left">
                    <button type="button" className="menu-icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                        {isMenuOpen ? (
                            <SIcon><path d="M18 6L6 18M6 6l12 12" /></SIcon>
                        ) : (
                            <SIcon><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></SIcon>
                        )}
                    </button>
                    <div className="brand-logo" onClick={() => { setActiveTab('welcome'); closeMenu(); }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('welcome')}>
                        <span className="brand-mark" aria-hidden>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                                <path d="M12 21s-7-4.35-7-10a5 5 0 0110 0 5 5 0 0110 0c0 5.65-7 10-7 10z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="brand-text">HeartAI</span>
                    </div>
                </div>

                <div className="nav-right">
                    <button type="button" className="icon-circle-btn" aria-label="Notifications">
                        <SIcon width={20} height={20}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></SIcon>
                    </button>
                    <div className="profile-container">
                        <button
                            type="button"
                            className="avatar"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            aria-expanded={isProfileOpen}
                            aria-haspopup="true"
                        >
                            {avatarLetters}
                        </button>
                        {isProfileOpen ? (
                            <div className="profile-dropdown-card">
                                <p className="u-name">{username}</p>
                                <p className="u-role">Patient account</p>
                                <hr />
                                <div className="drop-item" role="button" tabIndex={0} onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} onKeyDown={(e) => e.key === 'Enter' && navigate('/settings')}>
                                    Settings
                                </div>
                                <div className="drop-item logout" role="button" tabIndex={0} onClick={() => navigate('/login')}>
                                    Sign out
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            <aside className={`sidebar-drawer ${isMenuOpen ? 'show' : ''}`} aria-hidden={!isMenuOpen}>
                <nav className="side-nav-links">
                    <div
                        className={`s-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); closeMenu(); }}
                        role="button"
                    >
                        <SIcon><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></SIcon>
                        Dashboard
                    </div>
                    <div className="s-link" onClick={() => navigate('/bio')}>
                        <SIcon><path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-3 3" /></SIcon>
                        Predict risk
                    </div>
                    <div className="s-link" onClick={() => navigate('/history')}>
                        <SIcon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></SIcon>
                        Medical history
                    </div>
                    <div className="s-link" onClick={() => navigate('/settings')}>
                        <SIcon><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></SIcon>
                        Settings
                    </div>
                </nav>
                <div className="sidebar-foot">
                    <span className="sidebar-foot-label">Need help?</span>
                    <button type="button" className="sidebar-foot-link" onClick={() => navigate('/recommendations')}>
                        Care guidelines
                    </button>
                </div>
            </aside>

            <main className={`main-viewport ${activeTab === 'dashboard' ? 'main-viewport--dashboard' : ''}`}>
                {activeTab === 'welcome' ? (
                    <div className="hero-center-content">
                        <section className="welcome-banner">
                            <p className="welcome-eyebrow">Personal health</p>
                            <h1>
                                {greeting},{' '}
                                <span className="blue-text">{username}</span>
                            </h1>
                            <p className="welcome-lead">Your cardiovascular summary and tools in one calm, clinical workspace.</p>
                        </section>
                        <div className="info-carousel-card">
                            <div className="carousel-dots" aria-hidden>
                                {slides.map((_, i) => (
                                    <span key={i} className={`carousel-dot ${i === currentSlide ? 'on' : ''}`} />
                                ))}
                            </div>
                            <h3>{slides[currentSlide].title}</h3>
                            <p>{slides[currentSlide].content}</p>
                        </div>
                        <div className="welcome-actions">
                            <button type="button" className="primary-action" onClick={() => navigate('/bio')}>
                                Start heart analysis
                            </button>
                            <button type="button" className="secondary-action" onClick={() => setActiveTab('dashboard')}>
                                Open dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-page">
                        <header className="dashboard-page-header">
                            <div className="dashboard-page-intro">
                                <p className="dashboard-eyebrow">Clinical overview</p>
                                <h1 className="dashboard-heading">Dashboard</h1>
                                <p className="dashboard-sub">
                                    {lastAssessedLabel
                                        ? `Last model run: ${lastAssessedLabel}`
                                        : 'Run an analysis to populate your latest risk profile.'}
                                </p>
                            </div>
                            <div className="dashboard-header-actions">
                                <button type="button" className="btn-dash outline" onClick={() => navigate('/results')}>
                                    View last result
                                </button>
                                <button type="button" className="btn-dash primary" onClick={() => navigate('/bio')}>
                                    New analysis
                                </button>
                            </div>
                        </header>

                        <section className="kpi-deck" aria-label="Key metrics">
                            <article className={`kpi-tile kpi-tile--${statusTone}`}>
                                <span className="kpi-label">Risk classification</span>
                                <div className="kpi-value-row">
                                    <span className={`status-pill status-pill--${statusTone}`}>
                                        {summary?.status || 'Not assessed'}
                                    </span>
                                </div>
                                <p className="kpi-caption">Based on your latest screening inputs and report, where available.</p>
                            </article>
                            <article className="kpi-tile kpi-tile--neutral">
                                <span className="kpi-label">Risk index</span>
                                <div className="kpi-value-row">
                                    <strong className="kpi-stat">{riskPct != null ? `${riskPct}%` : '—'}</strong>
                                </div>
                                {riskPct != null ? (
                                    <div className="risk-track" role="presentation">
                                        <div className="risk-track-fill" style={{ width: `${Math.min(riskPct, 100)}%` }} />
                                    </div>
                                ) : (
                                    <p className="kpi-caption">Complete a prediction to see your numeric index.</p>
                                )}
                            </article>
                            <article className="kpi-tile kpi-tile--accent">
                                <span className="kpi-label">Care note</span>
                                <p className="kpi-summary-text">
                                    {summary?.recommendation
                                        ? summary.recommendation
                                        : 'Recommendations appear here after each analysis. This does not replace medical advice.'}
                                </p>
                            </article>
                        </section>

                        <div className="dashboard-split">
                            <section className="dash-panel dash-panel--chart">
                                <div className="dash-panel-head">
                                    <h2>Activity index (7-day)</h2>
                                    <span className="dash-panel-meta">Illustrative trend — not a diagnosis</span>
                                </div>
                                <div className="chart-surface">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="dashAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--dash-chart)" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="var(--dash-chart)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--dash-grid)" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={8} />
                                            <YAxis hide domain={[0, 'dataMax + 8']} />
                                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--dash-grid-strong)', strokeWidth: 1 }} />
                                            <Area
                                                type="monotone"
                                                dataKey="risk"
                                                stroke="var(--dash-chart)"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#dashAreaFill)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            <aside className="dash-panel dash-panel--side">
                                <h2>Quick actions</h2>
                                <ul className="quick-action-list">
                                    <li>
                                        <button type="button" className="quick-action" onClick={() => navigate('/bio')}>
                                            <span className="quick-action-title">Risk prediction</span>
                                            <span className="quick-action-desc">Clinical parameters and document upload</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" className="quick-action" onClick={() => navigate('/history')}>
                                            <span className="quick-action-title">Past screenings</span>
                                            <span className="quick-action-desc">Review stored assessments</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" className="quick-action" onClick={() => navigate('/recommendations')}>
                                            <span className="quick-action-title">Lifestyle guidance</span>
                                            <span className="quick-action-desc">Education and prevention tips</span>
                                        </button>
                                    </li>
                                </ul>
                                <div className="dash-disclaimer">
                                    <strong>Disclaimer</strong>
                                    <p>HeartAI supports awareness only. Always follow guidance from your licensed clinician.</p>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </main>

            <div className={`chat-box-fixed ${isChatOpen ? 'expanded' : ''}`}>
                <div
                    className="chat-header-tab"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsChatOpen(!isChatOpen);
                        }
                    }}
                >
                    <span className="chat-status-dot" aria-hidden />
                    <span>Assistant</span>
                    <span className="chat-chevron">{isChatOpen ? '▼' : '▲'}</span>
                </div>
                {isChatOpen ? (
                    <div className="chat-content-area">
                        <div className="chat-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`message-bubble ${m.sender}`}>
                                    {m.text}
                                </div>
                            ))}
                        </div>
                        <div className="chat-input-row">
                            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a general question…" onKeyDown={(e) => e.key === 'Enter' && handleChat()} />
                            <button type="button" className="chat-send-btn" onClick={handleChat} aria-label="Send">
                                <SIcon width={18} height={18}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></SIcon>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Home;
