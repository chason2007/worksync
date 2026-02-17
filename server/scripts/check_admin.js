const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} found!`);
            console.log('Role:', user.role);
            console.log('ID:', user._id);
            // Verify password 'admin'
            const validPass = await bcrypt.compare('admin', user.password);
            console.log('Password "admin" is correct:', validPass);
        } else {
            console.log(`User ${email} NOT found.`);
            console.log('Creating default admin user...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            const newUser = new User({
                name: 'Super Admin',
                email: email,
                password: hashedPassword,
                role: 'Admin',
                position: 'System Administrator',
                employeeId: 'ADMIN01'
            });

            await newUser.save();
            console.log('Admin user created successfully.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAdmin();
