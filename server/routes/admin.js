const router = require('express').Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const verify = require('./verifyToken');

// DELETE ALL USERS (Except Admin)
router.delete('/users', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        const result = await User.deleteMany({ email: { $ne: 'admin@company.com' } });
        res.json({ message: `Deleted ${result.deletedCount} users.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ALL ATTENDANCE
router.delete('/attendance', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        const result = await Attendance.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} attendance records.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL USERS (New)
router.get('/users', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const users = await User.find({}, '-password'); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE SPECIFIC USER (New)
router.delete('/users/:id', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).send('User not found');
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
