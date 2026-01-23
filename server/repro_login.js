async function testLogin() {
    try {
        console.log("Attempting login...");
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test@example.com",
                password: "password123"
            })
        });

        const data = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${data}`);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testLogin();
