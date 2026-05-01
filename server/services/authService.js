const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async seedAdmin() {
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com';
        const existing = await User.findOne({ email });
        if (existing) return { message: 'Admin account already exists.' };

        if (!process.env.SUPER_ADMIN_PASSWORD) {
            throw new Error('Server configuration error: SUPER_ADMIN_PASSWORD is not set.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

        const admin = new User({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'Admin',
            position: 'System Owner',
            employeeId: 'ADMIN001'
        });
        await admin.save();
        return { message: 'Admin account created successfully. You can now login.' };
    }

    async getUserById(userId) {
        return await User.findById(userId).select('-password');
    }

    async registerUser(userData) {
        const email = userData.email.trim().toLowerCase();
        
        const emailExist = await User.findOne({ email });
        if (emailExist) throw new Error('Email already exists');

        let newEmployeeId = userData.employeeId;
        if (newEmployeeId) {
            const idExist = await User.findOne({ employeeId: String(newEmployeeId) });
            if (idExist) throw new Error('Employee ID already exists');
        } else {
            newEmployeeId = 'EMP001';
            const lastUser = await User.findOne({ employeeId: { $exists: true } }).sort({ employeeId: -1 });
            if (lastUser?.employeeId) {
                const match = lastUser.employeeId.match(/^EMP(\d+)$/);
                if (match) {
                    const nextNum = Number.parseInt(match[1], 10) + 1;
                    newEmployeeId = `EMP${String(nextNum).padStart(3, '0')}`;
                }
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = new User({
            name: userData.name,
            email: email,
            password: hashedPassword,
            role: userData.role || 'Employee',
            position: userData.position,
            employeeId: newEmployeeId
        });

        return await user.save();
    }

    async loginUser(email, password, rememberMe) {
        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) throw new Error('Email is wrong');

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) throw new Error('Invalid password');

        const expiresIn = rememberMe ? '7d' : '24h';
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        };
    }
}

module.exports = new AuthService();
