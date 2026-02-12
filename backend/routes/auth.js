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
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Profile update request received:', req.body);
        console.log('User ID from token:', req.user.id);

        const { name, githubUsername, emailDigestEnabled, emailDigestFrequency } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            console.error('User not found in DB:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;
        if (emailDigestEnabled !== undefined) user.emailDigestEnabled = emailDigestEnabled;
        if (emailDigestFrequency) user.emailDigestFrequency = emailDigestFrequency;

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

module.exports = router;
