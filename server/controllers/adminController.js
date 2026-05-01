const adminService = require('../services/adminService');
const User = require('../models/User');
const { handleProfileImageUpload } = require('../utils/imageUploadHelper');

class AdminController {
    _checkAdmin(req, res) {
        if (req.user.role !== 'Admin') {
            res.status(403).send('Access Denied');
            return false;
        }
        return true;
    }

    async getStats(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const stats = await adminService.getStats();
            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async resetUserPassword(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.resetUserPassword(req.params.id, req.body.newPassword);
            res.json(result);
        } catch (err) {
            if (err.message === 'New password is required') return res.status(400).json({ error: err.message });
            if (err.message === 'User not found') return res.status(404).send(err.message);
            res.status(500).json({ error: err.message });
        }
    }

    async uploadUserImage(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).send('User not found');
            return handleProfileImageUpload(user, req.file, res);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAllUsers(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const users = await adminService.getAllUsers();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateUser(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.updateUser(req.params.id, req.body);
            res.json(result);
        } catch (err) {
            if (err.message === 'Employee ID already exists assigned to another user') return res.status(400).json({ error: err.message });
            if (err.message === 'User not found') return res.status(404).send(err.message);
            res.status(500).json({ error: err.message });
        }
    }

    async deleteUser(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.deleteUser(req.user._id, req.params.id);
            res.json(result);
        } catch (err) {
            if (err.message === 'User not found') return res.status(404).send(err.message);
            if (err.message.startsWith('Only Super Admin')) return res.status(403).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async deleteAllUsers(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.deleteAllUsers();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deleteAllAttendance(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.deleteAllAttendance();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deleteAllLeaves(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.deleteAllLeaves();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async resetSystem(req, res) {
        if (!new AdminController()._checkAdmin(req, res)) return;
        try {
            const result = await adminService.resetSystem(req.user._id);
            res.json(result);
        } catch (err) {
            if (err.message.startsWith('Access Denied')) return res.status(403).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new AdminController();
