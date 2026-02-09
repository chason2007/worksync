const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path to env if needed

const removeSalaryField = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const User = require('../models/User');

        const result = await User.updateMany(
            { salary: { $exists: true } },
            { $unset: { salary: "" } }
        );

        console.log(`Updated ${result.modifiedCount} users. Salary field removed.`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

removeSalaryField();
