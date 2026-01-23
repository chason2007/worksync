import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState([]);
    const [leaves, setLeaves] = useState([]);

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
                setUsers(usersRes.data);

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

    const handleDeleteUsers = async () => {
        if (window.confirm("Are you sure you want to delete ALL users (except Admin)? This cannot be undone.")) {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.delete('http://localhost:5001/api/admin/users', {
                    headers: { 'auth-token': token }
                });
                alert(res.data.message);
                // Refresh users list (it should be just admins now, or we can just fetch again)
                // The backend ensures admin isn't deleted. 
                // Let's re-fetch to be safe or filter locally. 
                // Simplest: 
                setUsers(users.filter(u => u.role === 'Admin'));
                setAttendanceLogs([]); // Assuming attendance is also cleared or we want to clear it? 
                // Wait, deleting users doesn't automatically delete ALL attendance in the backend unless cascaded?
                // The 'Danger Zone' had separate buttons.
                // The original code `handleDeleteUsers` did `setAttendanceLogs([])`? 
                // Let's check original code: `handleDeleteUsers` -> `setAttendanceLogs([])` was PRESENT.
                // Wait, why? Maybe because it deletes logs too? No, logic says "Delete ALL Users".
                // I will keep behavior consistent.
                setAttendanceLogs([]);
            } catch (err) {
                alert("Failed to delete users: " + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleDeleteAttendance = async () => {
        if (window.confirm("Are you sure you want to delete ALL attendance records? This cannot be undone.")) {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.delete('http://localhost:5001/api/admin/attendance', {
                    headers: { 'auth-token': token }
                });
                alert(res.data.message);
                setAttendanceLogs([]);
            } catch (err) {
                alert("Failed to delete attendance: " + (err.response?.data?.error || err.message));
            }
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <h3>User Management</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
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
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                {u.role !== 'Admin' && (
                                    <button onClick={() => handleDeleteUser(u._id)} style={{ color: 'red' }}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />

            <h3>Leave Requests</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
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
                            <td style={{ color: l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'orange' }}>{l.status}</td>
                            <td>
                                {l.status === 'Pending' && (
                                    <>
                                        <button onClick={() => updateLeaveStatus(l._id, 'Approved')} style={{ color: 'green', marginRight: '5px', cursor: 'pointer' }}>Approve</button>
                                        <button onClick={() => updateLeaveStatus(l._id, 'Rejected')} style={{ color: 'red', cursor: 'pointer' }}>Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />

            <div style={{ marginBottom: '20px' }}>
                <label>Filter by Date: </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
            <h3>All Employee Attendance ({attendanceLogs.length} Records)</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '100px' }}>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceLogs.map(log => (
                        <tr key={log._id}>
                            <td>{log.userId?.name || 'Unknown'}</td>
                            <td>{log.userId?.email || 'N/A'}</td>
                            <td>{new Date(log.date).toLocaleString()}</td>
                            <td>{log.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                border: '1px solid red',
                padding: '15px',
                backgroundColor: '#fff5f5',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <h3 style={{ color: 'red', margin: '0 0 10px 0', fontSize: '16px' }}>Danger Zone</h3>
                <button onClick={handleDeleteUsers} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
                    Delete ALL Users
                </button>
                <button onClick={handleDeleteAttendance} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
                    Delete ALL Attendance
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
