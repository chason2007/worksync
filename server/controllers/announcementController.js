const announcementService = require('../services/announcementService');

class AnnouncementController {
    async getAllAnnouncements(req, res) {
        try {
            const announcements = await announcementService.getAllAnnouncements();
            res.json(announcements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAnnouncementById(req, res) {
        try {
            const announcement = await announcementService.getAnnouncementById(req.params.id);
            res.json(announcement);
        } catch (err) {
            if (err.message === 'Announcement not found') return res.status(404).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async createAnnouncement(req, res) {
        if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

        try {
            const { title, content } = req.body;
            const savedAnnouncement = await announcementService.createAnnouncement(req.user._id, title, content);
            res.json(savedAnnouncement);
        } catch (err) {
            if (err.message === 'Title and content are required') return res.status(400).json({ error: err.message });
            res.status(400).json({ error: err.message });
        }
    }

    async deleteAnnouncement(req, res) {
        if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

        try {
            const result = await announcementService.deleteAnnouncement(req.params.id);
            res.json(result);
        } catch (err) {
            if (err.message === 'Announcement not found') return res.status(404).send(err.message);
            res.status(500).json({ error: err.message });
        }
    }

    async deleteAllAnnouncements(req, res) {
        if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

        try {
            const result = await announcementService.deleteAllAnnouncements();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new AnnouncementController();
