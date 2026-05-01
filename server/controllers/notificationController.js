const notificationService = require('../services/notificationService');

class NotificationController {
    async clearAll(req, res) {
        try {
            const result = await notificationService.clearAll(req.user._id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getNotifications(req, res) {
        try {
            const result = await notificationService.getNotifications(req.user._id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const result = await notificationService.markAsRead(req.user._id, req.params.id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const result = await notificationService.markAllAsRead(req.user._id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new NotificationController();
