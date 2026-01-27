const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

const verify = require('./verifyToken');

// Check if user has attendance for today
router.get('/today/:userId', verify, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const attendance = await Attendance.findOne({
            userId: req.params.userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        res.json({
            hasAttendance: !!attendance,
            attendance: attendance || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Attendance (with duplicate prevention)
router.post('/mark', verify, async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Check if user already has attendance for today
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const existingAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                error: 'Attendance already submitted for today',
                attendance: existingAttendance
            });
        }

        // Create new attendance record
        const newRecord = new Attendance({ userId, status });
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Attendance (Admin only)
router.put('/:id', verify, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access Denied: Admins Only' });
        }

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                status,
                modifiedBy: req.user._id,
                modifiedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email');

        if (!attendance) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json({
            message: 'Attendance updated successfully',
            attendance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Logs for a User
router.get('/:userId', async (req, res) => {
    try {
        const logs = await Attendance.find({ userId: req.params.userId });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get ALL Logs (Admin only)
router.get('/', verify, async (req, res) => {
    try {
        // Check if user is admin (req.user is populated by verifyToken)
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Access Denied: Admins Only');
        }

        let query = {};
        if (req.query.date) {
            const date = new Date(req.query.date);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Find records based on query
        const logs = await Attendance.find(query).populate('userId', 'name email role');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;