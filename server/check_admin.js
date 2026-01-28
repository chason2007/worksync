const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB');
        console.log("Connected to MongoDB...");

        const admins = await User.find({ role: 'Admin' });
        console.log("=== LIST OF ADMINS ===");
        admins.forEach(admin => {
            console.log(`ID: ${admin._id}, Name: ${admin.name}, Email: '${admin.email}'`);
        });
        console.log("======================");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAdmins();
