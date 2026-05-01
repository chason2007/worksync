const authService = require('../services/authService');

class AuthController {
    async seedAdmin(req, res) {
        try {
            const result = await authService.seedAdmin();
            res.send(result.message);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await authService.getUserById(req.user._id);
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async register(req, res) {
        if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

        try {
            const savedUser = await authService.registerUser(req.body);
            res.send(savedUser);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body;
            const result = await authService.loginUser(email, password, rememberMe);
            res.header('auth-token', result.token).send(result);
        } catch (err) {
            if (err.message === 'Email is wrong' || err.message === 'Invalid password') {
                res.status(400).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        }
    }
}

module.exports = new AuthController();
