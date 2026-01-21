const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

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

module.exports = router;