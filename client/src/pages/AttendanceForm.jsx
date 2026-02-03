import { useState, useEffect } from 'react';
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

    // Update current time (just for header display)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Check today's status & History
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
            console.error('Failed to check attendance:', error);
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
            console.error('Failed to fetch history:', error);
        }
    };

    const markAttendance = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const userId = user._id || user.id;

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/mark`, {
                userId,
                status
            }, { headers: { 'auth-token': token } });

            showToast(`Attendance marked as ${status}! ✅`, 'success');
            setHasSubmittedToday(true);
            setTodayAttendance(res.data);
            fetchAttendanceHistory();
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to mark attendance';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const statusOptions = [
        { value: 'Present', icon: '✓', label: 'Present', emoji: '✅' },
        { value: 'Half-day', icon: '◐', label: 'Half Day', emoji: '⏰' },
        { value: 'Absent', icon: '✕', label: 'Absent', emoji: '❌' }
    ];

    const presentDays = attendanceHistory.filter(r => r.status === 'Present').length;
    const halfDays = attendanceHistory.filter(r => r.status === 'Half-day').length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1>Attendance Tracker</h1>
                <p className="subtitle">{formatDate(currentTime)}</p>
                <p className="subtitle" style={{ color: 'var(--pk-primary)', fontWeight: '600' }}>
                    {formatTime(currentTime)}
                </p>
            </div>

            {/* Stats */}
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
                </div>
            )}

            {/* Attendance Card */}
            <div className="card text-center">
                {hasSubmittedToday ? (
                    <div className="py-8">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {todayAttendance?.status === 'Absent' ? '❌' : todayAttendance?.status === 'Half-day' ? '⏰' : '✅'}
                        </div>
                        <h2 className="mb-2">Attendance Marked</h2>
                        <p className="text-muted">
                            You have marked yourself as <strong>{todayAttendance?.status}</strong> for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <h3 className="mb-4">How are you working today?</h3>
                        <div className="status-grid">
                            {statusOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`status-card ${status === option.value ? 'selected' : ''}`}
                                    onClick={() => setStatus(option.value)}
                                >
                                    <span className="status-card-icon">{option.emoji}</span>
                                    <h4 className="status-card-title">{option.label}</h4>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={markAttendance}
                            className="btn btn-primary w-full py-3 mt-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Attendance 🚀'}
                        </button>
                    </>
                )}
            </div>

            {/* History Table */}
            {attendanceHistory.length > 0 && (
                <div className="card">
                    <h3 className="mb-4">Recent History</h3>
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