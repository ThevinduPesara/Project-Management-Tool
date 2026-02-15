const Group = require('../models/Group');

/**
 * Middleware to check if user has specific roles in a group
 * @param {Array} allowedRoles - List of roles that can access the route
 */
const checkRole = (allowedRoles) => async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        const member = group.members.find(m => m.user.toString() === req.user.id);

        if (!member) {
            return res.status(403).json({ msg: 'Not a member of this group' });
        }

        // Leader bypass or explicit role check
        if (member.role === 'leader' || allowedRoles.includes(member.role)) {
            req.group = group; // Pass group object to next middleware/route
            req.userRole = member.role;
            return next();
        }

        res.status(403).json({ msg: 'Permission denied: insufficient role' });
    } catch (err) {
        console.error('Role Check Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

module.exports = checkRole;
