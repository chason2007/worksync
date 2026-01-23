const mongoose = require('mongoose');
require('dotenv').config();

const atlasUri = process.env.MONGO_URI;
const localUri = 'mongodb://localhost:27017/employeeDB';

async function testConnection(uri, name) {
    console.log(`Testing connection to ${name}...`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ Success: Connected to ${name}`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ Failed: Could not connect to ${name}`);
        console.log(`   Error: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log("--- Diagnostic: MongoDB Connection Test ---");

    // Test Localhost first (faster)
    const localWorks = await testConnection(localUri, "Localhost");

    // Test Atlas
    const atlasWorks = await testConnection(atlasUri, "Atlas (Cloud)");

    console.log("-------------------------------------------");
    if (localWorks && !atlasWorks) {
        console.log("RECOMMENDATION: Switch to Localhost. Your local MongoDB is running, but Atlas is blocked.");
    } else if (atlasWorks) {
        console.log("RECOMMENDATION: Atlas is reachable. The previous error might have been transient.");
    } else {
        console.log("RECOMMENDATION: Neither worked. Please ensure MongoDB is running locally OR checks your internet/firewall for Atlas.");
    }
}

run();
