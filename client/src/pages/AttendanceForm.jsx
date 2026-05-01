import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/dateUtils';
import styles from './AttendanceForm.module.css';

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
            const data = await attendanceService.getTodayAttendance(user._id);
            if (data.hasAttendance) { 
                setHasSubmittedToday(true); 
                setTodayAttendance(data.attendance); 
            }
        } catch (error) { 
            console.error('Failed to check attendance:', error); 
        }
    }, [user]);

    const fetchAttendanceHistory = useCallback(async () => {
        if (!user?._id) return;
        try {
            const data = await attendanceService.getUserLogs(user._id);
            setAttendanceHistory((Array.isArray(data.data) ? data.data : []).slice(0, 7));
        } catch (error) { 
            console.error('Failed to fetch history:', error); 
        }
    }, [user]);

    useEffect(() => {
        if (user) { 
            checkTodayAttendance(); 
            fetchAttendanceHistory(); 
        }
    }, [user, checkTodayAttendance, fetchAttendanceHistory]);

    const markAttendance = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const data = await attendanceService.markAttendance(status);
            showToast(`Attendance marked as ${status}!`, 'success');
            setHasSubmittedToday(true); 
            setTodayAttendance(data); 
            fetchAttendanceHistory();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to mark attendance', 'error');
        } finally { 
            setLoading(false); 
        }
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
            <div className={styles.heroBanner}>
                <div className={styles.heroDecoTop} />
                <div className={styles.heroDecoBottom} />

                <div className={styles.heroContent}>
                    <p className={styles.heroCategory}>Daily Check-in</p>
                    <h1 className={styles.heroTitle}>Attendance Tracker</h1>
                    <p className={styles.heroSubtitle}>{formatDate(currentTime)}</p>
                </div>

                <div className={styles.liveTimeContainer}>
                    <div className={styles.liveTime}>{formatTime(currentTime)}</div>
                    <div className={styles.liveTimeLabel}>LIVE TIME</div>
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
            <div className={`card ${styles.attendanceCard}`}>
                {hasSubmittedToday ? (
                    <div className={styles.markedContainer}>
                        <div className={styles.markedIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 className={styles.markedTitle}>Attendance Marked</h2>
                        <p className="text-muted">
                            You have marked yourself as <strong>{todayAttendance?.status}</strong> for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className={styles.sectionTitle}>How are you working today?</h2>
                        <div className={styles.optionsGrid}>
                            {statusOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    aria-pressed={status === opt.value}
                                    className={styles.optionButton}
                                    style={{
                                        background: status === opt.value ? opt.bg : 'var(--pk-surface)',
                                        border: status === opt.value ? `2px solid ${opt.accent}` : '2px solid var(--pk-border)',
                                        color: status === opt.value ? opt.accent : 'var(--pk-text-muted)',
                                        transform: status === opt.value ? 'scale(1.04)' : 'scale(1)',
                                    }}
                                >
                                    {opt.icon}
                                    <span className={styles.optionLabel}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={markAttendance}
                            className={`btn btn-primary ${styles.submitBtn}`}
                            disabled={loading}
                        >
                            {loading ? 'Submitting…' : 'Submit Attendance'}
                        </button>
                    </>
                )}
            </div>

            {/* History Table */}
            {attendanceHistory.length > 0 && (
                <div className="card">
                    <h2 className={styles.historyTitle}>Recent History</h2>
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