const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const groups = await Group.find({});
        console.log(`Found ${groups.length} groups to clean.`);

        for (const group of groups) {
            let modified = false;
            const cleanedMembers = [];

            for (const member of group.members) {
                // Determine the correct user ID from various possible states
                let userId = null;

                if (member.user && member.user._id) {
                    userId = member.user._id; // Deeply nested
                } else if (member.user) {
                    userId = member.user; // Standard
                } else if (member._id) {
                    userId = member._id; // Legacy ID
                } else {
                    userId = member; // Raw ID
                }

                if (userId && mongoose.Types.ObjectId.isValid(userId.toString())) {
                    const role = member.role || (userId.toString() === group.leader.toString() ? 'leader' : 'member');
                    cleanedMembers.push({ user: userId, role });
                    modified = true;
                    // Set modified to true if the structure isn't exactly { user: ID, role: ROLE }
                    // even if IDs match.
                }
            }

            // Forced refresh of the members array to ensure no legacy fields remain
            group.members = cleanedMembers;
            await group.save();
            console.log(`Cleaned group: ${group.name} (${group._id})`);
        }

        console.log(`Migration complete.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
