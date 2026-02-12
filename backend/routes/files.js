const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

// Upload a file
router.post('/upload', auth, fileController.uploadMiddleware, fileController.uploadFile);

module.exports = router;
