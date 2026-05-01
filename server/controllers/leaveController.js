const leaveService = require('../services/leaveService');

class LeaveController {
    async getLeaves(req, res) {
        try {
            const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
            const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

            const result = await leaveService.getLeaves(req.user.role, req.user._id, page, limit);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async submitLeave(req, res) {
        try {
            const savedLeave = await leaveService.submitLeave(req.user._id, req.body);
            res.status(201).json(savedLeave);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async updateLeaveStatus(req, res) {
        if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

        try {
            const updatedLeave = await leaveService.updateLeaveStatus(req.params.id, req.body.status);
            res.json(updatedLeave);
        } catch (err) {
            if (err.message === 'Leave not found') return res.status(404).json({ error: err.message });
            res.status(400).json({ error: err.message });
        }
    }

    async cancelLeave(req, res) {
        try {
            const result = await leaveService.cancelLeave(req.params.id, req.user._id);
            res.json(result);
        } catch (err) {
            if (err.message === 'Leave request not found') return res.status(404).json({ error: err.message });
            if (err.message.startsWith('Access Denied')) return res.status(403).json({ error: err.message });
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = new LeaveController();
