const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
        type: String,
        enum: ['leader', 'task-manager', 'member', 'viewer'],
        default: 'member'
    },
    token: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema);
