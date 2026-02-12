require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('User:', process.env.EMAIL_USER);
console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT SET');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Nodemailer Test',
    text: 'If you receive this, your email configuration is correct!'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Test Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Full Error:', error);
    } else {
        console.log('Test Successful!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    }
    process.exit();
});
