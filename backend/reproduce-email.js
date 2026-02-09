require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendTestEmail() {
    console.log('Attempting to send email...');
    console.log('User:', process.env.EMAIL_USER);
    // Mask password for security in logs
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'Not Set');

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email from Debug Script',
            text: 'This is a test email to verify nodemailer configuration.'
        });
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Email send failed:', error);
    }
}

sendTestEmail();
