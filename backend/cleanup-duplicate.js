const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const duplicateId = '69897f5abd196903d85b34a0'; // The empty duplicate

        const deleted = await Group.findByIdAndDelete(duplicateId);

        if (deleted) {
            console.log(`Successfully deleted empty duplicate project: ${deleted.name} (${deleted._id})`);
        } else {
            console.log('Project not found or already deleted.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
