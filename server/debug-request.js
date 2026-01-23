async function testRegister() {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug Node',
                email: 'node_debug_' + Date.now() + '@test.com',
                password: 'password123'
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testRegister();
