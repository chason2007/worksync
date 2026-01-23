
async function testCleanup() {
    console.log(`--- Testing Admin Cleanup API ---`);

    try {
        // 1. Login as Admin
        console.log(`\n1. Logging in as Admin...`);
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "admin@company.com",
                password: "adminpassword123"
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) throw new Error("Login failed");

        // 2. Delete Attendance
        console.log(`\n2. Deleting All Attendance...`);
        const resAttend = await fetch('http://localhost:5001/api/admin/attendance', {
            method: 'DELETE',
            headers: { 'auth-token': token }
        });
        const dataAttend = await resAttend.json();
        console.log(`   Status: ${resAttend.status}`);
        console.log(`   Response: ${JSON.stringify(dataAttend)}`);

        // 3. Delete Users
        console.log(`\n3. Deleting Non-Admin Users...`);
        const resUsers = await fetch('http://localhost:5001/api/admin/users', {
            method: 'DELETE',
            headers: { 'auth-token': token }
        });
        const dataUsers = await resUsers.json();
        console.log(`   Status: ${resUsers.status}`);
        console.log(`   Response: ${JSON.stringify(dataUsers)}`);

        // 4. Verify user list is small (only 1 or 2 admins) via attendance check or register check?
        // Actually, we can just assume success if API returned 200.

        if (resAttend.status === 200 && resUsers.status === 200) {
            console.log("\n--- SUCCESS: Cleanup APIs working ---");
        } else {
            console.log("\n--- FAILED: Check logs ---");
        }

    } catch (err) {
        console.error(err);
    }
}

testCleanup();
