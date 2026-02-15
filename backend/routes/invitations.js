const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleAuth');
const Group = require('../models/Group');
const Invitation = require('../models/Invitation');
const { sendEmail } = require('../utils/emailService');
const { invitationTemplate } = require('../utils/emailTemplates');
const { logActivity } = require('../utils/activityLogger');

// @route   POST api/invitations/send
// @desc    Send an email invitation to a group
// @access  Private (Leader/Task-Manager)
router.post('/send/:groupId', auth, checkRole(['leader', 'task-manager']), async (req, res) => {
    try {
        const { email, role = 'member' } = req.body;
        const group = req.group; // From checkRole

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        const invitation = new Invitation({
            email,
            group: group._id,
            inviter: req.user.id,
            role,
            token,
            expiresAt
        });

        await invitation.save();

        // Send email
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation/${token}`;
        const html = invitationTemplate({
            inviterName: req.user.name || 'Your Team Leader',
            groupName: group.name,
            role,
            inviteUrl
        });

        const success = await sendEmail(email, `Join ${group.name} on UniTask`, html);

        if (success) {
            await logActivity(req.user.id, group._id, 'invitation_sent', { invitee: email, role });
            res.json({ msg: 'Invitation sent successfully' });
        } else {
            res.status(500).json({ msg: 'Failed to send invitation email' });
        }
    } catch (err) {
        console.error('Send Invitation Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/invitations/accept/:token
// @desc    Accept a group invitation
// @access  Private
router.get('/accept/:token', auth, async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation.findOne({ token, status: 'pending' }).populate('group');

        if (!invitation) {
            return res.status(404).json({ msg: 'Invalid or expired invitation' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ msg: 'Invitation has expired' });
        }

        const group = invitation.group;
        if (!group) return res.status(404).json({ msg: 'Group no longer exists' });

        // Check if already a member
        if (group.members.some(m => m.user.toString() === req.user.id)) {
            invitation.status = 'accepted';
            await invitation.save();
            return res.json({ msg: 'Already a member of this group', groupId: group._id });
        }

        // Add to group
        group.members.push({ user: req.user.id, role: invitation.role });
        await group.save();

        // Update invitation
        invitation.status = 'accepted';
        await invitation.save();

        await logActivity(req.user.id, group._id, 'invitation_accepted', { role: invitation.role });

        res.json({ msg: 'Invitation accepted!', groupId: group._id });
    } catch (err) {
        console.error('Accept Invitation Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
