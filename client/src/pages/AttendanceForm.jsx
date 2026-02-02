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

        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            const userId = user._id || user.id;

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/mark`, {
                userId: userId,
                status // Sent on Clock In. Ignored by backend on Clock Out.
            }, {
                headers: { 'auth-token': token }
            });

            if (res.data.clockedOut) {
                showToast('Clocked Out Successfully! 👋', 'success');
                setTodayAttendance(res.data.attendance);
            } else {
                showToast('Clocked In Successfully! 🌤️', 'success');
                setTodayAttendance(res.data);
            }

            setHasSubmittedToday(true);
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
            {/* Mark Attendance Section */}
            <div className="card">
                {/* STATE 1: ALREADY CLOCKED OUT (Day Complete) */}
                {todayAttendance && todayAttendance.clockOutTime ? (
                    <div className="text-center">
                        <h3 className="mb-4 text-success">✓ Day Complete</h3>
                        <div className="flex justify-center gap-8 mb-4">
                            <div>
                                <div className="text-sm text-gray-500">Clock In</div>
                                <div className="text-xl font-bold">{new Date(todayAttendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Clock Out</div>
                                <div className="text-xl font-bold">{new Date(todayAttendance.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                            Total Duration: {((new Date(todayAttendance.clockOutTime) - new Date(todayAttendance.clockInTime)) / (1000 * 60 * 60)).toFixed(2)} hrs
                        </div>
                    </div>
                ) : todayAttendance && todayAttendance.status === 'Absent' ? (
                    <div className="text-center">
                        <h3 className="mb-4 text-gray-500">Marked Absent</h3>
                        <p>You have marked yourself as absent for today.</p>
                    </div>
                ) : todayAttendance ? (
                    /* STATE 2: CLOCKED IN (Show Clock Out Button) */
                    <div className="text-center">
                        <h3 className="mb-2">Session Active</h3>
                        <p className="text-gray-500 mb-6">You clocked in at <strong>{todayAttendance.clockInTime ? new Date(todayAttendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time'}</strong></p>

                        <div className="flex justify-center mb-6">
                            <div className="animate-pulse flex items-center gap-2 text-primary font-bold">
                                <span className="w-3 h-3 bg-primary rounded-full"></span>
                                Tracking Time...
                            </div>
                        </div>

                        <button
                            onClick={markAttendance}
                            className="btn btn-danger w-full py-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Clock Out 🛑'}
                        </button>
                    </div>
                ) : (
                    /* STATE 3: NOT CLOCKED IN (Show Clock In) */
                    <>
                        <h3 style={{ marginBottom: '1.5rem' }}>Are you working today?</h3>

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
                            className="btn btn-primary w-full py-3 text-lg"
                            disabled={loading}
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? 'Processing...' : (status === 'Absent' ? 'Mark Absent' : 'Clock In 🚀')}
                        </button>
                    </>
                )}
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