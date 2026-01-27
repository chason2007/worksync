import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowDropdown(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header style={{
            background: 'var(--pk-surface)',
            borderBottom: '1px solid var(--pk-border)',
            boxShadow: 'var(--pk-shadow)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <img
                            src="/worksync-logo.png"
                            alt="WorkSync Logo"
                            style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'contain'
                            }}
                        />
                        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--pk-text-main)' }}>WorkSync</h2>
                    </Link>

                    {/* Navigation - Middle */}
                    {user && (
                        <nav style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/attendance"
                                className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}
                                style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                            >
                                Attendance
                            </Link>
                            {user.role === 'Admin' && (
                                <>
                                    <Link
                                        to="/add-user"
                                        className={`nav-link ${isActive('/add-user') ? 'active' : ''}`}
                                        style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                                    >
                                        Add User
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
                                        style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                                    >
                                        Settings
                                    </Link>
                                </>
                            )}
                        </nav>
                    )}
                </div>

                {/* Right Side - User / Auth Buttons */}
                <div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Notification Bell (placeholder) */}
                            <div style={{ position: 'relative', cursor: 'pointer' }}>
                                <span style={{ fontSize: '1.3rem' }}>🔔</span>
                                <span className="notification-badge">0</span>
                            </div>

                            {/* User Dropdown */}
                            <div className="dropdown">
                                <div
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--pk-radius-sm)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--pk-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div className="avatar avatar-sm">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div className="desktop-only" style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{user.role}</div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>▼</span>
                                </div>

                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-item" style={{ pointerEvents: 'none', opacity: 0.7 }}>
                                            <span>👤</span>
                                            <span>Profile</span>
                                        </div>
                                        {user.role === 'Admin' && (
                                            <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <span>⚙️</span>
                                                <span>Settings</span>
                                            </Link>
                                        )}
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item" onClick={handleLogout}>
                                            <span>🚪</span>
                                            <span>Sign Out</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    onClick={() => setShowDropdown(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 39
                    }}
                />
            )}
        </header>
    );
}

export default Header;
