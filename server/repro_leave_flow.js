
async function testLeaveFlow() {
    console.log(`--- Testing Leave Request Flow ---`);

    try {
        // 1. Setup Employee
        const empEmail = `emp_${Date.now()}@test.com`;
        const empPass = "password123";
        console.log(`\n1. Creating Employee (${empEmail})...`);

        const regRes = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Mr. Leaver", email: empEmail, password: empPass, role: "Employee", salary: 50000 })
        });

        const rawText = await regRes.text();
        let regData;
        try {
            regData = JSON.parse(rawText);
        } catch (e) {
            throw new Error("Registration returned non-JSON: " + rawText);
        }

        if (!regRes.ok || !regData.user) {
            console.log("Registration Response Body:", JSON.stringify(regData, null, 2));
            throw new Error("Registration failed");
        }
        const empId = regData.user;

        // Login Employee
        const empLoginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: empEmail, password: empPass })
        });
        const empToken = (await empLoginRes.json()).token;

        // 2. Submit Leave Request
        console.log(`\n2. Submitting Leave Request...`);
        const leaveRes = await fetch('http://localhost:5001/api/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'auth-token': empToken },
            body: JSON.stringify({ reason: "Sick Day", startDate: "2026-02-01", endDate: "2026-02-02" })
        });
        const leaveData = await leaveRes.json();
        console.log(`   Leave ID: ${leaveData._id}`);
        console.log(`   Status: ${leaveData.status}`);

        // 3. Login Admin
        console.log(`\n3. Logging in Admin...`);
        const adminLoginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "admin@company.com", password: "adminpassword123" })
        });
        const adminToken = (await adminLoginRes.json()).token;

        // 4. Admin Approves Leave
        console.log(`\n4. Admin Approving Leave...`);
        const approveRes = await fetch(`http://localhost:5001/api/leaves/${leaveData._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'auth-token': adminToken },
            body: JSON.stringify({ status: "Approved" })
        });
        const approveData = await approveRes.json();
        console.log(`   New Status: ${approveData.status}`);

        // 5. Verify Employee sees Approved
        console.log(`\n5. Verifying Employee View...`);
        const checkRes = await fetch('http://localhost:5001/api/leaves', {
            headers: { 'auth-token': empToken }
        });
        const myLeaves = await checkRes.json();
        const myLeave = myLeaves.find(l => l._id === leaveData._id);

        if (myLeave && myLeave.status === 'Approved') {
            console.log("\n--- SUCCESS: Full Leave Cycle Verified ---");
        } else {
            console.log("\n--- FAILED: Status mismatch ---");
        }

    } catch (err) {
        console.error("ERROR:", err);
    }
}

testLeaveFlow();
