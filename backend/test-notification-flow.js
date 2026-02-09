require('dotenv').config();
const mongoose = require('mongoose');
const notificationController = require('./controllers/notificationController');
const User = require('./models/User');

async function testNotificationFlow() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a user to test with, preferably the one from .env or any user with email
        const testEmail = process.env.EMAIL_USER;
        let user = await User.findOne({ email: testEmail });

        if (!user) {
            console.log(`User with email ${testEmail} not found. Creating a dummy user for testing.`);
            // Create a temporary user if not exists, though usually we expect one.
            // For now, let's try to find ANY user.
            user = await User.findOne({});
            if (!user) {
                console.error('No users found in database to test with.');
                process.exit(1);
            }
            console.log(`Using user: ${user.name} (${user.email}) for testing.`);
        } else {
            console.log(`Using user: ${user.name} (${user.email}) for testing.`);
        }

        // Ensure email does not get sent to a random user if we picked a random one,
        // unless it's the dev credentials.
        // Actually, let's just use the current user from .env if possible, or force the email to be the dev email for testing purposes?
        // No, the code uses user.email.
        // If I use a random user, I might spam someone.
        // It's safer to Create a dummy user OR update the found user's email to the dev email temporarily?
        // No, let's just hope the dev has a user in DB with their email.
        // If not, I will create a dummy user with the dev email.

        if (user.email !== process.env.EMAIL_USER) {
            console.log('Refusing to spam different user. Creating test user with dev email.');
            user = new User({
                name: 'Test User',
                email: process.env.EMAIL_USER,
                password: 'password123',
                emailNotificationsEnabled: true
            });
            // We won't save it to DB to avoid pollution, but we need an ID.
            // createNotification takes userId and finds it in DB.
            // So I MUST save it.
            await user.save();
            console.log('Created temporary test user.');
        }

        // Ensure email notifications are enabled
        if (!user.emailNotificationsEnabled) {
            console.log('Enabling email notifications for test user...');
            user.emailNotificationsEnabled = true;
            await user.save();
        }

        console.log('Calling createNotification...');
        await notificationController.createNotification(
            user._id,
            'This is a test notification from the debug script to verify email sending.',
            'info'
        );

        console.log('createNotification called. Check logs above for email success message.');

        // Cleanup if we created a user? Maybe not, manual cleanup is safer.

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testNotificationFlow();
