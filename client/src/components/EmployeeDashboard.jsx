import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import ConfirmModal from './ConfirmModal';
import { formatDate } from '../utils/dateUtils';

function EmployeeDashboard({ user }) {
    const [pageLoading, setPageLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [leavePage, setLeavePage] = useState(1);
    const [leaveMeta, setLeaveMeta] = useState({ pages: 1, total: 0 });
    const [stats, setStats] = useState({ totalPresent: 0, totalHalfDays: 0, thisMonthPresent: 0 });

    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', action: null });

    const openModal = (title, message, action) => {
        setModalConfig({ title, message, action });
        setIsModalOpen(true);
    };

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendancePage, setAttendancePage] = useState(1);
    const [attendanceMeta, setAttendanceMeta] = useState({ pages: 1, total: 0 });
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, [user, leavePage, attendancePage]);

    const fetchData = async () => {
        const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
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
            // Fetch stats
            if (user?._id || user?.id) {
                const userId = user._id || user.id;
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/stats/${userId}`, {
                    headers: { 'auth-token': token }
                });
                setStats(statsRes.data);
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
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
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

    const handleCancelLeave = async (leaveId) => {
        try {
            const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/leaves/${leaveId}`, {
                headers: { 'auth-token': token }
            });
            showToast('Leave request cancelled successfully', 'success');
            fetchData(); // Refresh list
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to cancel leave', 'error');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Welcome Card */}
            <div className="card flex justify-between items-center bg-gradient-primary" style={{
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
                        {formatDate(new Date())}
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
                            <h4>Pending Requests</h4>
                            <p className="stat-value">{leaves.filter(l => l.status === 'Pending').length}</p>
                        </div>
                        <div className="stat-card bg-gradient-success">
                            <h4>Approved Leaves</h4>
                            <p className="stat-value">{leaves.filter(l => l.status === 'Approved').length}</p>
                        </div>
                        <div className="stat-card bg-gradient-warning">
                            <h4>This Month</h4>
                            <p className="stat-value">{stats.thisMonthPresent} days</p>
                        </div>
                        <div className="stat-card bg-gradient-violet">
                            <h4>Total Present</h4>
                            <p className="stat-value">{stats.totalPresent}</p>
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Request Form */}
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Request Leave
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
                        My Leave History
                    </h3>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reason</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Actions</th>
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
                                                <td>{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                                                <td>
                                                    <StatusBadge status={l.status} />
                                                </td>
                                                <td>
                                                    {l.status === 'Pending' && (
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{ color: 'var(--pk-danger)', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                                            onClick={() => openModal(
                                                                'Cancel Leave Request',
                                                                'Are you sure you want to cancel this pending leave request?',
                                                                () => handleCancelLeave(l._id)
                                                            )}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.length === 0 && (
                                            <tr>
                                                <td colSpan="4">
                                                    <EmptyState
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
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText="Yes, Cancel"
                danger={true}
            />
        </div>

    );
}

export default EmployeeDashboard;
