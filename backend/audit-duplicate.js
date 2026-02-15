const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Task = require('./models/Task');
const Message = require('./models/Message');

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const duplicateId = '69897f5abd196903d85b34a0'; // The one with 0 tasks
        const realId = '6989a638d4a8f02326dc0ab0';      // The one with 35 tasks

        console.log('--- AUDITING DUPLICATE NDM PROJECT ---');

        const tasks = await Task.countDocuments({ group: duplicateId });
        const messages = await Message.countDocuments({ group: duplicateId });

        console.log(`Tasks: ${tasks}`);
        console.log(`Messages: ${messages}`);

        if (tasks === 0 && messages === 0) {
            console.log('SAFE TO DELETE: No tasks or messages found in duplicate project.');
        } else {
            console.log('WARNING: Data found. Consider merging instead of deleting.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
