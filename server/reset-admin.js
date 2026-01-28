const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const resetAdmin = async () => {
    console.log("Starting Admin Reset Script...");
    if (!process.env.MONGO_URI) {
        console.error("ERROR: MONGO_URI is missing from .env file");
        process.exit(1);
    }

    // Masked URI for debugging
    const validURI = process.env.MONGO_URI.startsWith('mongodb');
    console.log(`MONGO_URI detected: ${validURI} (Length: ${process.env.MONGO_URI.length})`);

    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        console.log("✅ Connected to MongoDB");

        const email = 'admin@worksync.com';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let admin = await User.findOne({ email });

        if (admin) {
            console.log(`Found existing admin user: ${admin.email}`);
            admin.password = hashedPassword;
            admin.role = 'Admin';
            await admin.save();
            console.log(`✅ successfully updated password for ${email}`);
        } else {
            console.log("Admin user not found. Creating new one...");
            admin = new User({
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'Admin',
                employeeId: 'ADMIN001',
                position: 'System Administrator'
            });
            await admin.save();
            console.log(`✅ Successfully created new admin: ${email}`);
        }

        console.log(`\n==========================================`);
        console.log(`LOGIN CREDENTIALS:`);
        console.log(`Email:   ${email}`);
        console.log(`Password: ${password}`);
        console.log(`==========================================\n`);

        process.exit(0);
    } catch (err) {
        console.error("\n❌ OPERATION FAILED");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);

        if (err.name === 'MongooseServerSelectionError') {
            console.error("\n[Troubleshooting Guideline]");
            console.error("1. Check your internet connection.");
            console.error("2. Check if your IP address is whitelisted in MongoDB Atlas.");
            console.error("3. Verify the MONGO_URI in server/.env is correct.");
        }

        process.exit(1);
    }
};

resetAdmin();
