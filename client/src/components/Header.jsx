import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';


function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowDropdown(false);
        setMobileMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Mobile Menu Button - Visible only on mobile via CSS (we'll add class) */}
                    {user && (
                        <button
                            className="mobile-menu-btn"
                            onClick={toggleMobileMenu}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                marginRight: '0.5rem',
                                display: 'none' // Hidden by default, shown in mobile.css
                            }}
                        >
                            ☰
                        </button>
                    )}

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

                    {/* Desktop Navigation */}
                    {user && (
                        <nav className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', marginLeft: '1.5rem' }}>
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                            >
                                Dashboard
                            </Link>
                            {user.email !== 'admin@worksync.com' && (
                                <Link
                                    to="/attendance"
                                    className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}
                                    style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                                >
                                    Attendance
                                </Link>
                            )}
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

                {/* Right Side - Same as before */}
                <div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Notification Bell */}
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
                                >
                                    <Avatar user={user} size="sm" />
                                    <div className="desktop-only" style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{user.role}</div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>▼</span>
                                </div>

                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                            <span>⚙️</span>
                                            <span>Settings</span>
                                        </Link>
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
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && user && (
                <div className="mobile-menu-overlay" style={{
                    position: 'fixed',
                    top: '73px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--pk-surface)',
                    zIndex: 35,
                    padding: '1rem',
                    borderTop: '1px solid var(--pk-border)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                            📊 Dashboard
                        </Link>
                        {user.email !== 'admin@worksync.com' && (
                            <Link to="/attendance" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                📅 Attendance
                            </Link>
                        )}
                        {user.role === 'Admin' && (
                            <>
                                <Link to="/add-user" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                    ➕ Add User
                                </Link>
                                <Link to="/settings" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                    ⚙️ Settings
                                </Link>
                            </>
                        )}
                        <div style={{ padding: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--pk-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Avatar user={user} size="sm" />
                                <div>
                                    <div style={{ fontWeight: '600' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{user.email}</div>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
