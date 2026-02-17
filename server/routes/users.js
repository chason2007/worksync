const router = require('express').Router();
const User = require('../models/User');
const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

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
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('User not found');

        // Convert buffer to Base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const mimeType = req.file.mimetype;
        user.profileImage = `data:${mimeType};base64,${b64}`;

        await user.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage, // Send back the full Base64 string for immediate UI update
            user: { ...user.toObject(), password: undefined }
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
