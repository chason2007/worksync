import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Employee', position: '', salary: '' });
    const [leaves, setLeaves] = useState([]);

    const handleEditClick = (user) => {
        setEditingUser(user._id);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position || '',
            salary: user.salary || ''
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
            alert("User updated successfully");
        } catch (err) {
            alert("Failed to update user: " + (err.response?.data?.error || err.message));
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
                // Sort users: Admin first, then Employee
                const sortedUsers = usersRes.data.sort((a, b) => {
                    if (a.role === 'Admin' && b.role !== 'Admin') return -1;
                    if (a.role !== 'Admin' && b.role === 'Admin') return 1;
                    return 0;
                });
                setUsers(sortedUsers);

                // Fetch Leaves
                const leavesRes = await axios.get('http://localhost:5001/api/leaves', { headers: { 'auth-token': token } });
                setLeaves(leavesRes.data);

            } catch (err) {
                console.error("Failed to fetch admin data", err);
            }
        };

        fetchAdminData();
    }, [selectedDate]);

    const updateLeaveStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.put(`http://localhost:5001/api/leaves/${id}`, { status }, { headers: { 'auth-token': token } });
            setLeaves(leaves.map(l => l._id === id ? res.data : l));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = localStorage.getItem('auth-token');
                await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                    headers: { 'auth-token': token }
                });
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                alert("Failed to delete user");
            }
        }
    };



    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 className="mb-8">Admin Dashboard</h1>

            {/* User Management */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3>User Management</h3>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    {editingUser === u._id ? (
                                        // Edit Mode
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
                                                <div className="flex gap-2">
                                                    <select
                                                        value={editForm.role}
                                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                        style={{ padding: '0.4rem', borderRadius: '4px' }}
                                                    >
                                                        <option value="Employee">Employee</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Position"
                                                        value={editForm.position}
                                                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                                        style={{ width: '80px', padding: '0.4rem' }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={handleUpdateUser} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                                                    <button type="button" onClick={() => setEditingUser(null)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // View Mode
                                        <>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{u.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>{u.position || 'No Position'}</div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span></td>
                                            <td>
                                                {u.role !== 'Admin' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditClick(u)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--pk-primary)', borderColor: 'var(--pk-primary)' }}>Edit</button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Delete</button>
                                                    </div>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No users found.</td></tr>}
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
                                    <td>{l.userId?.name}</td>
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
                                                <button onClick={() => updateLeaveStatus(l._id, 'Approved')} className="btn btn-primary" style={{ background: 'var(--pk-success)' }}>Approve</button>
                                                <button onClick={() => updateLeaveStatus(l._id, 'Rejected')} className="btn btn-danger">Reject</button>
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
                                    <td>{log.userId?.name || 'Unknown'}</td>
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


        </div>
    );
}

export default AdminDashboard;
