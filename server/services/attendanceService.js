const Attendance = require('../models/Attendance');

class AttendanceService {
    async getTodayAttendance(userRole, currentUserId, targetUserId) {
        if (userRole !== 'Admin' && currentUserId !== targetUserId) {
            throw new Error('Access Denied: You can only view your own attendance.');
        }

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const attendance = await Attendance.findOne({
            userId: String(targetUserId),
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        return {
            hasAttendance: !!attendance,
            attendance: attendance || null
        };
    }

    async getStats(userRole, currentUserId, targetUserId) {
        if (userRole !== 'Admin' && currentUserId !== targetUserId) {
            throw new Error('Access Denied: You can only view your own stats.');
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const totalPresent = await Attendance.countDocuments({
            userId: String(targetUserId),
            status: 'Present'
        });

        const totalHalfDays = await Attendance.countDocuments({
            userId: String(targetUserId),
            status: 'Half-day'
        });

        const thisMonthPresent = await Attendance.countDocuments({
            userId: String(targetUserId),
            status: 'Present',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        return {
            totalPresent,
            totalHalfDays,
            thisMonthPresent
        };
    }

    async markAttendance(userId, status) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const existingAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingAttendance) {
            throw new Error('Attendance already marked for today');
        }

        const newRecord = new Attendance({
            userId,
            status,
            date: new Date()
        });

        return await newRecord.save();
    }

    async updateAttendance(adminId, recordId, status) {
        if (!status) {
            throw new Error('Status is required');
        }

        const attendance = await Attendance.findByIdAndUpdate(
            recordId,
            {
                status,
                modifiedBy: adminId,
                modifiedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email profileImage');

        if (!attendance) {
            throw new Error('Attendance record not found');
        }

        return attendance;
    }

    async getUserLogs(userRole, currentUserId, targetUserId, page = 1, limit = 20) {
        if (userRole !== 'Admin' && currentUserId !== targetUserId) {
            throw new Error('Access Denied: You can only view your own logs.');
        }

        const skip = (page - 1) * limit;
        const query = { userId: String(targetUserId) };

        const logs = await Attendance.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Attendance.countDocuments(query);

        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getAllLogs(from, to, date, page = 1, limit = 50) {
        let query = {};

        if (from && to) {
            query.date = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        } else if (date) {
            const startOfDay = new Date(date + 'T00:00:00.000Z');
            const endOfDay = new Date(date + 'T23:59:59.999Z');
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const skip = (page - 1) * limit;

        const logs = await Attendance.find(query)
            .populate('userId', 'name email role profileImage')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Attendance.countDocuments(query);

        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new AttendanceService();
