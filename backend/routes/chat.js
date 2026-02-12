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

// Get messages where current user is mentioned
router.get('/:groupId/mentions', chatController.getMentions);

// Toggle reaction on a message
router.post('/messages/:messageId/react', chatController.toggleReaction);

module.exports = router;
