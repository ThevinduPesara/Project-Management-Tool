const User = require('../models/User');
const Group = require('../models/Group');

/**
 * Extracts mentions from message content and finds corresponding user IDs
 * @param {string} content - The message content
 * @param {string} groupId - The group ID to restrict user search to
 * @returns {Promise<string[]>} - Array of user IDs mentioned
 */
async function extractMentions(content, groupId) {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);

    if (!matches) return [];

    // Remove @ and get unique handles
    const handles = [...new Set(matches.map(m => m.substring(1).toLowerCase()))];

    // Find the group and populate members' user details
    const group = await Group.findById(groupId).populate('members.user', 'name');
    if (!group) return [];

    const mentionedUserIds = [];

    // Match handles against group members
    group.members.forEach(member => {
        if (member.user && member.user.name) {
            const handle = member.user.name.replace(/\s+/g, '').toLowerCase();
            if (handles.includes(handle)) {
                mentionedUserIds.push(member.user._id);
            }
        }
    });

    return mentionedUserIds;
}

module.exports = {
    extractMentions
};
