const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed
require('dotenv').config();

async function deleteUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const targetEmail = "admin@company.com";

        // Count users before
        const countBefore = await User.countDocuments();
        console.log(`Total users before: ${countBefore}`);

        // Delete all except admin
        const result = await User.deleteMany({ email: { $ne: targetEmail } });

        console.log(`Deleted ${result.deletedCount} users.`);
        console.log(`Kept user with email: ${targetEmail}`);

        // Count users after
        const countAfter = await User.countDocuments();
        console.log(`Total users after: ${countAfter}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

deleteUsers();
