const Message = require('../models/Message');
const Group = require('../models/Group');
const { extractMentions } = require('../utils/chatUtils');

// Get paginated messages for a group
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const isMember = group.members.some(
            member => member.toString() === req.user.id
        );

        if (!isMember && group.leader.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Fetch messages with pagination
        const messages = await Message.find({ group: groupId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email')
            .populate('reactions.users', 'name')
            .lean();

        const totalMessages = await Message.countDocuments({ group: groupId });

        res.json({
            messages: messages.reverse(), // Reverse to show oldest first
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Send a message (HTTP fallback)
exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, attachments } = req.body;

        if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
            return res.status(400).json({ error: 'Message content or attachment is required' });
        }

        // Verify user is member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const isMember = group.members.some(
            member => member.toString() === req.user.id
        );

        if (!isMember && group.leader.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Extract mentions
        const mentions = await extractMentions(content, groupId);

        // Create and save message
        const message = new Message({
            sender: req.user.id,
            group: groupId,
            content: content?.trim() || '',
            mentions: mentions,
            attachments: attachments || [],
            readBy: [req.user.id] // Sender has read their own message
        });

        await message.save();
        await message.populate('sender', 'name email');
        await message.populate('mentions', 'name email');

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Update all unread messages in the group
        await Message.updateMany(
            {
                group: groupId,
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const unreadCount = await Message.countDocuments({
            group: groupId,
            readBy: { $ne: userId }
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};
// Get messages where the user is mentioned
exports.getMentions = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const messages = await Message.find({
            group: groupId,
            mentions: userId
        })
            .sort({ timestamp: -1 })
            .populate('sender', 'name email')
            .lean();

        res.json(messages);
    } catch (error) {
        console.error('Error fetching mentions:', error);
        res.status(500).json({ error: 'Failed to fetch mentions' });
    }
};
// Toggle an emoji reaction on a message
exports.toggleReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        if (!emoji) {
            return res.status(400).json({ error: 'Emoji is required' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Find if this reaction already exists
        const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex !== -1) {
            // Reaction exists, check if user has already reacted
            const userIndex = message.reactions[reactionIndex].users.indexOf(userId);

            if (userIndex !== -1) {
                // User already reacted, remove them
                message.reactions[reactionIndex].users.splice(userIndex, 1);

                // If no users left for this emoji, remove the reaction entirely
                if (message.reactions[reactionIndex].users.length === 0) {
                    message.reactions.splice(reactionIndex, 1);
                }
            } else {
                // User hasn't reacted with this emoji yet, add them
                message.reactions[reactionIndex].users.push(userId);
            }
        } else {
            // Reaction for this emoji doesn't exist, create it
            message.reactions.push({
                emoji,
                users: [userId]
            });
        }

        await message.save();

        // Populate sender and return
        await message.populate('sender', 'name email');
        await message.populate('mentions', 'name email');
        await message.populate('reactions.users', 'name');

        res.json(message);
    } catch (error) {
        console.error('Error toggling reaction:', error);
        res.status(500).json({ error: 'Failed to toggle reaction' });
    }
};
