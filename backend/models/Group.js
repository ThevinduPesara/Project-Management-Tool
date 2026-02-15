const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    githubRepo: String, // format: 'owner/repo'
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['leader', 'task-manager', 'member', 'viewer'],
            default: 'member'
        }
    }],
    inviteCode: { type: String, unique: true, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date, // Project deadline/milestone
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
