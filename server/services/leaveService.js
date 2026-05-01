const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const User = require('../models/User');

class LeaveService {
    async getLeaves(userRole, userId, page = 1, limit = 20) {
        let query = {};
        if (userRole !== 'Admin') {
            query.userId = userId;
        }

        const skip = (page - 1) * limit;

        const leaves = await Leave.find(query)
            .populate('userId', 'name email role profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Leave.countDocuments(query);

        return {
            data: leaves,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async submitLeave(userId, leaveData) {
        const { reason, startDate, endDate } = leaveData;
        const newLeave = new Leave({
            userId,
            reason,
            startDate,
            endDate
        });

        if (new Date(startDate) > new Date(endDate)) {
            throw new Error('End date cannot be before start date');
        }

        const overlap = await Leave.findOne({
            userId,
            status: { $ne: 'Rejected' },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlap) {
            throw new Error('Leave request overlaps with an existing leave.');
        }

        const savedLeave = await newLeave.save();

        const currentUser = await User.findById(userId);
        const admins = await User.find({ role: 'Admin' });
        const notifications = admins.map(admin => ({
            userId: admin._id,
            message: `New Leave Request from ${currentUser.name}: ${reason}`,
            type: 'info',
            link: '/' 
        }));
        await Notification.insertMany(notifications);

        await savedLeave.populate('userId', 'name email profileImage');
        return savedLeave;
    }

    async updateLeaveStatus(leaveId, status) {
        if (!['Approved', 'Rejected'].includes(status)) {
            throw new Error('Invalid status update');
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            leaveId,
            { status: status },
            { new: true }
        ).populate('userId', 'name email profileImage');

        if (!updatedLeave) {
            throw new Error('Leave not found');
        }

        await Notification.create({
            userId: updatedLeave.userId._id,
            message: `Your Leave Request for ${new Date(updatedLeave.startDate).toLocaleDateString()} has been ${status}.`,
            type: status === 'Approved' ? 'success' : 'error',
            link: '/' 
        });

        return updatedLeave;
    }

    async cancelLeave(leaveId, userId) {
        const leave = await Leave.findById(leaveId);
        if (!leave) throw new Error('Leave request not found');

        if (leave.userId.toString() !== userId.toString()) {
            throw new Error('Access Denied: You do not own this request');
        }

        if (leave.status !== 'Pending') {
            throw new Error('Cannot cancel leave that is already processed');
        }

        await Leave.findByIdAndDelete(leaveId);
        return { message: 'Leave request cancelled successfully' };
    }
}

module.exports = new LeaveService();
