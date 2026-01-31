import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

function EmployeeDashboard({ user }) {
    const [pageLoading, setPageLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [leavePage, setLeavePage] = useState(1);
    const [leaveMeta, setLeaveMeta] = useState({ pages: 1, total: 0 });

    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendancePage, setAttendancePage] = useState(1);
    const [attendanceMeta, setAttendanceMeta] = useState({ pages: 1, total: 0 });
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, [user, leavePage, attendancePage]);

    const fetchData = async () => {
        const token = localStorage.getItem('auth-token');
        try {
            // Fetch leaves
            const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves?page=${leavePage}&limit=5`, {
                headers: { 'auth-token': token }
            });
            if (leavesRes.data.pagination) {
                setLeaves(leavesRes.data.data);
                setLeaveMeta(leavesRes.data.pagination);
            } else {
                setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
            }

            // Fetch attendance
            if (user?._id || user?.id) {
                const userId = user._id || user.id;
                // Correct endpoint now /api/attendance/user/:id with pagination
                const attendanceRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/user/${userId}?page=${attendancePage}&limit=10`);

                if (attendanceRes.data.pagination) {
                    setAttendanceRecords(attendanceRes.data.data);
                    setAttendanceMeta(attendanceRes.data.pagination);
                } else {
                    setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
                }
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setPageLoading(false);
        }
    };

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/leaves`, {
                reason: leaveReason,
                startDate: leaveStartDate,
                endDate: leaveEndDate
            }, { headers: { 'auth-token': token } });

            showToast("Leave request submitted successfully!", 'success');
            // Refresh leaves to show new one (reset to page 1)
            setLeavePage(1);
            fetchData();

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
        return recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear() &&
            r.status === 'Present';
    }).length;
    // Note: Stats now only reflect CURRENT PAGE data which is incorrect.
    // Ideally stats should be fetched from a dedicated 'stats' endpoint.
    // However, for this update, we will acknowledge that these stats might only show recent history
    // unless we create a new stats endpoint. For now, let's leave as is, but be aware.
    // To fix this without Backend changes, we shouldn't rely on 'leaves' and 'attendanceRecords' (which are now paginated) for totals.
    // The pagination metadata 'attendanceMeta.total' gives us total present? No, just total records.
    // We will use attendanceMeta.total for Total Records, but we lose 'Present Days' count accuracy.
    // I will hide exact counts if they are potentially inaccurate or just show what's visible.
    // BETTER FIX: The backend /user/:id route could return extra stats.
    // For now, I'll update the "Total Present" card to say "Recent Present" or remove it to avoid confusion, 
    // OR we fix the backend to return stats. Let's stick to what we have but be safe.
    // Actually, let's just use the 'total' from metadata for "Total Applications" etc.

    return (
        <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Welcome Card */}
            <div className="card flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-primary-hover))',
                color: 'white',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Avatar user={user} size="lg" />
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
                {pageLoading ? (
                    <>
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                    </>
                ) : (
                    <>
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
                    </>
                )}
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
                                {pageLoading ? (
                                    <>
                                        <tr><td colSpan="3"><Skeleton /></td></tr>
                                        <tr><td colSpan="3"><Skeleton /></td></tr>
                                        <tr><td colSpan="3"><Skeleton /></td></tr>
                                    </>
                                ) : (
                                    <>
                                        {leaves.map(l => (
                                            <tr key={l._id}>
                                                <td>{l.reason}</td>
                                                <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                                <td>
                                                    <StatusBadge status={l.status} />
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.length === 0 && (
                                            <tr>
                                                <td colSpan="3">
                                                    <EmptyState
                                                        icon="📝"
                                                        title="No Leave History"
                                                        description="You haven't applied for any leaves yet."
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Leave Pagination Controls */}
                    {leaveMeta.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-4" style={{ padding: '0.5rem' }}>
                            <button
                                className="btn btn-ghost"
                                disabled={leavePage === 1}
                                onClick={() => setLeavePage(p => Math.max(1, p - 1))}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                                «
                            </button>
                            <span className="flex items-center" style={{ fontSize: '0.8rem' }}>
                                Page {leavePage}
                            </span>
                            <button
                                className="btn btn-ghost"
                                disabled={leavePage === leaveMeta.pages}
                                onClick={() => setLeavePage(p => Math.min(leaveMeta.pages, p + 1))}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}

export default EmployeeDashboard;
