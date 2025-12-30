import React from 'react';

const Header = ({ onOpenSettings }) => {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <div className="logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="logoGradient" x1="0" y1="0" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGradient)" fillOpacity="0.2" />
                            <path d="M16 6L22 12L16 18L10 12L16 6Z" fill="#06b6d4" />
                            <path d="M16 14L22 20L16 26L10 20L16 14Z" fill="#14b8a6" />
                        </svg>
                        <span className="logo-text">Gemini Studio</span>
                    </div>

                    <div className="header-status">
                        {/* Status Badge */}
                        <div className="user-badge">
                            <span>Welcome, <strong>Harister</strong></span>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={onOpenSettings}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                padding: 0
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                            </svg>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
