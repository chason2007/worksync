const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

const verify = require('./verifyToken');

// Mark Attendance
router.post('/mark', async (req, res) => {
    try {
        const { userId, status } = req.body;
        const newRecord = new Attendance({ userId, status });
        await newRecord.save();
        res.status(201).json(newRecord);
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