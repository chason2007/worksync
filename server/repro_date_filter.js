
async function testDateFilter() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    console.log(`--- Testing Date Filter ---`);
    console.log(`Today: ${today}`);
    console.log(`Yesterday: ${yesterday}`);

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

        // 2. Fetch for Today (Should have records from previous tests)
        console.log(`\n2. Fetching for Today (${today})...`);
        const resToday = await fetch(`http://localhost:5001/api/attendance?date=${today}`, {
            headers: { 'auth-token': token }
        });
        const dataToday = await resToday.json();
        console.log(`   Records Found: ${dataToday.length}`);
        if (dataToday.length === 0) console.warn("   WARNING: Expected records for today.");

        // 3. Fetch for Yesterday (Should have 0 records unless seeded)
        console.log(`\n3. Fetching for Yesterday (${yesterday})...`);
        const resYesterday = await fetch(`http://localhost:5001/api/attendance?date=${yesterday}`, {
            headers: { 'auth-token': token }
        });
        const dataYesterday = await resYesterday.json();
        console.log(`   Records Found: ${dataYesterday.length}`);

        if (dataYesterday.length === 0 && dataToday.length > 0) {
            console.log("\n--- SUCCESS: Filtering working (Today shown, Yesterday empty) ---");
        } else {
            console.log("\n--- INCONCLUSIVE: Check data ---");
        }

    } catch (err) {
        console.error(err);
    }
}

testDateFilter();
