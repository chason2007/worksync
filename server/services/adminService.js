const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const bcrypt = require('bcryptjs');

class AdminService {
    async getStats() {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const totalUsers = await User.countDocuments({ email: { $ne: process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com' } });

        return { todayAttendance, pendingLeaves, totalUsers };
    }

    async resetUserPassword(userId, newPassword) {
        if (!newPassword) throw new Error('New password is required');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const user = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!user) throw new Error('User not found');
        return { message: 'Password reset successfully', user: { name: user.name, email: user.email } };
    }

    async getAllUsers() {
        return await User.find({}, '-password');
    }

    async updateUser(userId, data) {
        if (data.employeeId) {
            const existingUser = await User.findOne({ employeeId: String(data.employeeId) });
            if (existingUser && existingUser._id.toString() !== userId) {
                throw new Error('Employee ID already exists assigned to another user');
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    position: data.position,
                    employeeId: data.employeeId
                }
            },
            { new: true }
        );

        if (!updatedUser) throw new Error('User not found');
        const userObj = updatedUser.toObject();
        delete userObj.password;
        return userObj;
    }

    async deleteUser(requesterId, userIdToDelete) {
        const userToDelete = await User.findById(userIdToDelete);
        if (!userToDelete) throw new Error('User not found');

        if (userToDelete.role === 'Admin') {
            const requester = await User.findById(requesterId);
            if (!requester || requester.email !== process.env.SUPER_ADMIN_EMAIL) {
                throw new Error('Only Super Admin can delete other Admins');
            }
        }

        await User.findByIdAndDelete(userIdToDelete);
        return { message: 'User deleted' };
    }

    async deleteAllUsers() {
        const result = await User.deleteMany({ email: { $ne: process.env.SUPER_ADMIN_EMAIL } });
        return { message: `Deleted ${result.deletedCount} users.` };
    }

    async deleteAllAttendance() {
        const result = await Attendance.deleteMany({});
        return { message: `Deleted ${result.deletedCount} attendance records.` };
    }

    async deleteAllLeaves() {
        const result = await Leave.deleteMany({});
        return { message: `Deleted ${result.deletedCount} leave requests.` };
    }

    async resetSystem(requesterId) {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com';
        
        const requester = await User.findById(requesterId);
        if (!requester || requester.email !== superAdminEmail) {
            throw new Error('Access Denied: Only the Super Admin can reset the system.');
        }

        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        await User.deleteMany({
            _id: { $ne: requesterId },
            email: { $ne: superAdminEmail }
        });

        return { message: 'System reset successfully. All data cleared.' };
    }
}

module.exports = new AdminService();
