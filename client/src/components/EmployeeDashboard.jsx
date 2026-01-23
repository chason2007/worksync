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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div className="card flex justify-between items-center" style={{ background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-primary-hover))', color: 'white' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h2>
                    <p style={{ opacity: 0.9 }}>Role: {user?.role}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Request Form */}
                <div className="card">
                    <h3>Request Leave</h3>
                    <form onSubmit={submitLeaveRequest} className="flex flex-col gap-4">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Reason</label>
                            <input
                                type="text"
                                placeholder="Sick leave, Vacation..."
                                value={leaveReason}
                                onChange={e => setLeaveReason(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-full">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Date</label>
                                <input
                                    type="date"
                                    value={leaveStartDate}
                                    onChange={e => setLeaveStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-full">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Date</label>
                                <input
                                    type="date"
                                    value={leaveEndDate}
                                    onChange={e => setLeaveEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Request</button>
                    </form>
                </div>

                {/* Leave History */}
                <div className="card">
                    <h3>My Leave History</h3>
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
