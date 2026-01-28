
async function createAdmin() {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Temp Admin",
                email: "tempadmin@worksync.com",
                password: "admin123",
                role: "Admin",
                employeeId: "TEMP001",
                salary: 100000
            })
        });

        const data = await response.text();

        if (response.ok) {
            console.log("Admin created successfully:", data);
        } else {
            console.log("Failed to create admin:", response.status, data);
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

createAdmin();
