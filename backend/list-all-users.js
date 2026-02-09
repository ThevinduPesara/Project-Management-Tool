require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('Total users:', users.length);

        users.forEach(u => {
            console.log('--------------------------------------------------');
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`Email Enabled: ${u.emailNotificationsEnabled}`);
            console.log(`ID: ${u._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

listUsers();
