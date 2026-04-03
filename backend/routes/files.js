const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

// Upload a file
router.post('/upload', auth, fileController.uploadMiddleware, fileController.uploadFile);

// Get all resources for user
router.get('/my-resources', auth, fileController.getResources);

// Resource CRUD Operations
router.post('/upload-resource', auth, fileController.uploadMiddleware, fileController.createResource);
router.put('/:messageId/:filename', auth, fileController.updateResource);
router.delete('/:messageId/:filename', auth, fileController.deleteResource);

module.exports = router;
