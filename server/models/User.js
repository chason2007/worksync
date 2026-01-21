const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // In production, hash this with bcrypt!
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    salary: Number, // Basic fixed salary for payroll module
});

module.exports = mongoose.model('User', UserSchema);