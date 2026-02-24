import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import AnnouncementSection from './AnnouncementSection';
import { formatDate } from '../utils/dateUtils';

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
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
        try {
            const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves?page=1&limit=5`, {
                headers: { 'auth-token': token }
            });
            setLeaves(leavesRes.data.pagination ? leavesRes.data.data : (Array.isArray(leavesRes.data) ? leavesRes.data : []));

            if (user?._id || user?.id) {
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/stats/${user._id || user.id}`, {
                    headers: { 'auth-token': token }
                });
                setStats(statsRes.data);
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
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
                    <div style={{ borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }}>
                        <Avatar user={user} size="lg" />
                    </div>
                    <div>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem', fontWeight: 500 }}>{greeting()},</p>
                        <h1 style={{ margin: '0.15rem 0 0.35rem', color: '#fff', fontSize: '1.75rem' }}>{user?.name} 👋</h1>
                        <p style={{ margin: 0, opacity: 0.75, fontSize: '0.85rem' }}>
                            {user?.role}{user?.position ? ` · ${user.position}` : ''}
                        </p>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
                    borderRadius: 'var(--pk-radius-sm)', padding: '0.6rem 1rem',
                    fontSize: '0.8rem', fontWeight: 600, color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)', position: 'relative',
                    textAlign: 'right',
                }}>
                    <div style={{ opacity: 0.8, marginBottom: '0.15rem' }}>{formatDate(new Date())}</div>
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
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--pk-text-main)' }}>Announcements</h2>
                <AnnouncementSection />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--pk-text-main)' }}>Quick Actions</h2>
                <div className="stats-grid">
                    {quickActions.map(action => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            style={{
                                background: 'var(--pk-surface)', border: '1px solid var(--pk-border)',
                                borderRadius: 'var(--pk-radius)', padding: '1.5rem', textAlign: 'left',
                                cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                color: 'inherit', width: '100%',
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
                            <div style={{ width: '52px', height: '52px', borderRadius: 'var(--pk-radius-sm)', background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.accent, flexShrink: 0 }}>
                                {action.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{action.label}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--pk-text-muted)', lineHeight: 1.4 }}>{action.description}</div>
                            </div>
                            <div style={{ marginTop: 'auto', fontSize: '0.78rem', fontWeight: 600, color: action.accent, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
