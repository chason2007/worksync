const Notification = require('../models/Notification');

class NotificationService {
    async clearAll(userId) {
        await Notification.deleteMany({ userId });
        return { message: 'All notifications cleared' };
    }

    async getNotifications(userId) {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);
    }

    async markAsRead(userId, notificationId) {
        return await Notification.findOneAndUpdate(
            { _id: String(notificationId), userId },
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId) {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return { message: 'All marked as read' };
    }
}

module.exports = new NotificationService();
