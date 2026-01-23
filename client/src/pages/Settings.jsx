import axios from 'axios';

function Settings() {

    const handleDeleteUsers = async () => {
        if (window.confirm("Are you sure you want to delete ALL users (except Admin)? This cannot be undone.")) {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.delete('http://localhost:5001/api/admin/users', {
                    headers: { 'auth-token': token }
                });
                alert(res.data.message);
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
            } catch (err) {
                alert("Failed to delete attendance: " + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleDeleteLeaves = async () => {
        if (window.confirm("Are you sure you want to delete ALL leave requests? This cannot be undone.")) {
            try {
                const token = localStorage.getItem('auth-token');
                const res = await axios.delete('http://localhost:5001/api/admin/leaves', {
                    headers: { 'auth-token': token }
                });
                alert(res.data.message);
            } catch (err) {
                alert("Failed to delete leaves: " + (err.response?.data?.error || err.message));
            }
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 className="mb-8">Admin Settings</h1>

            <div className="card" style={{ borderColor: 'var(--pk-danger)' }}>
                <h3 style={{ color: 'var(--pk-danger)' }}>Danger Zone</h3>
                <p style={{ color: 'var(--pk-text-muted)', marginBottom: '1.5rem' }}>
                    These actions are destructive and cannot be undone. Please be certain.
                </p>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center" style={{ padding: '1rem', background: '#fff5f5', borderRadius: '8px' }}>
                        <div>
                            <strong style={{ color: 'var(--pk-danger)' }}>Delete All Users</strong>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>Removes all employee accounts. Admin remains.</div>
                        </div>
                        <button onClick={handleDeleteUsers} className="btn btn-danger">
                            Delete Users
                        </button>
                    </div>

                    <div className="flex justify-between items-center" style={{ padding: '1rem', background: '#fff5f5', borderRadius: '8px' }}>
                        <div>
                            <strong style={{ color: 'var(--pk-danger)' }}>Delete All Attendance</strong>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>Clears the entire attendance history log.</div>
                        </div>
                        <button onClick={handleDeleteAttendance} className="btn btn-danger">
                            Delete Attendance
                        </button>
                    </div>

                    <div className="flex justify-between items-center" style={{ padding: '1rem', background: '#fff5f5', borderRadius: '8px' }}>
                        <div>
                            <strong style={{ color: 'var(--pk-danger)' }}>Delete All Leaves</strong>
                            <div style={{ fontSize: '0.9rem', color: '#718096' }}>Removes all leave requests (Pending/Approved/Rejected).</div>
                        </div>
                        <button onClick={handleDeleteLeaves} className="btn btn-danger">
                            Delete Leaves
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
