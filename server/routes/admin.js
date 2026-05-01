const router = require('express').Router();
const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const adminController = require('../controllers/adminController');

// SYSTEM STATS
router.get('/stats', verify, adminController.getStats);

// RESET USER PASSWORD
router.put('/users/:id/reset-password', verify, adminController.resetUserPassword);

// UPLOAD PROFILE IMAGE
router.post('/users/:id/upload-image', verify, upload.single('profileImage'), adminController.uploadUserImage);

// DEBUG TEST ROUTE
router.put('/test', verify, (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).send('Access Denied');
    res.json({ message: "Admin Test Route Works" });
});

// GET ALL USERS
router.get('/users', verify, adminController.getAllUsers);

// UPDATE SPECIFIC USER
router.put('/users/:id', verify, adminController.updateUser);

// DELETE SPECIFIC USER
router.delete('/users/:id', verify, adminController.deleteUser);

// DELETE ALL USERS (Except Admin)
router.delete('/users', verify, adminController.deleteAllUsers);

// DELETE ALL ATTENDANCE
router.delete('/attendance', verify, adminController.deleteAllAttendance);

// DELETE ALL LEAVES
router.delete('/leaves', verify, adminController.deleteAllLeaves);

// SYSTEM RESET (Danger Zone)
router.post('/reset-system', verify, adminController.resetSystem);

module.exports = router;
