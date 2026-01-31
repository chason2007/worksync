import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

function AttendanceForm() {
    const [status, setStatus] = useState('Present');
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

    const { showToast } = useToast();
    const { user } = useAuth();

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch attendance history and check today's status on mount
    useEffect(() => {
        if (user) {
            checkTodayAttendance();
            fetchAttendanceHistory();
        }
    }, [user]);

    const checkTodayAttendance = async () => {
        if (!user || user._id === undefined) return;
        const userId = user._id || user.id;

        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/attendance/today/${userId}`,
                { headers: { 'auth-token': token } }
            );

            if (response.data.hasAttendance) {
                setHasSubmittedToday(true);
                setTodayAttendance(response.data.attendance);
            }
        } catch (error) {
            console.error('Failed to check today\'s attendance:', error);
        }
    };

    const fetchAttendanceHistory = async () => {
        if (!user || user._id === undefined) return;
        const userId = user._id || user.id;

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/user/${userId}`);
            const records = Array.isArray(response.data) ? response.data : [];
            setAttendanceHistory(records.slice(0, 7)); // Last 7 days
        } catch (error) {
            console.error('Failed to fetch attendance history:', error);
        }
    };

    const markAttendance = async () => {
        if (!user) {
            showToast('User not found. Please log in.', 'error');
            return;
        }

        if (hasSubmittedToday) {
            showToast('You have already submitted attendance for today', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const userId = user._id || user.id;

            await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/mark`, {
                userId: userId,
                status
            }, {
                headers: { 'auth-token': token }
            });

            showToast('Attendance marked successfully!', 'success');
            setHasSubmittedToday(true);
            checkTodayAttendance(); // Refresh today's status
            fetchAttendanceHistory(); // Refresh history
        } catch (error) {
            console.error('Mark attendance error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to mark attendance';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const statusOptions = [
        { value: 'Present', icon: '✓', label: 'Present', emoji: '✅' },
        { value: 'Half-day', icon: '◐', label: 'Half Day', emoji: '⏰' },
        { value: 'Absent', icon: '✕', label: 'Absent', emoji: '❌' }
    ];

    // Calculate quick stats
    const presentDays = attendanceHistory.filter(r => r.status === 'Present').length;
    const halfDays = attendanceHistory.filter(r => r.status === 'Half-day').length;

    return (
        <div className="page-container">
            {/* Header Section */}
            <div className="page-header">
                <h1>Attendance Tracker</h1>
                <p className="subtitle">{formatDate(currentTime)}</p>
                <p className="subtitle" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--pk-primary)', marginTop: '0.5rem' }}>
                    {formatTime(currentTime)}
                </p>
            </div>

            {/* Quick Stats */}
            {attendanceHistory.length > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Present Days</h4>
                        <p className="stat-value">{presentDays}</p>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <h4>Half Days</h4>
                        <p className="stat-value">{halfDays}</p>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                        <h4>Total Records</h4>
                        <p className="stat-value">{attendanceHistory.length}</p>
                    </div>
                </div>
            )}

            {/* Mark Attendance Section */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>
                    {hasSubmittedToday ? '✓ Attendance Already Submitted' : 'Mark Your Attendance'}
                </h3>

                {hasSubmittedToday && todayAttendance && (
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--pk-bg)',
                        borderRadius: 'var(--pk-radius)',
                        marginBottom: '1.5rem',
                        border: '2px solid var(--pk-primary-light)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--pk-text-muted)', fontSize: '0.9rem' }}>
                                Today's Status
                            </p>
                            <StatusBadge status={todayAttendance.status} className="text-lg" />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--pk-text-muted)' }}>
                            Submitted at {new Date(todayAttendance.date).toLocaleTimeString()}
                        </div>
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'var(--pk-warning-light)',
                            borderRadius: 'var(--pk-radius-sm)',
                            textAlign: 'center',
                            fontSize: '0.9rem'
                        }}>
                            ℹ️ You can only submit attendance once per day. Contact an administrator if changes are needed.
                        </div>
                    </div>
                )}

                <div className="status-grid">
                    {statusOptions.map((option) => (
                        <div
                            key={option.value}
                            className={`status-card ${status === option.value ? 'selected' : ''} ${hasSubmittedToday ? 'disabled' : ''}`}
                            onClick={() => !hasSubmittedToday && setStatus(option.value)}
                            style={{
                                cursor: hasSubmittedToday ? 'not-allowed' : 'pointer',
                                opacity: hasSubmittedToday ? 0.5 : 1
                            }}
                        >
                            <span className="status-card-icon">{option.emoji}</span>
                            <h4 className="status-card-title">{option.label}</h4>
                        </div>
                    ))}
                </div>

                <button
                    onClick={markAttendance}
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading || hasSubmittedToday}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {hasSubmittedToday ? 'Submitted' : (loading ? 'Marking...' : 'Mark Attendance')}
                </button>
            </div>

            {/* Attendance History */}
            {attendanceHistory.length > 0 && (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.map((record, index) => (
                                    <tr key={index}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                                        <td>
                                            <StatusBadge status={record.status} />
                                        </td>
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