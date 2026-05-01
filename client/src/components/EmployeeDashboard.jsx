import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { leaveService } from '../services/leaveService';
import { attendanceService } from '../services/attendanceService';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import AnnouncementSection from './AnnouncementSection';
import { formatDate } from '../utils/dateUtils';
import styles from './EmployeeDashboard.module.css';

const quickActions = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <polyline points="23 11 17 11" /><line x1="20" y1="8" x2="20" y2="14" />
            </svg>
        ),
        label: 'Mark Attendance',
        description: 'Log your attendance for today',
        path: '/attendance',
        accent: 'var(--pk-primary)',
        bg: 'rgba(99,102,241,0.08)',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        label: 'Leave Requests',
        description: 'Request or track your leaves',
        path: '/leaves',
        accent: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
        label: 'My Profile',
        description: 'View and update your details',
        path: '/profile',
        accent: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
    },
];

function EmployeeDashboard({ user }) {
    const [pageLoading, setPageLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ totalPresent: 0, totalHalfDays: 0, thisMonthPresent: 0 });
    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const data = await leaveService.getLeaves(1, 5);
            setLeaves(data.pagination ? data.data : (Array.isArray(data) ? data : []));

            if (user?._id || user?.id) {
                const statsData = await attendanceService.getStats(user._id || user.id);
                setStats(statsData);
            }
        } catch (err) {
            showToast('Failed to load dashboard data: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setPageLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const statItems = [
        { label: 'Pending Leaves', value: leaves.filter(l => l.status === 'Pending').length, color: '#f59e0b' },
        { label: 'Approved Leaves', value: leaves.filter(l => l.status === 'Approved').length, color: '#10b981' },
        { label: 'This Month', value: `${stats.thisMonthPresent}d`, color: 'var(--pk-primary)' },
        { label: 'Total Present', value: stats.totalPresent, color: '#8b5cf6' },
    ];

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div className={styles.heroBanner}>
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                <div className={styles.userInfoContainer}>
                    <div className={styles.avatarWrapper}>
                        <Avatar user={user} size="lg" />
                    </div>
                    <div>
                        <p className={styles.greeting}>{greeting()},</p>
                        <h1 className={styles.userName}>{user?.name} 👋</h1>
                        <p className={styles.userRole}>
                            {user?.role}{user?.position ? ` · ${user.position}` : ''}
                        </p>
                    </div>
                </div>

                <div className={styles.dateContainer}>
                    <div className={styles.dateText}>{formatDate(new Date())}</div>
                    <div>{user?.employeeId || user?.role}</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                {pageLoading ? (
                    <><Skeleton type="card" height="100px" /><Skeleton type="card" height="100px" /><Skeleton type="card" height="100px" /><Skeleton type="card" height="100px" /></>
                ) : statItems.map(s => (
                    <div key={s.label} className="stat-card">
                        <h4 className="stat-label">{s.label}</h4>
                        <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Announcements */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 className={styles.sectionTitle}>Announcements</h2>
                <AnnouncementSection />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className="stats-grid">
                    {quickActions.map(action => (
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
                                <div className={styles.actionLabel}>{action.label}</div>
                                <div className={styles.actionDesc}>{action.description}</div>
                            </div>
                            <div className={styles.actionLink} style={{ color: action.accent }}>
                                Open
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

EmployeeDashboard.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
        role: PropTypes.string,
        position: PropTypes.string,
        employeeId: PropTypes.string,
        profileImage: PropTypes.string,
    }),
};

export default EmployeeDashboard;
