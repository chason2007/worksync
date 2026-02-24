import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from './Avatar';
import { formatDateTime } from '../utils/dateUtils';


function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notifications State via Context
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Initial fetch handled by Context, but we can re-fetch on mount if needed or relies on context auto-polling

    // Close Notif Dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setShowNotifDropdown(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);




    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowDropdown(false);
        setMobileMenuOpen(false);
    };

    const isActive = (path) => {
        return globalThis.location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };



    return (
        <header style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)',
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
                    {/* Mobile Menu Button - Visible only on mobile via CSS */}
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
                                display: 'none'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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
                                to="/announcements"
                                className={`nav-link ${isActive('/announcements') ? 'active' : ''}`}
                                style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                            >
                                Announcements
                            </Link>
                            {user.email !== 'admin@worksync.com' && (
                                <Link
                                    to="/leaves"
                                    className={`nav-link ${isActive('/leaves') ? 'active' : ''}`}
                                    style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                                >
                                    Leaves
                                </Link>
                            )}
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
                                <Link
                                    to="/users"
                                    className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                                    style={{ fontWeight: '500', color: 'var(--pk-text-main)', textDecoration: 'none' }}
                                >
                                    Users
                                </Link>
                            )}
                        </nav>
                    )}
                </div>

                {/* Right Side - Same as before */}
                <div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Notification Bell */}
                            <button
                                style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                                ref={notifDropdownRef}
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                aria-label="Notifications"
                            >
                                <span style={{ fontSize: '1.3rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                </span>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}

                                {/* Notification Dropdown */}
                                {showNotifDropdown && (
                                    <div className="dropdown-menu" style={{
                                        right: '-80px',
                                        width: '320px',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid var(--pk-border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Notifications</h4>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {unreadCount > 0 && (
                                                    <button
                                                        style={{ background: 'none', border: 'none', color: 'var(--pk-primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                                        onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                {notifications.length > 0 && (
                                                    <button
                                                        style={{ background: 'none', border: 'none', color: 'var(--pk-danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                                        onClick={(e) => { e.stopPropagation(); clearAllNotifications(); }}
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--pk-text-muted)', fontSize: '0.85rem' }}>
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <button
                                                    key={notif._id}
                                                    className="dropdown-item"
                                                    style={{
                                                        display: 'block',
                                                        background: notif.isRead ? 'transparent' : 'var(--pk-bg)',
                                                        borderLeft: notif.isRead ? 'none' : '3px solid var(--pk-primary)',
                                                        padding: '0.75rem',
                                                        whiteSpace: 'normal',
                                                        lineHeight: '1.4',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        width: '100%'
                                                    }}
                                                    onClick={() => {
                                                        markAsRead(notif._id);
                                                        if (notif.link) {
                                                            navigate(notif.link);
                                                            setShowNotifDropdown(false);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: '500' }}>
                                                        {(() => {
                                                            switch (notif.type) {
                                                                case 'success': return 'Success: ';
                                                                case 'error': return 'Error: ';
                                                                case 'warning': return 'Warning: ';
                                                                default: return 'Info: ';
                                                            }
                                                        })()}
                                                        {notif.message}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--pk-text-muted)' }}>
                                                        {formatDateTime(notif.createdAt)}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </button>

                            {/* User Dropdown */}
                            <div className="dropdown" ref={userDropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--pk-radius-sm)',
                                        transition: 'background 0.2s',
                                        background: 'none',
                                        border: 'none',
                                        color: 'inherit'
                                    }}
                                    aria-haspopup="true"
                                    aria-expanded={showDropdown}
                                >
                                    <Avatar user={user} size="sm" />
                                    <div className="desktop-only" style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{user.role}</div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </span>

                                    {showDropdown && (
                                        <div className="dropdown-menu">
                                            <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <span>My Profile</span>
                                            </Link>
                                            <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <span>Settings</span>
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                                style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
                        </div>
                    )}
                </div>
            </div>




            {/* Mobile Menu Overlay */}
            {
                mobileMenuOpen && user && (
                    <div className="mobile-menu-overlay" style={{
                        position: 'fixed',
                        top: '73px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'var(--pk-surface)',
                        backgroundColor: 'var(--pk-surface)', // Ensure color is applied
                        zIndex: 100, // Increased z-index
                        padding: '1rem',
                        borderTop: '1px solid var(--pk-border)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/announcements" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                Announcements
                            </Link>
                            {user.email !== 'admin@worksync.com' && (
                                <Link to="/leaves" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                    Leaves
                                </Link>
                            )}
                            {user.email !== 'admin@worksync.com' && (
                                <Link to="/attendance" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                    Attendance
                                </Link>
                            )}
                            {user.role === 'Admin' && (
                                <Link to="/users" className="btn" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--pk-text-main)', border: 'none' }}>
                                    Users
                                </Link>
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
                )
            }
        </header >
    );
}

export default Header;
