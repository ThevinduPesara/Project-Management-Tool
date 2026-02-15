const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const groups = await Group.find({});
        console.log(`Found ${groups.length} groups to check.`);

        let updatedCount = 0;

        for (const group of groups) {
            let modified = false;
            const newMembers = [];

            for (const member of group.members) {
                // If member is just an ID (or doesn't have the 'user' property)
                if (member && !member.user) {
                    const userId = member._id || member;
                    const role = userId.toString() === group.leader.toString() ? 'leader' : 'member';
                    newMembers.push({ user: userId, role });
                    modified = true;
                } else {
                    newMembers.push(member);
                }
            }

            if (modified) {
                group.members = newMembers;
                await group.save();
                updatedCount++;
                console.log(`Updated group: ${group.name} (${group._id})`);
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} groups.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
