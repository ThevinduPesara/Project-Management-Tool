const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    deadline: Date,
    status: { type: String, enum: ['To Do', 'In Progress', 'Under Review', 'Done'], default: 'To Do' },
    type: { type: String, enum: ['Story', 'Task', 'Bug'], default: 'Task' },
    qaFeedback: String,
    submissionNote: String,
    githubCommits: [{
        commitHash: String,
        message: String,
        author: String,
        date: Date
    }],
    difficultyEmoji: String, // From OpenAI API later
    difficultyLevel: String, // Easy, Medium, Hard
    estimatedHours: Number,
    completedAt: Date,
    statusHistory: [{
        from: String,
        to: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
