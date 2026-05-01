const router = require('express').Router();
const verify = require('./verifyToken');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// Auth specific rate limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    message: 'Too many login attempts, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

// SEED ADMIN (One-time setup for production)
router.get('/seed-admin', authController.seedAdmin);

// GET CURRENT USER
router.get('/user', verify, authController.getCurrentUser);

// REGISTER (Create a new user)
router.post('/register', authLimiter, verify, authController.register);

// LOGIN (Authenticate user)
router.post('/login', authLimiter, authController.login);

module.exports = router;