require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'thevindupesara@gmail.com' });
    console.log('Original skills:', user.skills);
    
    // Simulate what the route does
    user.skills = ['React', 'Node.js', 'Express'];
    await user.save();
    
    const checkUser = await User.findOne({ email: 'thevindupesara@gmail.com' });
    console.log('New skills saved:', checkUser.skills);
    
    // Reset to empty
    checkUser.skills = [];
    await checkUser.save();
    console.log('Reset skills');
    
    process.exit(0);
}
run();
