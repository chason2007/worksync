import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnnouncementSection from './AnnouncementSection';
import styles from './AdminDashboard.module.css';

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
            <div className={styles.heroBanner}>
                {/* Decorative circle */}
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                <div className={styles.heroContent}>
                    <p className={styles.greeting}>
                        {greeting()},
                    </p>
                    <h1 className={styles.userName}>
                        {user?.name || 'Admin'} 👋
                    </h1>
                    <p className={styles.subtitle}>
                        Here&apos;s your super-admin overview for WorkSync
                    </p>
                </div>

                <div className={styles.badge}>
                    SUPER ADMIN
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.sectionContainer}>
                <h2 className={styles.sectionTitle}>
                    Quick Actions
                </h2>
                <div className="stats-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            className={styles.actionCard}
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
                            <div className={styles.actionIcon} style={{ background: action.bg, color: action.accent }}>
                                {action.icon}
                            </div>
                            <div>
                                <div className={styles.actionLabel}>
                                    {action.label}
                                </div>
                                <div className={styles.actionDesc}>
                                    {action.description}
                                </div>
                            </div>
                            <div className={styles.actionLink} style={{ color: action.accent }}>
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
                <h2 className={styles.sectionTitle}>
                    Announcements
                </h2>
                <AnnouncementSection />
            </div>
        </div>
    );
}

export default AdminDashboard;
