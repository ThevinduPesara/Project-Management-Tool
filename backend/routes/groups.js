const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const crypto = require('crypto');

// Create a group
router.post('/create', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const newGroup = new Group({
            name,
            description,
            leader: req.user.id,
            members: [req.user.id],
            inviteCode
        });

        await newGroup.save();
        res.json(newGroup);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Join a group via invite code
router.post('/join', auth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const group = await Group.findOne({ inviteCode });
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Already a member' });
        }

        group.members.push(req.user.id);
        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get user's groups
router.get('/my-groups', auth, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
        res.json(groups);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
