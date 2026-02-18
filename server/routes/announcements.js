const router = require('express').Router();
const Announcement = require('../models/Announcement');
const verify = require('./verifyToken');

// GET ALL ANNOUNCEMENTS
router.get('/', verify, async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('postedBy', 'name role')
            .sort({ createdAt: -1 }); // Newest first
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE ANNOUNCEMENT (Admin Only)
router.post('/', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcement = new Announcement({
        title,
        content,
        postedBy: req.user._id
    });

    try {
        const savedAnnouncement = await announcement.save();
        // Populate postedBy to return complete object
        await savedAnnouncement.populate('postedBy', 'name role');

        // Create notification for all users except the sender
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const users = await User.find({ _id: { $ne: req.user._id } });

        const notifications = users.map(user => ({
            userId: user._id,
            message: `New Announcement: ${title}`,
            type: 'info',
            link: `/?announcementId=${savedAnnouncement._id}`,
            isRead: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.json(savedAnnouncement);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET SINGLE ANNOUNCEMENT
router.get('/:id', verify, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id).populate('postedBy', 'name role');
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ANNOUNCEMENT (Admin Only)
router.delete('/:id', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
        if (!deletedAnnouncement) return res.status(404).send('Announcement not found');
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
