import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

function EmployeeDashboard({ user }) {
    const [leaves, setLeaves] = useState([]);
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('auth-token');
        try {
            // Fetch leaves
            const leavesRes = await axios.get('http://localhost:5001/api/leaves', {
                headers: { 'auth-token': token }
            });
            setLeaves(leavesRes.data);

            // Fetch attendance
            if (user?.id) {
                const attendanceRes = await axios.get(`http://localhost:5001/api/attendance/user/${user.id}`);
                setAttendanceRecords(attendanceRes.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.post('http://localhost:5001/api/leaves', {
                reason: leaveReason,
                startDate: leaveStartDate,
                endDate: leaveEndDate
            }, { headers: { 'auth-token': token } });

            showToast("Leave request submitted successfully!", 'success');
            setLeaves([res.data, ...leaves]);
            setLeaveReason('');
            setLeaveStartDate('');
            setLeaveEndDate('');
        } catch (err) {
            showToast("Failed to request leave", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const thisMonthAttendance = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Welcome Card */}
            <div className="card flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-primary-hover))',
                color: 'white',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar avatar-lg">
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h2>
                        <p style={{ opacity: 0.9, margin: 0 }}>Role: {user?.role} {user?.position && `• ${user.position}`}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <h4>📅 Pending Requests</h4>
                    <p className="stat-value">{pendingLeaves}</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <h4>✓ Approved Leaves</h4>
                    <p className="stat-value">{approvedLeaves}</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <h4>📊 This Month</h4>
                    <p className="stat-value">{thisMonthAttendance} days</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <h4>🎯 Total Present</h4>
                    <p className="stat-value">{presentDays}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Request Form */}
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🏖️ Request Leave
                    </h3>
                    <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Reason
                            </label>
                            <input
                                type="text"
                                placeholder="Sick leave, Vacation..."
                                value={leaveReason}
                                onChange={e => setLeaveReason(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-full">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={leaveStartDate}
                                    onChange={e => setLeaveStartDate(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="w-full">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={leaveEndDate}
                                    onChange={e => setLeaveEndDate(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                {/* Leave History */}
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 My Leave History
                    </h3>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reason</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(l => (
                                    <tr key={l._id}>
                                        <td>{l.reason}</td>
                                        <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {leaves.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No leave history found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
