// Native fetch used

async function seedAttendance() {
    // 1. Login as Employee to get a valid ID (or just register a new one)
    const email = `employee_${Date.now()}@example.com`;
    const password = "password123";

    try {
        console.log("1. Registering new employee for data...");
        const regRes = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Attendance User",
                email: email,
                password: password,
                role: "Employee",
                salary: 50000
            })
        });
        const regData = await regRes.json();

        if (!regData.user) throw new Error("Registration failed");
        const userId = regData.user;
        console.log("   User ID:", userId);

        // 2. Mark Attendance for this user
        console.log("2. Marking Attendance...");
        const markRes = await fetch('http://localhost:5001/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                status: "Present"
            })
        });

        if (markRes.ok) {
            console.log("   SUCCESS: Attendance Marked");
        } else {
            console.log("   FAILED to mark attendance", await markRes.text());
        }

        // 3. Login as Admin to verify we can see it
        console.log("3. Verifying as Admin...");
        const adminLogin = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "admin@company.com", // The admin we created earlier
                password: "adminpassword123"
            })
        });
        const adminData = await adminLogin.json();
        const token = adminData.token;

        const attendRes = await fetch('http://localhost:5001/api/attendance', {
            headers: { 'auth-token': token }
        });
        const logs = await attendRes.json();
        console.log("   Admin sees " + logs.length + " records.");
        if (logs.length > 0) {
            console.log("   First Record User Name:", logs[0].userId ? logs[0].userId.name : "NULL (Populate Failed?)");
        }

    } catch (err) {
        console.error(err);
    }
}

seedAttendance();
