import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import AnnouncementSection from './AnnouncementSection';


function AdminDashboard() {
    const navigate = useNavigate();
    useAuth();
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [attendancePage, setAttendancePage] = useState(1);
    const [attendanceMeta, setAttendanceMeta] = useState({ pages: 1, total: 0 });
    const [stats, setStats] = useState({ todayAttendance: 0, pendingLeaves: 0, totalUsers: 0 });

    const [pageLoading, setPageLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [leavePage, setLeavePage] = useState(1);
    const [leaveMeta, setLeaveMeta] = useState({ pages: 1, total: 0 });

    const [editingAttendance, setEditingAttendance] = useState(null);
    const [editAttendanceStatus, setEditAttendanceStatus] = useState('');
    const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Attendance Date State
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

    // Leave Request State (Admins can also request leave)
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    const { showToast } = useToast();


    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    const handleDateChange = (days) => {
        const result = new Date(selectedDate);
        result.setDate(result.getDate() + days);
        const yyyy = result.getFullYear();
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const dd = String(result.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    const fetchAttendance = useCallback(async () => {
        setIsAttendanceLoading(true);
        let attendanceUrl = '/api/attendance';
        if (selectedDate) {
            const [y, m, d] = selectedDate.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0, 0);
            const end = new Date(y, m - 1, d, 23, 59, 59, 999);
            attendanceUrl += `?from=${start.toISOString()}&to=${end.toISOString()}`;
        }
        // Add Pagination
        attendanceUrl += (attendanceUrl.includes('?') ? '&' : '?') + `page=${attendancePage}&limit=20`;

        try {
            const attendanceRes = await api.get(attendanceUrl);
            if (attendanceRes.data.pagination) {
                setAttendanceLogs(attendanceRes.data.data);
                setAttendanceMeta(attendanceRes.data.pagination);
            } else {
                setAttendanceLogs(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            }
        } catch (err) {
            console.error("Failed to fetch attendance", err);
        } finally {
            setIsAttendanceLoading(false);
        }
    }, [selectedDate, attendancePage]);

    // Initial Load (Stats)
    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true);
            try {
                // Fetch Stats
                const statsRes = await api.get('/api/admin/stats');
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
                showToast("Failed to load dashboard data", 'error');
            } finally {
                setPageLoading(false);
            }
        };

        fetchInitialData();
    }, [showToast]);

    // Fetch Attendance Trigger
    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Fetch Leaves Trigger
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const leavesRes = await api.get(`/api/leaves?page=${leavePage}&limit=10`);
                if (leavesRes.data.pagination) {
                    setLeaves(leavesRes.data.data);
                    setLeaveMeta(leavesRes.data.pagination);
                } else {
                    setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
                }
            } catch (err) {
                console.error("Failed to fetch leaves", err);
            }
        };
        fetchLeaves();
    }, [leavePage]);

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        setIsSubmittingLeave(true);

        try {
            const res = await api.post('/api/leaves', {
                reason: leaveReason,
                startDate: leaveStartDate,
                endDate: leaveEndDate
            });

            showToast("Leave request submitted successfully!", 'success');
            setLeaves([res.data, ...leaves]);
            setLeaveReason('');
            setLeaveStartDate('');
            setLeaveEndDate('');
        } catch {
            showToast("Failed to request leave", 'error');
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    const updateLeaveStatus = async (id, status) => {
        try {
            const res = await api.put(`/api/leaves/${id}`, { status });
            setLeaves(leaves.map(l => l._id === id ? res.data : l));
            showToast(`Leave ${status.toLowerCase()} successfully`, 'success');
        } catch {
            showToast("Failed to update status", 'error');
        }
    };

    // Export attendance to CSV
    const exportToCSV = () => {
        if (attendanceLogs.length === 0) {
            showToast("No attendance data to export", 'error');
            return;
        }

        const headers = ['Employee Name', 'Email', 'Date', 'Time', 'Status'];
        const rows = attendanceLogs.map(log => {
            const date = new Date(log.date);
            return [
                log.userId?.name || 'Unknown',
                log.userId?.email || 'N/A',
                formatDate(date),
                date.toLocaleTimeString(),
                log.status
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_${selectedDate || 'all'}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        link.remove();

        showToast(`Exported ${attendanceLogs.length} attendance records`, 'success');
    };

    // Edit Attendance Handlers
    const openEditAttendanceModal = (log) => {
        setEditingAttendance(log);
        setEditAttendanceStatus(log.status);
        setShowEditAttendanceModal(true);
    };

    const handleUpdateAttendance = async () => {
        if (!editingAttendance) return;

        try {
            await api.put(`/api/attendance/${editingAttendance._id}`, {
                status: editAttendanceStatus
            });

            showToast(`Attendance updated for ${editingAttendance.userId?.name || 'User'}`, 'success');
            setShowEditAttendanceModal(false);
            setEditingAttendance(null);
            await fetchAttendance();
        } catch (err) {
            console.error('Update attendance error:', err);
            showToast(err.response?.data?.error || 'Failed to update attendance', 'error');
        }
    };

    if (pageLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Skeleton width="200px" height="32px" className="mb-2" />
                        <Skeleton width="150px" height="20px" />
                    </div>
                    <Skeleton width="120px" height="40px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Skeleton type="card" />
                    <Skeleton type="card" />
                    <Skeleton type="card" />
                </div>
                <div className="card">
                    <Skeleton width="150px" height="24px" className="mb-4" />
                    <Skeleton height="300px" />
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="mb-2">Admin Dashboard</h1>
                    <p className="text-muted">Manage attendance and leave requests</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => navigate('/users')}>
                        Manage Users
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8 fade-in">
                <AnnouncementSection />

                <div className="stats-grid">
                    <div className="stat-card">
                        <h4 className="stat-label">Today's Attendance</h4>
                        <p className="stat-value text-success">{stats.todayAttendance}</p>
                    </div>
                    <div className="stat-card">
                        <h4 className="stat-label">Pending Leaves</h4>
                        <p className="stat-value text-warning">{stats.pendingLeaves}</p>
                    </div>
                    <div className="stat-card">
                        <h4 className="stat-label">Total Users</h4>
                        <p className="stat-value text-primary">{stats.totalUsers}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3>Attendance Logs</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToCSV}
                                className="btn btn-secondary"
                                disabled={attendanceLogs.length === 0}
                            >
                                Export CSV
                            </button>
                            <div className="flex items-center gap-2">
                                <button className="btn btn-ghost p-2" onClick={() => handleDateChange(-1)} title="Previous Day">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-auto"
                                    aria-label="Filter attendance by date"
                                />
                                <button className="btn btn-ghost p-2" onClick={() => handleDateChange(1)} title="Next Day">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`table-container ${isAttendanceLoading ? 'opacity-50 pointer-events-none' : ''}`} style={{ transition: 'opacity 0.2s' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date/Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceLogs.map(log => (
                                    <tr key={log._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar user={log.userId} size="sm" />
                                                <div>
                                                    <div className="font-bold">{log.userId?.name || 'Unknown'}</div>
                                                    <div className="text-sm text-muted">{log.userId?.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>{formatDateTime(log.date)}</div>
                                            {(log.modifiedBy || log.modifiedAt) && (
                                                <div className="text-sm text-muted">
                                                    Edited {log.modifiedAt && formatDate(log.modifiedAt)}
                                                </div>
                                            )}
                                        </td>
                                        <td><StatusBadge status={log.status} /></td>
                                        <td>
                                            <button
                                                onClick={() => openEditAttendanceModal(log)}
                                                className="btn btn-ghost"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {attendanceLogs.length === 0 && !isAttendanceLoading && (
                                    <tr>
                                        <td colSpan="4">
                                            <EmptyState
                                                title="No Attendance"
                                                message={`No records for ${formatDate(selectedDate)}.`}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {attendanceMeta.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                className="btn btn-ghost"
                                disabled={attendancePage === 1}
                                onClick={() => setAttendancePage(p => Math.max(1, p - 1))}
                            >
                                « Previous
                            </button>
                            <span className="flex items-center text-sm text-muted">
                                Page {attendancePage} of {attendanceMeta.pages}
                            </span>
                            <button
                                className="btn btn-ghost"
                                disabled={attendancePage === attendanceMeta.pages}
                                onClick={() => setAttendancePage(p => Math.min(attendanceMeta.pages, p + 1))}
                            >
                                Next »
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card h-fit md:col-span-1">
                        <h3 className="mb-4">Request Leave</h3>
                        <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="leaveReason" className="mb-2 block text-sm font-bold text-muted">Reason</label>
                                <input
                                    id="leaveReason"
                                    type="text"
                                    placeholder="Meeting, Personal..."
                                    value={leaveReason}
                                    onChange={e => setLeaveReason(e.target.value)}
                                    required
                                    disabled={isSubmittingLeave}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-full">
                                    <label htmlFor="leaveStartDate" className="mb-2 block text-sm font-bold text-muted">Start Date</label>
                                    <input
                                        id="leaveStartDate"
                                        type="date"
                                        value={leaveStartDate}
                                        onChange={e => setLeaveStartDate(e.target.value)}
                                        required
                                        disabled={isSubmittingLeave}
                                    />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="leaveEndDate" className="mb-2 block text-sm font-bold text-muted">End Date</label>
                                    <input
                                        id="leaveEndDate"
                                        type="date"
                                        value={leaveEndDate}
                                        onChange={e => setLeaveEndDate(e.target.value)}
                                        required
                                        disabled={isSubmittingLeave}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-2"
                                disabled={isSubmittingLeave}
                            >
                                {isSubmittingLeave ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>

                    <div className="card md:col-span-2">
                        <h3 className="mb-4">Leave Requests</h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Reason</th>
                                        <th>Dates</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map(l => (
                                        <tr key={l._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <Avatar user={l.userId} size="sm" />
                                                    <span className="font-bold">{l.userId?.name}</span>
                                                </div>
                                            </td>
                                            <td>{l.reason}</td>
                                            <td>{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                                            <td><StatusBadge status={l.status} /></td>
                                            <td>
                                                {l.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateLeaveStatus(l._id, 'Approved')} className="btn btn-primary py-1 px-3">Approve</button>
                                                        <button onClick={() => updateLeaveStatus(l._id, 'Rejected')} className="btn btn-danger py-1 px-3">Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.length === 0 && (
                                        <tr>
                                            <td colSpan="5">
                                                <EmptyState
                                                    title="No Leave Requests"
                                                    message="There are no pending leave requests at the moment."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {leaveMeta.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    className="btn btn-ghost"
                                    disabled={leavePage === 1}
                                    onClick={() => setLeavePage(p => Math.max(1, p - 1))}
                                >
                                    « Previous
                                </button>
                                <span className="flex items-center text-sm text-muted">
                                    Page {leavePage} of {leaveMeta.pages}
                                </span>
                                <button
                                    className="btn btn-ghost"
                                    disabled={leavePage === leaveMeta.pages}
                                    onClick={() => setLeavePage(p => Math.min(leaveMeta.pages, p + 1))}
                                >
                                    Next »
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                danger={true}
            />

            {showEditAttendanceModal && editingAttendance && (
                <>
                    <button
                        type="button"
                        className="modal-backdrop"
                        onClick={() => setShowEditAttendanceModal(false)}
                        aria-label="Close modal"
                    />
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Attendance</h3>
                            <button
                                className="btn btn-ghost p-2"
                                onClick={() => setShowEditAttendanceModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted mb-4">
                                Updating attendance for <strong>{editingAttendance.userId?.name}</strong>
                                <br />
                                <span className="text-sm">
                                    Original Date: {formatDateTime(editingAttendance.date)}
                                </span>
                            </p>
                            <div>
                                <span className="block mb-2 font-bold text-sm">Status</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Present', 'Half-day', 'Absent'].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            className={`stat-card cursor-pointer p-4 items-center justify-center ${editAttendanceStatus === status ? 'bg-primary-50 ring-2 ring-primary-500' : 'bg-surface'}`}
                                            onClick={() => setEditAttendanceStatus(status)}
                                        >
                                            <div className="text-sm font-semibold text-center">
                                                {status}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={() => setShowEditAttendanceModal(false)} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button type="button" onClick={handleUpdateAttendance} className="btn btn-primary">
                                Update
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
