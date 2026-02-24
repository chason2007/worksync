import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnnouncementSection from './AnnouncementSection';

const quickActions = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        label: 'Manage Users',
        description: 'Add, edit or remove employees',
        path: '/users',
        accent: 'var(--pk-primary)',
        bg: 'rgba(99,102,241,0.08)',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        label: 'Settings',
        description: 'Configure application preferences',
        path: '/settings',
        accent: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
        ),
        label: 'Announcements',
        description: 'Broadcast messages to all users',
        path: '/announcements',
        accent: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
    },
];

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero greeting */}
            <div style={{
                background: 'linear-gradient(135deg, var(--pk-primary) 0%, #818cf8 100%)',
                borderRadius: 'var(--pk-radius)',
                padding: '2rem 2.5rem',
                marginBottom: '2rem',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circle */}
                <div style={{
                    position: 'absolute', right: '-40px', top: '-40px',
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', right: '60px', bottom: '-60px',
                    width: '140px', height: '140px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative' }}>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem', fontWeight: 500 }}>
                        {greeting()},
                    </p>
                    <h1 style={{ margin: '0.25rem 0 0.5rem', color: '#fff', fontSize: '1.75rem' }}>
                        {user?.name || 'Admin'} 👋
                    </h1>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>
                        Here&apos;s your super-admin overview for WorkSync
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(6px)',
                    borderRadius: 'var(--pk-radius-sm)',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '0.05em',
                    border: '1px solid rgba(255,255,255,0.2)',
                }}>
                    SUPER ADMIN
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--pk-text-main)' }}>
                    Quick Actions
                </h2>
                <div className="stats-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            style={{
                                background: 'var(--pk-surface)',
                                border: '1px solid var(--pk-border)',
                                borderRadius: 'var(--pk-radius)',
                                padding: '1.5rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                color: 'inherit',
                                width: '100%',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px ${action.accent}22`;
                                e.currentTarget.style.borderColor = action.accent;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--pk-border)';
                            }}
                        >
                            <div style={{
                                width: '52px', height: '52px',
                                borderRadius: 'var(--pk-radius-sm)',
                                background: action.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: action.accent,
                                flexShrink: 0,
                            }}>
                                {action.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {action.label}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--pk-text-muted)', lineHeight: 1.4 }}>
                                    {action.description}
                                </div>
                            </div>
                            <div style={{
                                marginTop: 'auto',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: action.accent,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}>
                                Open
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Announcements */}
            <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--pk-text-main)' }}>
                    Announcements
                </h2>
                <AnnouncementSection />
            </div>
        </div>
    );
}

export default AdminDashboard;
