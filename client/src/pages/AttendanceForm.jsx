import { useState } from 'react';
import axios from 'axios';

function AttendanceForm() {
    const [status, setStatus] = useState('Present');
    const user = JSON.parse(localStorage.getItem('user'));

    const markAttendance = async () => {
        if (!user || !user.id) {
            alert('User not found. Please log in.');
            return;
        }

        try {
            await axios.post('http://localhost:5001/api/attendance/mark', {
                userId: user.id,
                status
            });
            alert('Attendance Marked!');
        } catch (error) {
            console.error(error);
            alert('Failed to mark attendance');
        }
    };

    return (
        <div>
            <h3>Mark Attendance</h3>
            <select onChange={(e) => setStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Half-day">Half-Day</option>
                <option value="Absent">Absent</option>
            </select>
            <button onClick={markAttendance}>Submit</button>
        </div>
    );
}

export default AttendanceForm;