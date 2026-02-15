const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity for a group
 * @param {string} userId - ID of the user performing the action
 * @param {string} groupId - ID of the group where the action happened
 * @param {string} action - Description of the action (e.g., 'task_created')
 * @param {Object} details - Additional metadata about the action
 */
const logActivity = async (userId, groupId, action, details = {}) => {
    try {
        const log = new ActivityLog({
            user: userId,
            group: groupId,
            action,
            details
        });
        await log.save();
        console.log(`[ACTIVITY LOG] ${action} by ${userId} in ${groupId}`);
    } catch (err) {
        console.error('Failed to log activity:', err.message);
    }
};

module.exports = { logActivity };
