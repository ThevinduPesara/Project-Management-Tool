const mongoose = require('mongoose');
require('dotenv').config();
const statsController = require('./controllers/statsController');
const User = require('./models/User');

async function testContext() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne();
        if (!user) {
            console.log("No users found.");
            return;
        }

        console.log(`Testing context for: ${user.name}`);
        const context = await statsController.getUserContext(user._id);

        console.log("\n--- CONTEXT RETRIEVED ---");
        console.log("Projects Found:");
        console.log(context.projectContext);
        console.log("\nGitHub/Development Activity Summary:");
        console.log(context.developmentActivity);

        // Verification: Does the context mention the user's github name?
        if (context.developmentActivity.includes('thevindupesara')) {
            console.log("\nSUCCESS: GitHub activity for 'thevindupesara' found in context.");
        } else {
            console.log("\nWARNING: GitHub activity for 'thevindupesara' NOT found in context.");
        }

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testContext();
