const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // In production, hash this with bcrypt!
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    position: String,
    profileImage: String, // Base64 string of the image
    employeeId: { type: String, unique: true },
    phone: String,
    address: String,
    preferences: {
        theme: { type: String, default: 'system' }, // 'light', 'dark', 'system'
        timezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, default: 'YYYY-MM-DD' },
        language: { type: String, default: 'en' }
    }
});

module.exports = mongoose.model('User', UserSchema);