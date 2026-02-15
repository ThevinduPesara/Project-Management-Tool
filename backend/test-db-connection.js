require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testConnection() {
    console.log("Attempting to connect to MongoDB...");
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        console.log("Connected to MongoDB successfully!");

        const count = await User.countDocuments();
        console.log(`User count: ${count}`);

        const users = await User.find({}, 'email name');
        console.log("Users found:", users);

    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

testConnection();
