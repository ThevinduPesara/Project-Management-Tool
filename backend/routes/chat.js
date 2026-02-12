const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get messages for a group
router.get('/:groupId/messages', chatController.getGroupMessages);

// Send a message (HTTP fallback)
router.post('/:groupId/messages', chatController.sendMessage);

// Mark messages as read
router.patch('/:groupId/read', chatController.markAsRead);

// Get unread count
router.get('/:groupId/unread', chatController.getUnreadCount);

module.exports = router;
