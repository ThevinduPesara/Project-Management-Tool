const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    action: { type: String, required: true }, // e.g., 'task_completed', 'member_joined', 'role_updated'
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
