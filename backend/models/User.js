const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['leader', 'member'], default: 'member' },
    skills: [String],
    githubUsername: String,
    contributionScore: { type: Number, default: 0 },
    pushNotificationsEnabled: { type: Boolean, default: true },
    emailNotificationsEnabled: { type: Boolean, default: true },
    googleAccessToken: String,
    googleRefreshToken: String,
    googleTokenExpiry: Date,
    emailDigestEnabled: { type: Boolean, default: true },
    emailDigestFrequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
