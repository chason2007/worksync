async function testFullFlow() {
    const timestamp = Date.now();
    const email = `user_${timestamp}@example.com`;
    const password = "password123";

    console.log(`--- Starting Full Flow Test ---`);
    console.log(`Target Email: ${email}`);

    try {
        // 1. Register
        console.log(`\n1. Attempting Registration...`);
        const regRes = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Flow Test User",
                email: email,
                password: password,
                role: "Employee",
                salary: 60000
            })
        });
        const regData = await regRes.text();
        console.log(`   Status: ${regRes.status}`);
        console.log(`   Response: ${regData}`);

        if (regRes.status !== 200) throw new Error("Registration Failed");

        // 2. Login
        console.log(`\n2. Attempting Login...`);
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const loginData = await loginRes.text();
        console.log(`   Status: ${loginRes.status}`);
        console.log(`   Response: ${loginData}`);

        if (loginRes.status !== 200) throw new Error("Login Failed");

        console.log(`\n--- SUCCESS: Full Flow Verified ---`);

    } catch (err) {
        console.error(`\n--- FAILED: ${err.message} ---`);
    }
}

testFullFlow();
