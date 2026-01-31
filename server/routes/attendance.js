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
        ).populate('userId', 'name email profileImage');

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
// Get Logs for a User (with Pagination)
router.get('/user/:userId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { userId: req.params.userId };

        const logs = await Attendance.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Attendance.countDocuments(query);

        res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
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

        // Date Filtering
        // Priority: Explicit Range (from/to) > Simple Date (UTC Day)
        if (req.query.from && req.query.to) {
            query.date = {
                $gte: new Date(req.query.from),
                $lte: new Date(req.query.to)
            };
        } else if (req.query.date) {
            console.log('Query Date param:', req.query.date);
            // Fallback: Full UTC day for the given date string
            const startOfDay = new Date(req.query.date + 'T00:00:00.000Z');
            const endOfDay = new Date(req.query.date + 'T23:59:59.999Z');
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Find records based on query
        const logs = await Attendance.find(query)
            .populate('userId', 'name email role profileImage')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Attendance.countDocuments(query);

        console.log(`Found ${logs.length} logs (Page ${page} of ${Math.ceil(total / limit)}).`);

        res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;