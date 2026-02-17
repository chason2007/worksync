
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testUpload() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com',
                password: process.env.SUPER_ADMIN_PASSWORD || 'admin'
            })
        });

        if (!loginRes.ok) {
            const errBody = await loginRes.text();
            throw new Error(`Login failed (${loginRes.status}): ${errBody}`);
        }
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful');

        // 2. Prepare file
        const dummyPath = path.join(__dirname, 'test-image.jpg');
        fs.writeFileSync(dummyPath, 'fake image content');
        const fileBuffer = fs.readFileSync(dummyPath);

        // 3. Construct Multipart Body manually (since Node FormData can be tricky without libraries)
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        let body = `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="profileImage"; filename="test-image.jpg"\r\n';
        body += 'Content-Type: image/jpeg\r\n\r\n';

        const bodyBuffer = Buffer.concat([
            Buffer.from(body, 'utf-8'),
            fileBuffer,
            Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
        ]);

        console.log('Attempting upload...');
        const uploadRes = await fetch('http://localhost:5001/api/users/profile/image', {
            method: 'POST',
            headers: {
                'auth-token': token,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: bodyBuffer
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Upload failed (${uploadRes.status}): ${errText}`);
        }

        const uploadData = await uploadRes.json();
        console.log('Upload success:', uploadData);

        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testUpload();
