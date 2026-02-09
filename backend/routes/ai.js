const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.post('/estimate-difficulty', authMiddleware, aiController.estimateDifficulty);

module.exports = router;