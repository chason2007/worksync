const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

// GET OWN PROFILE
router.get('/profile', verify, userController.getProfile);

// UPDATE OWN PROFILE
router.put('/profile', verify, userController.updateProfile);

// UPLOAD PROFILE IMAGE
router.post('/profile/image', verify, upload.single('profileImage'), userController.uploadProfileImage);

// CHECK IF EMPLOYEE ID EXISTS
router.get('/check-id/:id', verify, userController.checkEmployeeId);

// GET NEXT EMPLOYEE ID
router.get('/next-id', verify, userController.getNextEmployeeId);

module.exports = router;
