const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qaController');
const auth = require('../middleware/auth');

router.post('/verify', auth, qaController.verifyTaskWithAI);

module.exports = router;
