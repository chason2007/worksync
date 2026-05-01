const userService = require('../services/userService');
const User = require('../models/User');
const { handleProfileImageUpload } = require('../utils/imageUploadHelper');

class UserController {
    async getProfile(req, res) {
        try {
            const user = await userService.getProfile(req.user._id);
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const updatedUser = await userService.updateProfile(req.user._id, req.body);
            res.json(updatedUser);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async uploadProfileImage(req, res) {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).send('User not found');
            return handleProfileImageUpload(user, req.file, res);
        } catch (err) {
            console.error('Upload Error:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async checkEmployeeId(req, res) {
        try {
            const result = await userService.checkEmployeeId(req.params.id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getNextEmployeeId(req, res) {
        try {
            const result = await userService.getNextEmployeeId();
            res.json(result);
        } catch (err) {
            console.error("Error in /next-id:", err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UserController();
