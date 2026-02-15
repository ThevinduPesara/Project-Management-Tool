require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkGithubUsernames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name githubUsername');
        console.log('User GitHub Usernames:');
        users.forEach(u => {
            console.log(`- ${u.name}: ${u.githubUsername || 'NOT SET'}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkGithubUsernames();
