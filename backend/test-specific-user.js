require('dotenv').config();
const mongoose = require('mongoose');
const notificationController = require('./controllers/notificationController');

async function testSpecificUserEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // ID for Saman Gajadeera (gajadeeraconstruction@gmail.com)
        // copy-pasted from previous output
        // "ID: 6989a602d4a8f02326dc0a83" -> Wait, is that a valid ObjectId? looks like it.
        // But user provided output might be truncated? No, looks fine.
        // Actually, let's find by email just to be safe and robust.

        const User = require('./models/User');
        const user = await User.findOne({ email: 'gajadeeraconstruction@gmail.com' });

        if (!user) {
            console.error('User not found!');
            return;
        }

        console.log(`Found user: ${user.name} (${user._id})`);

        console.log('Calling createNotification...');
        await notificationController.createNotification(
            user._id,
            'Test notification for Saman Gajadeera from debugger.',
            'info'
        );

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testSpecificUserEmail();
