const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const User = require('./models/User');

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const groups = await Group.find({});
        const users = await User.find({});
        const userIds = users.map(u => u._id.toString());

        console.log(`Found ${groups.length} groups and ${users.length} users.`);

        for (const group of groups) {
            console.log(`\nRepairing group: ${group.name} (${group._id})`);
            let cleanedMembers = [];
            let modified = false;

            // 1. ALWAYS ensure leader is a member
            const leaderId = group.leader.toString();
            cleanedMembers.push({ user: group.leader, role: 'leader' });

            // 2. Check existing members
            for (const member of group.members) {
                const uid = (member.user?._id || member.user || member).toString();

                // If it's a valid existing user and not the leader (already added)
                if (userIds.includes(uid) && uid !== leaderId) {
                    cleanedMembers.push({ user: uid, role: member.role || 'member' });
                } else if (uid !== leaderId) {
                    console.log(`  ! Removing invalid member ID: ${uid}`);
                    modified = true;
                }
            }

            // If the members array doesn't match our cleaned version, save it
            // (Note: we always "modify" to ensure the structure is exactly right now)
            group.members = cleanedMembers;
            await group.save();
            console.log(`  > Group repaired. Members: ${cleanedMembers.length}`);
        }

        console.log('\nRepair complete.');
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
};

repair();
