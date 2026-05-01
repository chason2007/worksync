const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const notificationController = require('../controllers/notificationController');

// Clear All Notifications
router.delete('/clear-all', verify, notificationController.clearAll);

// Get Notifications for User
router.get('/', verify, notificationController.getNotifications);

// Mark Single Notification as Read
router.put('/:id/read', verify, notificationController.markAsRead);

// Mark All as Read
router.put('/mark-all-read', verify, notificationController.markAllAsRead);

module.exports = router;
