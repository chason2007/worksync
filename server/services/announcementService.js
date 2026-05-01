const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

class AnnouncementService {
    async getAllAnnouncements() {
        return await Announcement.find()
            .populate('postedBy', 'name role')
            .sort({ createdAt: -1 });
    }

    async getAnnouncementById(id) {
        const announcement = await Announcement.findById(id).populate('postedBy', 'name role');
        if (!announcement) {
            throw new Error('Announcement not found');
        }
        return announcement;
    }

    async createAnnouncement(userId, title, content) {
        if (!title || !content) {
            throw new Error('Title and content are required');
        }

        const announcement = new Announcement({
            title,
            content,
            postedBy: userId
        });

        const savedAnnouncement = await announcement.save();
        await savedAnnouncement.populate('postedBy', 'name role');

        const users = await User.find({ _id: { $ne: userId } });
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

        return savedAnnouncement;
    }

    async deleteAnnouncement(id) {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            throw new Error('Announcement not found');
        }
        return { message: 'Announcement deleted' };
    }

    async deleteAllAnnouncements() {
        await Announcement.deleteMany({});
        await Notification.deleteMany({ link: { $regex: 'announcementId' } });
        return { message: 'All announcements deleted' };
    }
}

module.exports = new AnnouncementService();
