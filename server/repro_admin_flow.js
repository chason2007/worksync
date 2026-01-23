async function testAdminFlow() {
    const timestamp = Date.now();
    const email = `admin_${timestamp}@example.com`;
    const password = "adminpassword123";

    console.log(`--- Starting Admin Flow Test ---`);
    console.log(`Target Email: ${email}`);

    try {
        // 1. Register as Admin
        console.log(`\n1. Registering Admin...`);
        const regRes = await fetch('http://127.0.0.1:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Admin User",
                email: email,
                password: password,
                role: "Admin",
                salary: 100000
            })
        });
        const regData = await regRes.text();
        console.log(`   Status: ${regRes.status}`);

        if (regRes.status !== 200) throw new Error("Admin Registration Failed: " + regData);

        // 2. Login as Admin
        console.log(`\n2. Logging in as Admin...`);
        const loginRes = await fetch('http://127.0.0.1:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const loginData = await loginRes.json();
        console.log(`   Status: ${loginRes.status}`);

        if (loginRes.status !== 200) throw new Error("Admin Login Failed");

        const token = loginData.token;
        console.log(`   Token received.`);

        // 3. Fetch All Attendance (Admin Endpoint)
        console.log(`\n3. Fetching All Attendance...`);

        const attendRes = await fetch('http://127.0.0.1:5001/api/attendance', {
            method: 'GET',
            headers: {
                'auth-token': token,
                'Content-Type': 'application/json'
            }
        });
        const attendData = await attendRes.json();
        console.log(`   Status: ${attendRes.status}`);
        console.log(`   Records Found: ${attendData.length}`);

        if (attendRes.status !== 200) throw new Error("Fetch Attendance Failed: " + JSON.stringify(attendData));

        console.log(`\n--- SUCCESS: Admin Flow Verified ---`);

    } catch (err) {
        console.error(`\n--- FAILED: ${err.message} ---`);
    }
}

testAdminFlow();
