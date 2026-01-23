const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER (Create a new user)
router.post('/register', async (req, res) => {
    console.log("Register endpoint hit with body:", req.body);
    try {
        // 1. Check if user already exists
        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) return res.status(400).send('Email already exists');

        // 2. Hash the password (encrypt it)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'Employee', // Default to Employee
            salary: req.body.salary
        });

        const savedUser = await user.save();
        res.send({ user: savedUser._id });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(400).json({ error: err.message, stack: err.stack });
    }
});

// LOGIN (Authenticate user)
router.post('/login', async (req, res) => {
    try {
        // 1. Check if the email exists
        const user = await User.findOne({ email: req.body.email });
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
                role: user.role
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send(err.message);
    }
});

module.exports = router;