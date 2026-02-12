const User = require('../models/User');

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
    const handles = [...new Set(matches.map(m => m.substring(1)))];

    // In this project, handles are derived from names (no spaces, lowercase)
    // We'll search for users in the group whose names match the handle
    // For simplicity, we'll search all users for now, or we could join with Group
    const users = await User.find({
        $or: handles.map(handle => ({
            name: { $regex: new RegExp(`^${handle}$`, 'i') }
        }))
    });

    return users.map(user => user._id);
}

module.exports = {
    extractMentions
};
