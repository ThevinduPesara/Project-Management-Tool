const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/estimate-difficulty', authMiddleware, aiController.estimateDifficulty);
router.post('/analyze', authMiddleware, upload.single('file'), aiController.analyzeProject);
router.post('/confirm', authMiddleware, aiController.confirmPlan);

module.exports = router;