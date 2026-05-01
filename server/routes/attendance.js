const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const attendanceController = require('../controllers/attendanceController');

// Check if user has attendance for today
router.get('/today/:userId', verify, attendanceController.getTodayAttendance);

// Get User Stats
router.get('/stats/:userId', verify, attendanceController.getStats);

// Mark Attendance
router.post('/mark', verify, attendanceController.markAttendance);

// Update Attendance (Admin only)
router.put('/:id', verify, attendanceController.updateAttendance);

// Get Logs for a User
router.get('/user/:userId', verify, attendanceController.getUserLogs);

// Get ALL Logs (Admin only)
router.get('/', verify, attendanceController.getAllLogs);

module.exports = router;