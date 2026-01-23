// Native fetch is available in Node 18+

// If node-fetch isn't installed and global fetch is available (Node 18+), this logic handles it.
// Since we are on Node 24, global fetch is available.

async function registerAdmin() {
    const adminUser = {
        name: "Super Admin",
        email: "admin@company.com", // Change this if needed
        password: "adminpassword123", // Change this if needed
        role: "Admin",
        salary: 120000
    };

    console.log("--- Registering Admin User ---");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);

    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        });

        const data = await response.text();

        if (response.ok) {
            console.log("SUCCESS: Admin Registered!");
            console.log("Response:", data);
            console.log("\nYou can now login with these credentials.");
        } else {
            console.error("FAILED to Register:", response.status);
            console.error("Reason:", data);
        }

    } catch (err) {
        console.error("Network/Script Error:", err.message);
    }
}

registerAdmin();
