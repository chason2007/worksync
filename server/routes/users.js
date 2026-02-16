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
        const { phone, address, name } = req.body; // Allow name update too? Maybe just phone/address for now to match plan. Plan said "Update name, phone, address".

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name,
                    phone,
                    address
                }
            },
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

        // Delete old image
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, '../public/uploads/profiles', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        user.profileImage = req.file.filename;
        await user.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: req.file.filename,
            user: { ...user.toObject(), password: undefined }
        });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
