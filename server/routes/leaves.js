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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const leaves = await Leave.find(query)
            .populate('userId', 'name email role profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Leave.countDocuments(query);

        res.json({
            data: leaves,
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

        // Validation: Date logic
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'End date cannot be before start date' });
        }

        // Validation: Overlap check
        const overlap = await Leave.findOne({
            userId: req.user._id,
            status: { $ne: 'Rejected' },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlap) {
            return res.status(400).json({ error: 'Leave request overlaps with an existing leave.' });
        }

        const savedLeave = await newLeave.save();
        // Populate user details so frontend can display it immediately
        await savedLeave.populate('userId', 'name email profileImage');
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
        ).populate('userId', 'name email profileImage');

        res.json(updatedLeave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

// CANCEL LEAVE (User can cancel own Pending leaves)
router.delete('/:id', verify, async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave request not found' });

        // Check ownership
        if (leave.userId.toString() !== req.user._id) {
            return res.status(403).json({ error: 'Access Denied' });
        }

        // Check status
        if (leave.status !== 'Pending') {
            return res.status(400).json({ error: 'Cannot cancel leave that is already processed' });
        }

        await Leave.findByIdAndDelete(req.params.id);
        res.json({ message: 'Leave request cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});