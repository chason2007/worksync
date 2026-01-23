import { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeeDashboard({ user }) {
    const [leaves, setLeaves] = useState([]);
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');

    useEffect(() => {
        const fetchLeaves = async () => {
            const token = localStorage.getItem('auth-token');
            try {
                const res = await axios.get('http://localhost:5001/api/leaves', { headers: { 'auth-token': token } });
                setLeaves(res.data);
            } catch (err) {
                console.error("Failed to fetch leaves", err);
            }
        };
        fetchLeaves();
    }, []);

    const submitLeaveRequest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.post('http://localhost:5001/api/leaves', {
                reason: leaveReason,
                startDate: leaveStartDate,
                endDate: leaveEndDate
            }, { headers: { 'auth-token': token } });

            alert("Leave Requested!");
            setLeaves([res.data, ...leaves]); // Add to top
            setLeaveReason('');
            setLeaveStartDate('');
            setLeaveEndDate('');
        } catch (err) {
            alert("Failed to request leave");
        }
    };

    return (
        <div>
            <h1>Employee Portal Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <p>Your Role: {user?.role}</p>

            <hr />
            <h3>Request Leave</h3>
            <form onSubmit={submitLeaveRequest} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="text" placeholder="Reason" value={leaveReason} onChange={e => setLeaveReason(e.target.value)} required />
                <label>Start:</label>
                <input type="date" value={leaveStartDate} onChange={e => setLeaveStartDate(e.target.value)} required />
                <label>End:</label>
                <input type="date" value={leaveEndDate} onChange={e => setLeaveEndDate(e.target.value)} required />
                <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>Submit Request</button>
            </form>

            <h3>My Leave History</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                            <td style={{ fontWeight: 'bold', color: l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'orange' }}>
                                {l.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeDashboard;
