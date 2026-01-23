const mongoose = require('mongoose');
const Attendance = require('./models/Attendance'); // Adjust path as needed
require('dotenv').config();

async function deleteAttendance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Count records before
        const countBefore = await Attendance.countDocuments();
        console.log(`Total attendance records before: ${countBefore}`);

        // Delete all
        const result = await Attendance.deleteMany({});

        console.log(`Deleted ${result.deletedCount} attendance records.`);

        // Count records after
        const countAfter = await Attendance.countDocuments();
        console.log(`Total attendance records after: ${countAfter}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

deleteAttendance();
