const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB');
        console.log("Connected to MongoDB...");

        // Find Admin (insensitive)
        const emailTarget = 'admin@worksync.com';
        const admin = await User.findOne({ email: { $regex: new RegExp(`^${emailTarget}$`, 'i') } });

        if (admin) {
            console.log(`Found admin: ${admin.email}. Normalizing to ${emailTarget}...`);
            admin.email = emailTarget;
            await admin.save();
            console.log("Admin email normalized success.");
        } else {
            console.log(`Admin with email ${emailTarget} NOT FOUND.`);
            // List all admins to be sure
            const allAdmins = await User.find({ role: 'Admin' });
            console.log("Available Admins:", allAdmins.map(u => u.email));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixAdmin();
