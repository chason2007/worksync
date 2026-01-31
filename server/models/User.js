const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // In production, hash this with bcrypt!
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    position: String,
    salary: Number, // Basic fixed salary for payroll module
    profileImage: String, // Filename of uploaded profile image
    employeeId: { type: String, unique: true },
});

module.exports = mongoose.model('User', UserSchema);