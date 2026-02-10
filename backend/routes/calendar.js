const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/auth');

router.get('/auth-url', authMiddleware, calendarController.getAuthUrl);
router.get('/callback', calendarController.handleCallback);
router.post('/sync', authMiddleware, calendarController.syncDeadlines);

module.exports = router;
