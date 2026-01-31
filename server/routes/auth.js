const router = require('express').Router();
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const verify = require('./verifyToken');

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
router.post('/register', async (req, res) => {
    console.log("Register endpoint hit with body:", req.body);
    try {
        const email = req.body.email.trim().toLowerCase();

        // 1. Check if user already exists
        const emailExist = await User.findOne({ email: email });
        if (emailExist) return res.status(400).send('Email already exists');

        // Check if Employee ID is provided or auto-generate
        let employeeId = req.body.employeeId;

        if (employeeId) {
            // Check uniqueness if provided manually
            const idExist = await User.findOne({ employeeId: employeeId });
            if (idExist) return res.status(400).send('Employee ID already exists');
        } else {
            // Auto-generate if not provided
            employeeId = 'EMP001';
            const lastUser = await User.findOne({ employeeId: { $exists: true } }).sort({ _id: -1 });
            if (lastUser && lastUser.employeeId) {
                const match = lastUser.employeeId.match(/^EMP(\d+)$/);
                if (match) {
                    const nextNum = parseInt(match[1], 10) + 1;
                    employeeId = `EMP${String(nextNum).padStart(3, '0')}`;
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
            salary: req.body.salary,
            employeeId: employeeId
        });

        const savedUser = await user.save();
        res.send(savedUser);

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(400).json({ error: err.message, stack: err.stack });
    }
});

// LOGIN (Authenticate user)
router.post('/login', async (req, res) => {
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
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
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