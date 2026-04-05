require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'email name');
       
    } catch (err) {
        console.error('Error checking users:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

checkUsers();
