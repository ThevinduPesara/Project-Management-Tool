require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'gajadeeraconstruction@gmail.com';
        const user = await User.findOne({ email: email });

        if (user) {
            console.log('User found:', user.name);
            console.log('Email:', user.email);
            console.log('Email Notifications Enabled:', user.emailNotificationsEnabled);
            console.log('ID:', user._id);
        } else {
            console.log(`User with email ${email} NOT FOUND.`);

            // List all users to see if there's a typo
            const allUsers = await User.find({}, 'name email');
            console.log('Available users:', allUsers);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkUser();
