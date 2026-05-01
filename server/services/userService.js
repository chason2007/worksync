const User = require('../models/User');

class UserService {
    async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) throw new Error('User not found');
        return user;
    }

    async updateProfile(userId, data) {
        const { phone, address, name, preferences } = data;
        const updateData = { name, phone, address };

        if (preferences) {
            for (const key in preferences) {
                updateData[`preferences.${key}`] = preferences[key];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) throw new Error('User not found');
        return updatedUser;
    }

    async checkEmployeeId(employeeId) {
        const user = await User.findOne({ employeeId: String(employeeId) });
        return { exists: !!user };
    }

    async getNextEmployeeId() {
        const lastUser = await User.findOne({ employeeId: { $exists: true } }).sort({ employeeId: -1 });
        let nextId = 'EMP001';

        if (lastUser?.employeeId) {
            const match = lastUser.employeeId.match(/^EMP(\d+)$/);
            if (match) {
                const nextNum = Number.parseInt(match[1], 10) + 1;
                nextId = `EMP${String(nextNum).padStart(3, '0')}`;
            }
        }
        return { nextId };
    }
}

module.exports = new UserService();
