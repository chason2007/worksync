const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const leaveController = require('../controllers/leaveController');

// GET ALL LEAVES (or just user's)
router.get('/', verify, leaveController.getLeaves);

// SUBMIT LEAVE REQUEST
router.post('/', verify, leaveController.submitLeave);

// APPROVE/REJECT LEAVE (Admin Only)
router.put('/:id', verify, leaveController.updateLeaveStatus);

// CANCEL LEAVE (User can cancel own Pending leaves)
router.delete('/:id', verify, leaveController.cancelLeave);

module.exports = router;