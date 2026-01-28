import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Initialize with LOCAL date string (YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Employee', position: '', employeeId: '' });
    const [leaves, setLeaves] = useState([]);
    const [passwordResets, setPasswordResets] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUserId, setResetUserId] = useState(null);
    const [resetUserName, setResetUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [editAttendanceStatus, setEditAttendanceStatus] = useState('');
    const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
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
            const token = localStorage.getItem('auth-token');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${editingUser}`, editForm, {
                headers: { 'auth-token': token }
            });
            setUsers(users.map(u => u._id === editingUser ? res.data : u));
            setEditingUser(null);
            showToast("User updated successfully", 'success');
        } catch (err) {
            showToast("Failed to update user: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    const fetchAttendance = async () => {
        const token = localStorage.getItem('auth-token');
        let attendanceUrl = `${import.meta.env.VITE_API_URL}/api/attendance`;
        if (selectedDate) {
            const [y, m, d] = selectedDate.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0, 0);
            const end = new Date(y, m - 1, d, 23, 59, 59, 999);
            attendanceUrl += `?from=${start.toISOString()}&to=${end.toISOString()}`;
        }
        try {
            const attendanceRes = await axios.get(attendanceUrl, { headers: { 'auth-token': token } });
            setAttendanceLogs(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        } catch (err) {
            console.error("Failed to fetch attendance", err);
        }
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            setPageLoading(true);
            const token = localStorage.getItem('auth-token');
            try {
                await fetchAttendance();

                // Fetch Users
                const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { 'auth-token': token } });
                const visibleUsers = (Array.isArray(usersRes.data) ? usersRes.data : []).filter(u => u.email !== 'admin@worksync.com');
                const sortedUsers = visibleUsers.sort((a, b) => {
                    if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                    if (a.role !== 'Admin' && b.role === 'Admin') return 1;
                    return 0;
                });
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers);

                // Fetch Leaves
                const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, { headers: { 'auth-token': token } });
                setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);

                // Fetch Password Resets
                const resetsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/password-resets`, { headers: { 'auth-token': token } });
                setPasswordResets(Array.isArray(resetsRes.data) ? resetsRes.data : []);

            } catch (err) {
                console.error("Failed to fetch admin data", err);
                showToast("Failed to load dashboard data", 'error');
            } finally {
                setPageLoading(false);
            }
        };

        fetchAdminData();
    }, [selectedDate]);

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

    const updateLeaveStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/leaves/${id}`, { status }, { headers: { 'auth-token': token } });
            setLeaves(leaves.map(l => l._id === id ? res.data : l));
            showToast(`Leave ${status.toLowerCase()} successfully`, 'success');
        } catch (err) {
            showToast("Failed to update status", 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
                headers: { 'auth-token': token }
            });
            setUsers(users.filter(u => u._id !== id));
            showToast("User deleted successfully", 'success');
        } catch (err) {
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
                date.toLocaleDateString(),
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

    // Generate random password
    const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setNewPassword(password);
        showToast('Password generated!', 'success');
    };

    // Open reset password modal
    const openResetModal = (userId, userName) => {
        console.log('Opening reset modal for:', userId, userName);
        setResetUserId(userId);
        setResetUserName(userName);
        setNewPassword('');
        setShowResetModal(true);
    };

    // Close reset modal and clean up
    const closeResetModal = () => {
        setShowResetModal(false);
        setCurrentRequestId(null);
        setNewPassword('');
    };

    // Reset user password
    const handleResetPassword = async () => {
        if (!newPassword) {
            showToast('Please enter a new password', 'error');
            return;
        }

        setResetLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            // 1. Reset Password
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/users/${resetUserId}/reset-password`,
                { newPassword },
                { headers: { 'auth-token': token } }
            );

            showToast(`Password reset successfully for ${resetUserName}`, 'success');

            // 2. If this was from a request, mark it as completed
            if (currentRequestId) {
                console.log('Marking request as completed:', currentRequestId);
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/admin/password-resets/${currentRequestId}/complete`,
                    {},
                    { headers: { 'auth-token': token } }
                );

                // Refresh password resets list
                const resetsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/password-resets`, { headers: { 'auth-token': token } });
                setPasswordResets(resetsRes.data);
                setCurrentRequestId(null);
            }

            setShowResetModal(false);
            setNewPassword('');
        } catch (err) {
            console.error('Reset password error:', err);
            showToast(err.response?.data?.error || 'Failed to reset password', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    // State for request ID
    const [currentRequestId, setCurrentRequestId] = useState(null);

    // Complete password reset request (Step 1: Open Modal)
    const completeResetRequest = (requestId, userId, userName) => {
        console.log('Starting reset flow for request:', requestId);
        setCurrentRequestId(requestId);
        openResetModal(userId, userName);
    };

    // Copy password to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(newPassword);
        showToast('Password copied to clipboard!', 'success');
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
            const token = localStorage.getItem('auth-token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/${editingAttendance._id}`, {
                status: editAttendanceStatus
            }, {
                headers: { 'auth-token': token }
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
    // Count all visible users (Employees + Regular Admins) as "Total Employees" (excluding Super Admin who is already filtered out of 'users')
    // const totalEmployees = users.length; // Removed as per request
    const todayAttendance = attendanceLogs.filter(log => {
        const logDate = new Date(log.date).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
    }).length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

    return (
        <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h1 className="mb-8">Admin Dashboard</h1>

            {/* Overview Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                {pageLoading ? (
                    <>
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                        <Skeleton type="card" height="120px" />
                    </>
                ) : (
                    <>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                            <h4>✓ Today's Attendance</h4>
                            <p className="stat-value">{todayAttendance}</p>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <h4>⏳ Pending Leaves</h4>
                            <p className="stat-value">{pendingLeaves}</p>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            <h4>📊 Total Users</h4>
                            <p className="stat-value">{users.length}</p>
                        </div>
                    </>
                )}
            </div>

            {/* User Management */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3>User Management</h3>
                    <div className="search-input">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <span className="search-clear" onClick={() => setSearchTerm('')}>✕</span>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageLoading ? (
                                <>
                                    <tr><td colSpan="4"><Skeleton /></td></tr>
                                    <tr><td colSpan="4"><Skeleton /></td></tr>
                                    <tr><td colSpan="4"><Skeleton /></td></tr>
                                    <tr><td colSpan="4"><Skeleton /></td></tr>
                                </>
                            ) : (
                                <>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            {editingUser === u._id ? (
                                                <>
                                                    <td>
                                                        <div className="flex-col gap-2">
                                                            <input
                                                                type="text"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                style={{ width: '100%', padding: '0.4rem', marginBottom: '4px' }}
                                                                placeholder="Name"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editForm.employeeId}
                                                                onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                                                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                                                                placeholder="ID (e.g. EMP001)"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                            style={{ width: '100%', padding: '0.4rem' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={editForm.role}
                                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                            style={{ padding: '0.4rem', borderRadius: '4px' }}
                                                        >
                                                            <option value="Employee">Employee</option>
                                                            <option value="Admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button onClick={handleUpdateUser} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                                                            <button onClick={() => setEditingUser(null)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <Avatar user={u} size="sm" />
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginBottom: '2px' }}>
                                                                    {u.employeeId || 'No ID'}
                                                                </div>
                                                                <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '2px' }}>{u.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>
                                                                    {u.position || 'No Pos'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{u.email}</td>
                                                    <td><StatusBadge status={u.role} /></td>
                                                    <td>
                                                        {/* Show actions if user is Employee OR if current user is Super Admin covering an Admin */}
                                                        {(u.role !== 'Admin' || (currentUser && currentUser.email === 'admin@worksync.com')) && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEditClick(u)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--pk-primary)', borderColor: 'var(--pk-primary)' }}>Edit</button>
                                                                <button
                                                                    onClick={() => openResetModal(u._id, u.name)}
                                                                    className="btn btn-ghost"
                                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--pk-warning)', borderColor: 'var(--pk-warning)' }}
                                                                >
                                                                    Reset Password
                                                                </button>
                                                                <button
                                                                    onClick={() => openModal(
                                                                        'Delete User',
                                                                        `Are you sure you want to delete ${u.name}? This action cannot be undone.`,
                                                                        () => handleDeleteUser(u._id)
                                                                    )}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
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
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4">
                                                <EmptyState
                                                    icon="👥"
                                                    title="No Users Found"
                                                    description={searchTerm ? `No users match "${searchTerm}"` : "Get started by adding your first employee."}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leave Requests */}
            <div className="card">
                <h3>Leave Requests</h3>
                <div className="table-responsive">
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Avatar user={l.userId} size="sm" />
                                            {l.userId?.name}
                                        </div>
                                    </td>
                                    <td>{l.reason}</td>
                                    <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <StatusBadge status={l.status} />
                                    </td>
                                    <td>
                                        {l.status === 'Pending' && (
                                            <div className="flex gap-4">
                                                <button onClick={() => updateLeaveStatus(l._id, 'Approved')} className="btn btn-primary" style={{ background: 'var(--pk-success)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Approve</button>
                                                <button onClick={() => updateLeaveStatus(l._id, 'Rejected')} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                        <EmptyState
                                            icon="🏖️"
                                            title="No Leave Requests"
                                            description="There are no pending leave requests at the moment."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Password Reset Requests */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3>Password Reset Requests</h3>
                    {passwordResets.filter(r => r.status === 'Pending').length > 0 && (
                        <span className="badge badge-warning" style={{ fontSize: '0.9rem' }}>
                            {passwordResets.filter(r => r.status === 'Pending').length} Pending
                        </span>
                    )}
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Email</th>
                                <th>Request Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passwordResets.map(request => (
                                <tr key={request._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Avatar user={request.userId} size="sm" />
                                            {request.userId?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td>{request.email}</td>
                                    <td>{new Date(request.requestDate).toLocaleString()}</td>
                                    <td>
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td>
                                        {request.status === 'Pending' && (
                                            <button
                                                onClick={() => completeResetRequest(request._id, request.userId._id, request.userId.name)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            >
                                                Reset Password
                                            </button>
                                        )}
                                        {request.status === 'Completed' && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>
                                                Completed {request.completedDate && `on ${new Date(request.completedDate).toLocaleDateString()}`}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {passwordResets.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                        <EmptyState
                                            icon="🔐"
                                            title="No Reset Requests"
                                            description="No users have requested a password reset recently."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Logs */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3>Attendance Logs</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            onClick={exportToCSV}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            disabled={attendanceLogs.length === 0}
                        >
                            📥 Export to CSV
                        </button>
                        <label>Filter Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ width: 'auto' }}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Email</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.map(log => (
                                <tr key={log._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Avatar user={log.userId} size="sm" />
                                            {log.userId?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td>{log.userId?.email || 'N/A'}</td>
                                    <td>
                                        <div>{new Date(log.date).toLocaleString()}</div>
                                        {(log.modifiedBy || log.modifiedAt) && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginTop: '2px' }}>
                                                Edited {log.modifiedAt && new Date(log.modifiedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge status={log.status} />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => openEditAttendanceModal(log)}
                                            className="btn btn-ghost"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--pk-primary)', borderColor: 'var(--pk-primary)' }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {attendanceLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                        <EmptyState
                                            icon="📅"
                                            title="No Attendance Found"
                                            description={`We couldn't find any attendance records for ${new Date(selectedDate).toLocaleDateString()}.`}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

            {/* Reset Password Modal */}
            {showResetModal && (
                <>
                    <div
                        className="modal-backdrop"
                        onClick={closeResetModal}
                    />
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button
                                className="modal-close"
                                onClick={closeResetModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: 'var(--pk-text-muted)' }}>
                                Enter a new password for this user. You can generate a random secure password or enter your own.
                            </p>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    New Password
                                </label>
                                <div className="input-group">
                                    <span className="input-icon">🔑</span>
                                    <input
                                        type="text"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={resetLoading}
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    {newPassword && (
                                        <span
                                            className="input-icon-right"
                                            onClick={copyToClipboard}
                                            title="Copy to clipboard"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            📋
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="btn btn-ghost"
                                    style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                                    disabled={resetLoading}
                                >
                                    🎲 Generate Random Password
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={closeResetModal}
                                className="btn btn-ghost"
                                disabled={resetLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className={`btn btn-primary ${resetLoading ? 'loading' : ''}`}
                                disabled={resetLoading || !newPassword}
                            >
                                {resetLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* Edit Attendance Modal */}
            {showEditAttendanceModal && editingAttendance && (
                <>
                    <div
                        className="modal-backdrop"
                        onClick={() => setShowEditAttendanceModal(false)}
                    />
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Attendance</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowEditAttendanceModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: 'var(--pk-text-muted)' }}>
                                Updating attendance for <strong>{editingAttendance.userId?.name}</strong>
                                <br />
                                <span style={{ fontSize: '0.9rem' }}>
                                    Original Date: {new Date(editingAttendance.date).toLocaleString()}
                                </span>
                            </p>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Status
                                </label>
                                <div className="status-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {['Present', 'Half-day', 'Absent'].map((status) => (
                                        <div
                                            key={status}
                                            className={`status-card ${editAttendanceStatus === status ? 'selected' : ''}`}
                                            onClick={() => setEditAttendanceStatus(status)}
                                            style={{ padding: '0.75rem', fontSize: '0.9rem', minHeight: 'auto' }}
                                        >
                                            <div style={{ textAlign: 'center' }}>
                                                {status === 'Present' ? '✅' : status === 'Half-day' ? '⏰' : '❌'} {status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => setShowEditAttendanceModal(false)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateAttendance}
                                className="btn btn-primary"
                            >
                                Update Attendance
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
