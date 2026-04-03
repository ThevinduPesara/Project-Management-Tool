const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);

        // Mock Login Logic
        if (process.env.MOCK_DB === 'true') {
            console.log(`[MOCK LOGIN] Bypass authentication for: ${email}`);
            const mockUser = { id: 'mock-user-123', name: 'Test User', email: email, role: 'leader' };
            const payload = { user: { id: mockUser.id } };
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
                if (err) return res.status(500).json({ msg: 'Mock Token failed' });
                res.json({ token, user: mockUser });
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOGIN FAILED] Password mismatch for: ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                console.error('[JWT SIGN ERROR]', err);
                return res.status(500).json({ msg: 'Token generation failed: ' + err.message });
            }
            console.log(`[LOGIN SUCCESS] Token generated for: ${email}`);
            res.json({ token });
        });
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
    try {
        if (process.env.MOCK_DB === 'true' && req.user.id === 'mock-user-123') {
            return res.json({ id: 'mock-user-123', name: 'Test User', email: 'test@example.com', role: 'leader', skills: ['React', 'Node.js'] });
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Get User Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Profile update request received:', req.body);
        console.log('User ID from token:', req.user.id);

        const { name, githubUsername, emailDigestEnabled, emailDigestFrequency, skills } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            console.error('User not found in DB:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;
        if (emailDigestEnabled !== undefined) user.emailDigestEnabled = emailDigestEnabled;
        if (emailDigestFrequency) user.emailDigestFrequency = emailDigestFrequency;
        if (skills && Array.isArray(skills)) {
            user.skills = skills;
            user.markModified('skills');
        }

        await user.save();
        console.log('Profile updated successfully for:', user.email);
        res.json(user);
    } catch (err) {
        console.error('Profile Update Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Test Digest Email
router.post('/test-digest', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const { sendDailyDigest } = require('../utils/emailService');

        // Sample data for testing
        const sampleData = {
            todoCount: 5,
            overdueCount: 2,
            urgentTasks: [
                { title: 'Sample Task 1', deadline: new Date() },
                { title: 'Sample Task 2', deadline: new Date() }
            ]
        };

        const success = await sendDailyDigest(user, sampleData);
        if (success) {
            res.json({ msg: 'Test digest email sent!' });
        } else {
            res.status(500).json({ msg: 'Failed to send test email. Check server logs.' });
        }
    } catch (err) {
        console.error('Test Digest Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Change Password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please provide current and new passwords' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        user.password = newPassword; // Pre-save middleware will hash this
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
