import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
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
    const { user: currentUser } = useAuth();
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [attendancePage, setAttendancePage] = useState(1);
    const [attendanceMeta, setAttendanceMeta] = useState({ pages: 1, total: 0 });
    const [stats, setStats] = useState({ todayAttendance: 0, pendingLeaves: 0, totalUsers: 0 });

    const [pageLoading, setPageLoading] = useState(true);

    // Initialize with LOCAL date string (YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });

    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

    // ... (existing code for date change) ...

    const handleDateChange = (days) => {
        const result = new Date(selectedDate);
        result.setDate(result.getDate() + days);
        const yyyy = result.getFullYear();
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const dd = String(result.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    // ... (existing state) ...
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Employee', position: '', employeeId: '' });
    const [leaves, setLeaves] = useState([]);
    const [leavePage, setLeavePage] = useState(1);
    const [leaveMeta, setLeaveMeta] = useState({ pages: 1, total: 0 });

    const [editingAttendance, setEditingAttendance] = useState(null);
    const [editAttendanceStatus, setEditAttendanceStatus] = useState('');
    const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Leave Request State
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    const { showToast } = useToast();

    const openModal = (title, message, onConfirm) => {
        setModalConfig({ isOpen: true, title, message, onConfirm });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    const handleEditClick = (user) => {
        setEditingUser(user._id);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position || '',
            employeeId: user.employeeId || ''
        });
    };

    const handleUpdateUser = async () => {
        try {
            const res = await api.put(`/api/admin/users/${editingUser}`, editForm);
            setUsers(users.map(u => u._id === editingUser ? res.data : u));
            setEditingUser(null);
            showToast("User updated successfully", 'success');
        } catch (err) {
            showToast("Failed to update user: " + (err.response?.data?.error || err.message), 'error');
        }
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

    // Initial Load (Users, Stats)
    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true);
            try {
                // Fetch Users
                const usersRes = await api.get('/api/admin/users');
                const visibleUsers = (Array.isArray(usersRes.data) ? usersRes.data : []).filter(u => u.email !== 'admin@worksync.com');
                const sortedUsers = visibleUsers.sort((a, b) => {
                    if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                    if (a.role !== 'Admin' && b.role === 'Admin') return 1;
                    return 0;
                });
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers);

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

    // Search functionality
    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    if (pageLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Skeleton width="200px" height="32px" className="mb-2" />
                        <Skeleton width="150px" height="20px" />
                    </div>
                    <Skeleton width="120px" height="40px" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Skeleton type="card" />
                    <Skeleton type="card" />
                    <Skeleton type="card" />
                </div>

                {/* Table Skeleton */}
                <div className="card">
                    <Skeleton width="150px" height="24px" className="mb-4" />
                    <Skeleton height="300px" />
                </div>
            </div>
        );
    }



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
            // If the admin needs to approve their own leave, it will appear in the 'leaves' list
            // We can optionally add it to the local state if the API returns the full object
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

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            showToast("User deleted successfully", 'success');
        } catch {
            showToast("Failed to delete user", 'error');
        }
    };

    // Export attendance to CSV
    const exportToCSV = () => {
        if (attendanceLogs.length === 0) {
            showToast("No attendance data to export", 'error');
            return;
        }

        // Prepare CSV headers
        const headers = ['Employee Name', 'Email', 'Date', 'Time', 'Status'];

        // Prepare CSV rows
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

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_${selectedDate || 'all'}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

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

            // Refresh logs
            await fetchAttendance();

        } catch (err) {
            console.error('Update attendance error:', err);
            showToast(err.response?.data?.error || 'Failed to update attendance', 'error');
        }
    };

    // Calculate stats
    // Local calculation removed as they are unused and we use fetched stats

    // Tab State
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        {/* Overview Stats */}
                        <div className="stats-grid">
                            {pageLoading ? (
                                <>
                                    <Skeleton type="card" height="120px" />
                                    <Skeleton type="card" height="120px" />
                                    <Skeleton type="card" height="120px" />
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>

                        {/* Recent Activity / Attendance Logs */}
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
                                                <td colSpan="5">
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

                            {/* Attendance Pagination Controls */}
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
                    </>
                );
            case 'users':
                return (
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h3>User Management</h3>
                            <div className="input-group w-64">
                                <span className="input-icon"></span>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Search users"
                                />
                            </div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageLoading ? (
                                        <tr><td colSpan="3"><Skeleton /></td></tr>
                                    ) : (
                                        <>
                                            {filteredUsers.map(u => (
                                                <tr key={u._id}>
                                                    {editingUser === u._id ? (
                                                        <>
                                                            <td colSpan="2">
                                                                <div className="flex-col gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.name}
                                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                        placeholder="Name"
                                                                    />
                                                                    <input
                                                                        type="email"
                                                                        value={editForm.email}
                                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                                        placeholder="Email"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex gap-2">
                                                                    <button onClick={handleUpdateUser} className="btn btn-primary btn-sm">Save</button>
                                                                    <button onClick={() => setEditingUser(null)} className="btn btn-ghost btn-sm">Cancel</button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar user={u} size="sm" />
                                                                    <div>
                                                                        <div className="font-bold">{u.name}</div>
                                                                        <div className="text-sm text-muted">{u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td><StatusBadge status={u.role} /></td>
                                                            <td>
                                                                {(u.role !== 'Admin' || (currentUser && currentUser.email === 'admin@worksync.com')) && (
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => handleEditClick(u)} className="btn btn-ghost p-2">Edit</button>
                                                                        <button
                                                                            onClick={() => openModal(
                                                                                'Delete User',
                                                                                `Are you sure you want to delete ${u.name}?`,
                                                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                                    {u.profileImage ? (
                                                                                        <img
                                                                                            src={u.profileImage.startsWith('data:')
                                                                                                ? u.profileImage
                                                                                                : `${import.meta.env.VITE_API_URL}/uploads/profiles/${u.profileImage}`}
                                                                                            alt={u.name}
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="text-xl font-bold text-gray-500">
                                                                                            {u.name.charAt(0).toUpperCase()}
                                                                                        </span>
                                                                                    )}
                                                                                </div>,
                                                                                () => handleDeleteUser(u._id)
                                                                            )}
                                                                            className="btn btn-ghost p-2 text-danger"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'leaves':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Request Leave Section for Admin */}
                        <div className="card h-fit md:col-span-1">
                            <h3 className="mb-4">Request Leave</h3>
                            <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-muted">Reason</label>
                                    <input
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
                                        <label className="mb-2 block text-sm font-bold text-muted">Start Date</label>
                                        <input
                                            type="date"
                                            value={leaveStartDate}
                                            onChange={e => setLeaveStartDate(e.target.value)}
                                            required
                                            disabled={isSubmittingLeave}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label className="mb-2 block text-sm font-bold text-muted">End Date</label>
                                        <input
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

                        {/* Leave Requests */}
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
                            {/* Leave Pagination Controls */}
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
                );
            case 'announcements':
                return <AnnouncementSection />;
            default:
                return null;
        }
    };

    return (
        <div className="fade-in max-w-screen-xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="mb-2">Admin Dashboard</h1>
                    <p className="text-muted">Manage users, attendance, and leave requests</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => navigate('/add-user')}>
                        + Add Employee
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                {['overview', 'users', 'leaves', 'announcements'].map((tab) => (
                    <button
                        key={tab}
                        className={`py-3 px-6 font-medium text-sm focus:outline-none capitalize transition-colors border-b-2 ${activeTab === tab
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="fade-in">
                {renderTabContent()}
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                danger={true}
            />

            {/* Edit Attendance Modal */}
            {showEditAttendanceModal && editingAttendance && (
                <>
                    <div className="modal-backdrop" onClick={() => setShowEditAttendanceModal(false)} />
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
                                <label className="block mb-2 font-bold text-sm">Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Present', 'Half-day', 'Absent'].map((status) => (
                                        <div
                                            key={status}
                                            className={`stat-card cursor-pointer p-4 items-center justify-center ${editAttendanceStatus === status ? 'bg-primary-50 ring-2 ring-primary-500' : 'bg-surface'}`}
                                            onClick={() => setEditAttendanceStatus(status)}
                                        >
                                            <div className="text-sm font-semibold text-center">
                                                {status}
                                            </div>
                                        </div>
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
