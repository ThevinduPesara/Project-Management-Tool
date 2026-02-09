const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        console.log(`Attempting to send email to: ${to}`);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Email send failed:', error);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id || req.user.userId })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('markRead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createNotification = async (userId, message, type = 'info') => {
    try {
        console.log(`Creating notification for user: ${userId}, message: ${message}`);
        const notification = new Notification({ user: userId, message, type });
        await notification.save();

        // Check if user wants email notifications
        const user = await User.findById(userId);
        if (!user) {
            console.log(`User ${userId} not found for notification.`);
            return;
        }

        console.log(`User found: ${user.email}, Email Pref: ${user.emailNotificationsEnabled}`);

        if (user.emailNotificationsEnabled && process.env.EMAIL_USER) {
            await sendEmail(user.email, 'New Notification - UniTask', message);
        } else {
            console.log('Skipping email. Enabled:', user.emailNotificationsEnabled, 'Has Env User:', !!process.env.EMAIL_USER);
        }
    } catch (error) {
        console.error('Notification error:', error);
    }
};

exports.sendEmail = sendEmail;
