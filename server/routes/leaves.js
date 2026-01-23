const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const verify = require('./verifyToken');

// GET ALL LEAVES (or just user's)
router.get('/', verify, async (req, res) => {
    try {
        let query = {};
        // If not admin, only show own leaves
        if (req.user.role !== 'Admin') {
            query.userId = req.user._id;
        }

        const leaves = await Leave.find(query).populate('userId', 'name email role').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUBMIT LEAVE REQUEST
router.post('/', verify, async (req, res) => {
    try {
        const { reason, startDate, endDate } = req.body;
        const newLeave = new Leave({
            userId: req.user._id, // From token
            reason,
            startDate,
            endDate
        });
        const savedLeave = await newLeave.save();
        res.status(201).json(savedLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// APPROVE/REJECT LEAVE (Admin Only)
router.put('/:id', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate('userId', 'name email');

        res.json(updatedLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;