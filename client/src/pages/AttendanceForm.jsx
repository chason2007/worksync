import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/dateUtils';

function AttendanceForm() {
    const [status, setStatus] = useState('Present');
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const checkTodayAttendance = useCallback(async () => {
        if (!user?._id) return;
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/today/${user._id}`, { headers: { 'auth-token': token } });
            if (res.data.hasAttendance) { setHasSubmittedToday(true); setTodayAttendance(res.data.attendance); }
        } catch (error) { console.error('Failed to check attendance:', error); }
    }, [user]);

    const fetchAttendanceHistory = useCallback(async () => {
        if (!user?._id) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/user/${user._id}`);
            setAttendanceHistory((Array.isArray(res.data) ? res.data : []).slice(0, 7));
        } catch (error) { console.error('Failed to fetch history:', error); }
    }, [user]);

    useEffect(() => {
        if (user) { checkTodayAttendance(); fetchAttendanceHistory(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const markAttendance = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/mark`, { userId: user._id || user.id, status }, { headers: { 'auth-token': token } });
            showToast(`Attendance marked as ${status}!`, 'success');
            setHasSubmittedToday(true); setTodayAttendance(res.data); fetchAttendanceHistory();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to mark attendance', 'error');
        } finally { setLoading(false); }
    };

    const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const statusOptions = [
        {
            value: 'Present', label: 'Present', accent: '#10b981', bg: 'rgba(16,185,129,0.08)',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        },
        {
            value: 'Half-day', label: 'Half Day', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" fillOpacity="0.4" /></svg>
        },
        {
            value: 'Absent', label: 'Absent', accent: '#ef4444', bg: 'rgba(239,68,68,0.08)',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        },
    ];

    const presentDays = attendanceHistory.filter(r => r.status === 'Present').length;
    const halfDays = attendanceHistory.filter(r => r.status === 'Half-day').length;

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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

                <div style={{ position: 'relative' }}>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', fontWeight: 500 }}>Daily Check-in</p>
                    <h1 style={{ margin: '0.2rem 0 0.4rem', color: '#fff', fontSize: '1.75rem' }}>Attendance Tracker</h1>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>{formatDate(currentTime)}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 'var(--pk-radius-sm)', padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{formatTime(currentTime)}</div>
                    <div style={{ opacity: 0.7, fontSize: '0.72rem', marginTop: '0.15rem', letterSpacing: '0.05em' }}>LIVE TIME</div>
                </div>
            </div>

            {/* Stats */}
            {attendanceHistory.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <h4 className="stat-label">Present (Last 7 days)</h4>
                        <p className="stat-value text-success">{presentDays}</p>
                    </div>
                    <div className="stat-card">
                        <h4 className="stat-label">Half Days (Last 7 days)</h4>
                        <p className="stat-value text-warning">{halfDays}</p>
                    </div>
                </div>
            )}

            {/* Mark Attendance Card */}
            <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                {hasSubmittedToday ? (
                    <div style={{ padding: '2rem 1rem' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#10b981' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Attendance Marked</h2>
                        <p className="text-muted">
                            You have marked yourself as <strong>{todayAttendance?.status}</strong> for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem' }}>How are you working today?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                            {statusOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    aria-pressed={status === opt.value}
                                    style={{
                                        background: status === opt.value ? opt.bg : 'var(--pk-surface)',
                                        border: status === opt.value ? `2px solid ${opt.accent}` : '2px solid var(--pk-border)',
                                        borderRadius: 'var(--pk-radius)',
                                        padding: '1.25rem 0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: status === opt.value ? opt.accent : 'var(--pk-text-muted)',
                                        transition: 'all 0.15s ease',
                                        fontFamily: 'inherit',
                                        transform: status === opt.value ? 'scale(1.04)' : 'scale(1)',
                                    }}
                                >
                                    {opt.icon}
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={markAttendance}
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', maxWidth: '480px', height: '48px', fontSize: '0.95rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(14,165,233,0.35)' }}
                        >
                            {loading ? 'Submitting…' : 'Submit Attendance'}
                        </button>
                    </>
                )}
            </div>

            {/* History Table */}
            {attendanceHistory.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent History</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Date</th><th>Day</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.map(record => (
                                    <tr key={record._id || record.id || record.date}>
                                        <td>{formatDate(record.date)}</td>
                                        <td>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                                        <td><StatusBadge status={record.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AttendanceForm;