const nodemailer = require('nodemailer');
const { dailyDigestTemplate, weeklyDigestTemplate } = require('./emailTemplates');

/**
 * Configure Nodemailer transporter
 */
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML
 */
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"UniTask" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

/**
 * Generate and send Daily Digest
 * @param {Object} user - User object
 * @param {Object} data - Digest data (tasks, counts, etc.)
 */
const sendDailyDigest = async (user, data) => {
    const html = dailyDigestTemplate({
        name: user.name,
        ...data
    });

    return await sendEmail(
        user.email,
        `Your Daily Task Summary - ${new Date().toLocaleDateString()}`,
        html
    );
};

/**
 * Generate and send Weekly Digest
 * @param {Object} user - User object
 * @param {Object} data - Digest data (groups, stats, etc.)
 */
const sendWeeklyDigest = async (user, data) => {
    const html = weeklyDigestTemplate({
        name: user.name,
        ...data
    });

    return await sendEmail(
        user.email,
        `Weekly Team Progress Wrap-up - ${new Date().toLocaleDateString()}`,
        html
    );
};

module.exports = {
    sendEmail,
    sendDailyDigest,
    sendWeeklyDigest
};
