const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./verifyToken');
const rateLimit = require('express-rate-limit');

// Auth specific rate limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 5 login/register requests per hour
    message: 'Too many login attempts, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

// SEED ADMIN (One-time setup for production)
router.get('/seed-admin', async (req, res) => {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@worksync.com';
        const existing = await User.findOne({ email: email });
        if (existing) return res.send('Admin account already exists.');

        const salt = await bcrypt.genSalt(10);
        // SECURITY UPDATE: Removed hardcoded 'admin' fallback which is a severe vulnerability.
        // It will now throw an error if SUPER_ADMIN_PASSWORD is not set in the environment.
        if (!process.env.SUPER_ADMIN_PASSWORD) {
            return res.status(500).send('Server configuration error: SUPER_ADMIN_PASSWORD is not set.');
        }
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

        const admin = new User({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'Admin',
            position: 'System Owner',
            employeeId: 'ADMIN001'
        });
        await admin.save();
        res.send('Admin account created successfully. You can now login.');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET CURRENT USER
router.get('/user', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REGISTER (Create a new user)
router.post('/register', authLimiter, verify, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');

    // CONSOLE LOG REMOVED FOR SECURITY
    try {
        const email = req.body.email.trim().toLowerCase();

        // 1. Check if user already exists
        const emailExist = await User.findOne({ email: email });
        if (emailExist) return res.status(400).send('Email already exists');

        let newEmployeeId = req.body.employeeId;

        // Validation for custom ID
        if (newEmployeeId) {
            // Security Update: Cast to String to prevent NoSQL injection if req.body.employeeId is an object
            const idExist = await User.findOne({ employeeId: String(newEmployeeId) });
            if (idExist) return res.status(400).send('Employee ID already exists');
        } else {
            // Auto-generate Employee ID if not provided
            newEmployeeId = 'EMP001';
            const lastUser = await User.findOne({ employeeId: { $exists: true } }).sort({ employeeId: -1 });
            if (lastUser?.employeeId) {
                const match = lastUser.employeeId.match(/^EMP(\d+)$/);
                if (match) {
                    const nextNum = Number.parseInt(match[1], 10) + 1;
                    newEmployeeId = `EMP${String(nextNum).padStart(3, '0')}`;
                }
            }
        }

        // 2. Hash the password (encrypt it)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create a new user
        const user = new User({
            name: req.body.name,
            email: email,
            password: hashedPassword,
            role: req.body.role || 'Employee', // Default to Employee
            position: req.body.position,
            employeeId: newEmployeeId
        });

        const savedUser = await user.save();
        res.send(savedUser);

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(400).json({ error: err.message, stack: err.stack });
    }
});

// LOGIN (Authenticate user)
router.post('/login', authLimiter, async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();

        // 1. Check if the email exists
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send('Email is wrong');

        // 2. Check if password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).send('Invalid password');

        // 3. Create and assign a token
        // The payload ({_id, role}) is what "verifyToken" will read later!
        const expiresIn = req.body.rememberMe ? '7d' : '24h';
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: expiresIn }
        );

        // 4. Return the token and user info to the frontend
        res.header('auth-token', token).send({
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send(err.message);
    }
});

module.exports = router;