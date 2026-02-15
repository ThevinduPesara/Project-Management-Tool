const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleAuth');
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/activity/:groupId
// @desc    Get recent activity for a group
// @access  Private (All members)
router.get('/:groupId', auth, checkRole(['leader', 'task-manager', 'member', 'viewer']), async (req, res) => {
    try {
        const { groupId } = req.params;
        const { limit = 20, page = 1 } = req.query;

        const logs = await ActivityLog.find({ group: groupId })
            .populate('user', 'name email')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ActivityLog.countDocuments({ group: groupId });

        res.json({
            logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Get Activity Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
