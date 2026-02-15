const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleAuth');
const Group = require('../models/Group');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// @route   GET api/admin/:groupId/members
// @desc    Get all members of a group with details
// @access  Private (Leader/Task-Manager/Member/Viewer)
router.get('/:groupId/members', auth, checkRole(['leader', 'task-manager', 'member', 'viewer']), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId).populate('members.user', 'name email skills contributionScore');
        res.json(group.members);
    } catch (err) {
        console.error('Get Members Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT api/admin/:groupId/role
// @desc    Update a member's role
// @access  Private (Leader only)
router.put('/:groupId/role', auth, checkRole(['leader']), async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        const group = req.group; // From checkRole middleware

        const memberIndex = group.members.findIndex(m => m.user.toString() === userId);
        if (memberIndex === -1) {
            return res.status(404).json({ msg: 'Member not found in group' });
        }

        const oldRole = group.members[memberIndex].role;
        group.members[memberIndex].role = newRole;
        await group.save();

        await logActivity(req.user.id, group._id, 'role_updated', {
            affectedUser: userId,
            oldRole,
            newRole
        });

        res.json(group.members[memberIndex]);
    } catch (err) {
        console.error('Update Role Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/admin/search-users
// @desc    Search for users by skill or name
// @access  Private
router.get('/search-users', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { skills: { $in: [new RegExp(query, 'i')] } }
            ]
        }).select('name email skills').limit(10);

        res.json(users);
    } catch (err) {
        console.error('Search Users Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
