const router = require('express').Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');



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
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the user and delete old profile image if exists
        const user = await User.findById(req.params.id);
        if (!user) {
            // Delete uploaded file since user doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(404).send('User not found');
        }

        // Delete old profile image if it exists
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, '../public/uploads/profiles', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update user with new profile image filename
        user.profileImage = req.file.filename;
        await user.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: req.file.filename,
            user: { ...user.toObject(), password: undefined }
        });
    } catch (err) {
        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
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
    console.log(`[DEBUG] PUT /users/${req.params.id}`, req.body); // Log receipt
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    try {
        // Check uniqueness of Employee ID if provided
        if (req.body.employeeId) {
            const existingUser = await User.findOne({ employeeId: req.body.employeeId });
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
                    salary: req.body.salary,
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

module.exports = router;
