import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';

function AttendanceForm() {
    const [status, setStatus] = useState('Present');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch attendance history on mount
    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        if (!user || !user.id) return;

        try {
            const response = await axios.get(`http://localhost:5001/api/attendance/user/${user.id}`);
            const records = response.data || [];
            setAttendanceHistory(records.slice(0, 7)); // Last 7 days

            // Check if already marked today
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = records.find(record =>
                new Date(record.date).toISOString().split('T')[0] === today
            );
            setTodayStatus(todayRecord?.status || null);
        } catch (error) {
            console.error('Failed to fetch attendance history:', error);
        }
    };

    const markAttendance = async () => {
        if (!user || !user.id) {
            setToast({ message: 'User not found. Please log in.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5001/api/attendance/mark', {
                userId: user.id,
                status
            });
            setToast({ message: 'Attendance marked successfully!', type: 'success' });
            fetchAttendanceHistory(); // Refresh history
        } catch (error) {
            console.error(error);
            setToast({ message: 'Failed to mark attendance', type: 'error' });
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

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Present':
                return 'badge-success';
            case 'Half-day':
                return 'badge-warning';
            case 'Absent':
                return 'badge-danger';
            default:
                return '';
        }
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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

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
                    {todayStatus ? '✓ Already Marked Today' : 'Mark Your Attendance'}
                </h3>

                {todayStatus && (
                    <div style={{
                        padding: '1rem',
                        background: 'var(--pk-bg)',
                        borderRadius: 'var(--pk-radius-sm)',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, color: 'var(--pk-text-muted)' }}>
                            Today's Status: <span className={`badge ${getStatusBadgeClass(todayStatus)}`}>{todayStatus}</span>
                        </p>
                    </div>
                )}

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
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {loading ? 'Marking...' : 'Mark Attendance'}
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
                                            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                                                {record.status}
                                            </span>
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