const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/auth');

router.post('/sync', authMiddleware, calendarController.syncDeadlines);

module.exports = router;
