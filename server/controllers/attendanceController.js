const attendanceService = require('../services/attendanceService');

class AttendanceController {
    async getTodayAttendance(req, res) {
        try {
            const result = await attendanceService.getTodayAttendance(req.user.role, req.user._id, req.params.userId);
            res.json(result);
        } catch (err) {
            if (err.message.startsWith('Access Denied')) return res.status(403).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async getStats(req, res) {
        try {
            const result = await attendanceService.getStats(req.user.role, req.user._id, req.params.userId);
            res.json(result);
        } catch (err) {
            if (err.message.startsWith('Access Denied')) return res.status(403).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async markAttendance(req, res) {
        try {
            const result = await attendanceService.markAttendance(req.user._id, req.body.status);
            res.status(201).json(result);
        } catch (err) {
            if (err.message === 'Attendance already marked for today') {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: err.message });
        }
    }

    async updateAttendance(req, res) {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access Denied: Admins Only' });
        }

        try {
            const attendance = await attendanceService.updateAttendance(req.user._id, req.params.id, req.body.status);
            res.json({ message: 'Attendance updated successfully', attendance });
        } catch (err) {
            if (err.message === 'Status is required') return res.status(400).json({ error: err.message });
            if (err.message === 'Attendance record not found') return res.status(404).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async getUserLogs(req, res) {
        try {
            const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
            const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

            const result = await attendanceService.getUserLogs(req.user.role, req.user._id, req.params.userId, page, limit);
            res.json(result);
        } catch (err) {
            if (err.message.startsWith('Access Denied')) return res.status(403).json({ error: err.message });
            res.status(500).json({ error: err.message });
        }
    }

    async getAllLogs(req, res) {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Access Denied: Admins Only');
        }

        try {
            const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
            const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));

            const result = await attendanceService.getAllLogs(req.query.from, req.query.to, req.query.date, page, limit);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new AttendanceController();
