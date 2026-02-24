const router = require('express').Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');
const path = require('node:path');
const fs = require('node:fs');
const { handleProfileImageUpload } = require('../utils/imageUploadHelper');



// SYSTEM STATS
router.get('/stats', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const totalUsers = await User.countDocuments({ email: { $ne: 'admin@worksync.com' } });

        res.json({
            todayAttendance,
            pendingLeaves,
            totalUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESET USER PASSWORD
router.put('/users/:id/reset-password', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { password: hashedPassword },
            { new: true }
        );

        if (!user) return res.status(404).send('User not found');

        res.json({ message: 'Password reset successfully', user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: err.message });
    }
});



// UPLOAD PROFILE IMAGE
router.post('/users/:id/upload-image', verify, upload.single('profileImage'), async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        // Get the user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        return handleProfileImageUpload(user, req.file, res);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});


// DEBUG TEST ROUTE
router.put('/test', (req, res) => {
    console.log("PUT /api/admin/test HIT!");
    res.json({ message: "Admin Test Route Works" });
});

// GET ALL USERS
router.get('/users', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE SPECIFIC USER
router.put('/users/:id', verify, async (req, res) => {
    // CONSOLE LOG REMOVED FOR SECURITY
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        // Check uniqueness of Employee ID if provided
        if (req.body.employeeId) {
            // Security Update: Cast to String to prevent NoSQL injection
            const existingUser = await User.findOne({ employeeId: String(req.body.employeeId) });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ error: 'Employee ID already exists assigned to another user' });
            }
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    role: req.body.role,
                    position: req.body.position,
                    employeeId: req.body.employeeId
                }
            },
            { new: true }
        );
        if (!updatedUser) return res.status(404).send('User not found');
        // Return user without password
        const userObj = updatedUser.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (err) {
        console.error("UPDATE USER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE SPECIFIC USER
router.delete('/users/:id', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        // Check if user to be deleted is an admin
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).send('User not found');

        if (userToDelete.role === 'Admin') {
            // Fetch requester's details to check if they are Super Admin
            const requester = await User.findById(req.user._id);
            console.log(`[DELETE ADMIN] Req: ${requester ? requester.email : 'Unknown'} vs Target: ${userToDelete.email}`);

            if (!requester || requester.email !== process.env.SUPER_ADMIN_EMAIL) {
                return res.status(403).json({ error: 'Only Super Admin (admin@worksync.com) can delete other Admins.' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ALL USERS (Except Admin)
router.delete('/users', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const result = await User.deleteMany({ email: { $ne: process.env.SUPER_ADMIN_EMAIL } });
        res.json({ message: `Deleted ${result.deletedCount} users.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ALL ATTENDANCE
router.delete('/attendance', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const result = await Attendance.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} attendance records.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE ALL LEAVES
router.delete('/leaves', verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        const result = await Leave.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} leave requests.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SYSTEM RESET (Danger Zone)
router.post('/reset-system', verify, async (req, res) => {
    // Only Admin can do this. Extra check: maybe require password confirmation or specific Super Admin check?
    // For now, standard Admin check.
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    try {
        // 1. Delete all Attendance
        await Attendance.deleteMany({});

        // 2. Delete all Leaves
        await Leave.deleteMany({});

        // 3. Delete all Users EXCEPT:
        //    a) The Super Admin (env var)
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com';

        // Security Check: Only allow Super Admin to perform this action
        const requester = await User.findById(req.user._id);
        if (!requester || requester.email !== superAdminEmail) {
            return res.status(403).json({ error: 'Access Denied: Only the Super Admin can reset the system.' });
        }

        await User.deleteMany({
            _id: { $ne: req.user._id },
            email: { $ne: superAdminEmail }
        });

        res.json({ message: 'System reset successfully. All data cleared.' });
    } catch (err) {
        console.error("System Reset Error:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
