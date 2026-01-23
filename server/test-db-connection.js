const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log("Testing MongoDB Connection & Query...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log("SUCCESS: MongoDB Connected!");
        try {
            console.log("Attempting PING...");
            await mongoose.connection.db.admin().ping();
            console.log("SUCCESS: PING passed!");

            console.log("Attempting findOne User...");
            const User = require('./models/User'); // Ensure this path is correct
            await User.findOne();
            console.log("SUCCESS: Query passed!");

            process.exit(0);
        } catch (err) {
            console.error("ERROR: Query Failed after connection");
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error("ERROR: MongoDB Connection Failed");
        console.error(err);
        process.exit(1);
    });
