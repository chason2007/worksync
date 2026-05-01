const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const announcementController = require('../controllers/announcementController');

// GET ALL ANNOUNCEMENTS
router.get('/', verify, announcementController.getAllAnnouncements);

// CREATE ANNOUNCEMENT (Admin Only)
router.post('/', verify, announcementController.createAnnouncement);

// DELETE ALL ANNOUNCEMENTS (Admin Only)
router.delete('/', verify, announcementController.deleteAllAnnouncements);

// GET SINGLE ANNOUNCEMENT
router.get('/:id', verify, announcementController.getAnnouncementById);

// DELETE ANNOUNCEMENT (Admin Only)
router.delete('/:id', verify, announcementController.deleteAnnouncement);

module.exports = router;
