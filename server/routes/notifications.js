const router = require('express').Router();
const Notification = require('../models/Notification');
const verify = require('./verifyToken');

// Clear All Notifications
router.delete('/clear-all', verify, async (req, res) => {
    console.log("Attempting to clearing all notifications for user:", req.user._id);
    try {
        await Notification.deleteMany({ userId: req.user._id });
        console.log("Successfully cleared notifications");
        res.json({ message: 'All notifications cleared' });
    } catch (err) {
        console.error("Error clearing notifications:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get Notifications for User
router.get('/', verify, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20); // Last 20
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Single Notification as Read
router.put('/:id/read', verify, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: String(req.params.id), userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark All as Read
router.put('/mark-all-read', verify, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Internal Helper: Create Notification (Not exposed as route, used by other routes)
// But to keep it simple, we will import the model directly in other files.

module.exports = router;
