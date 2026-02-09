require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

async function checkNotifications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'gajadeeraconstruction@gmail.com';
        const user = await User.findOne({ email: email });

        if (!user) {
            console.log(`User ${email} not found.`);
            return;
        }

        console.log(`Checking notifications for user: ${user.name} (${user._id})`);

        const notifications = await Notification.find({ user: user._id });
        console.log(`Found ${notifications.length} notifications.`);
        notifications.forEach(n => {
            console.log(`- [${n.createdAt}] ${n.message} (Read: ${n.isRead})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkNotifications();
