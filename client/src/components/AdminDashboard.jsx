import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

function AdminDashboard() {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Employee', position: '' });
    const [leaves, setLeaves] = useState([]);
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
            position: user.position || ''
        });
    };

    const handleUpdateUser = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.put(`http://localhost:5001/api/admin/users/${editingUser}`, editForm, {
                headers: { 'auth-token': token }
            });
            setUsers(users.map(u => u._id === editingUser ? res.data : u));
            setEditingUser(null);
            showToast("User updated successfully", 'success');
        } catch (err) {
            showToast("Failed to update user: " + (err.response?.data?.error || err.message), 'error');
        }
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem('auth-token');
            try {
                // Fetch Attendance
                const attendanceUrl = selectedDate
                    ? `http://localhost:5001/api/attendance?date=${selectedDate}`
                    : 'http://localhost:5001/api/attendance';
                const attendanceRes = await axios.get(attendanceUrl, { headers: { 'auth-token': token } });
                setAttendanceLogs(attendanceRes.data);

                // Fetch Users
                const usersRes = await axios.get('http://localhost:5001/api/admin/users', { headers: { 'auth-token': token } });
                const sortedUsers = usersRes.data.sort((a, b) => {
                    if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                    if (a.role !== 'Admin' && b.role === 'Admin') return 1;
                    return 0;
                });
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers);

                // Fetch Leaves
                const leavesRes = await axios.get('http://localhost:5001/api/leaves', { headers: { 'auth-token': token } });
                setLeaves(leavesRes.data);

            } catch (err) {
                console.error("Failed to fetch admin data", err);
                showToast("Failed to load dashboard data", 'error');
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
                (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const updateLeaveStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.put(`http://localhost:5001/api/leaves/${id}`, { status }, { headers: { 'auth-token': token } });
            setLeaves(leaves.map(l => l._id === id ? res.data : l));
            showToast(`Leave ${status.toLowerCase()} successfully`, 'success');
        } catch (err) {
            showToast("Failed to update status", 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { 'auth-token': token }
            });
            setUsers(users.filter(u => u._id !== id));
            showToast("User deleted successfully", 'success');
        } catch (err) {
            showToast("Failed to delete user", 'error');
        }
    };

    // Calculate stats
    const totalEmployees = users.filter(u => u.role === 'Employee').length;
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
                <div className="stat-card">
                    <h4>👥 Total Employees</h4>
                    <p className="stat-value">{totalEmployees}</p>
                </div>
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
                            {filteredUsers.map(u => (
                                <tr key={u._id}>
                                    {editingUser === u._id ? (
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    style={{ width: '100%', padding: '0.4rem' }}
                                                />
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
                                                    <div className="avatar avatar-sm">
                                                        {u.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{u.position || 'No Position'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span></td>
                                            <td>
                                                {u.role !== 'Admin' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditClick(u)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--pk-primary)', borderColor: 'var(--pk-primary)' }}>Edit</button>
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
                            {filteredUsers.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No users found.</td></tr>}
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
                                            <div className="avatar avatar-sm">
                                                {l.userId?.name?.charAt(0)}
                                            </div>
                                            {l.userId?.name}
                                        </div>
                                    </td>
                                    <td>{l.reason}</td>
                                    <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                            {l.status}
                                        </span>
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
                            {leaves.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No leave requests.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Logs */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3>Attendance Logs</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.map(log => (
                                <tr key={log._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="avatar avatar-sm">
                                                {log.userId?.name?.charAt(0) || '?'}
                                            </div>
                                            {log.userId?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td>{log.userId?.email || 'N/A'}</td>
                                    <td>{new Date(log.date).toLocaleString()}</td>
                                    <td>
                                        <span className="badge badge-success">{log.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {attendanceLogs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No attendance records found for this date.</td></tr>}
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
        </div>
    );
}

export default AdminDashboard;
