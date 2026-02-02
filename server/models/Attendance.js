const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent', 'Half-day'] },
    clockInTime: { type: Date },
    clockOutTime: { type: Date }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);