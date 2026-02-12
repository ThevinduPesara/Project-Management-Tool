const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    content: {
        type: String,
        required: false,
        trim: true
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reactions: [{
        emoji: { type: String, required: true },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    attachments: [{
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ group: 1, timestamp: -1 });
messageSchema.index({ mentions: 1, group: 1 });

module.exports = mongoose.model('Message', messageSchema);
