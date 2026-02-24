const router = require('express').Router();
const User = require('../models/User');
const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const path = require('node:path');
const fs = require('node:fs');
const { handleProfileImageUpload } = require('../utils/imageUploadHelper');

// GET OWN PROFILE
router.get('/profile', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE OWN PROFILE
router.put('/profile', verify, async (req, res) => {
    try {
        const { phone, address, name, preferences } = req.body;

        // Construct update object
        const updateData = { name, phone, address };

        // Handle nested preferences update if provided
        if (preferences) {
            for (const key in preferences) {
                updateData[`preferences.${key}`] = preferences[key];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD PROFILE IMAGE
router.post('/profile/image', verify, upload.single('profileImage'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('User not found');

        return handleProfileImageUpload(user, req.file, res);
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// CHECK IF EMPLOYEE ID EXISTS
router.get('/check-id/:id', verify, async (req, res) => {
    try {
        const user = await User.findOne({ employeeId: String(req.params.id) });
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET NEXT EMPLOYEE ID
router.get('/next-id', verify, async (req, res) => {
    try {
        const lastUser = await User.findOne({ employeeId: { $exists: true } }).sort({ employeeId: -1 });
        let nextId = 'EMP001';

        if (lastUser && lastUser.employeeId) {
            const match = lastUser.employeeId.match(/^EMP(\d+)$/);
            if (match) {
                const nextNum = Number.parseInt(match[1], 10) + 1;
                nextId = `EMP${String(nextNum).padStart(3, '0')}`;
            }
        }
        res.json({ nextId });
    } catch (err) {
        console.error("Error in /next-id:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
