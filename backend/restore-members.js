const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');

const restore = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Mapping from recovery-report.txt
        const recoveryMap = [
            {
                groupId: '69846f6432ca78d094383830', // ITPM
                missingMembers: [
                    '69846faf32ca78d09438383d', // Sahan Vimukthi
                    '6988425c9bc5e70d1a1e7e3a'  // pesara
                ]
            },
            {
                groupId: '6989a638d4a8f02326dc0ab0', // NDM
                missingMembers: [
                    '6989a602d4a8f02326dc0a83'  // Saman Gajadeera
                ]
            }
        ];

        for (const item of recoveryMap) {
            const group = await Group.findById(item.groupId);
            if (!group) {
                console.log(`Group ${item.groupId} not found, skipping.`);
                continue;
            }

            console.log(`Restoring members to ${group.name}...`);
            let addedCount = 0;

            for (const userId of item.missingMembers) {
                // Check if already a member (shouldn't be, but safe)
                const isMember = group.members.some(m => (m.user?._id || m.user || m).toString() === userId);
                if (!isMember) {
                    group.members.push({ user: userId, role: 'member' });
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                await group.save();
                console.log(`  > Restored ${addedCount} members.`);
            } else {
                console.log('  > All recovered members are already present.');
            }
        }

        console.log('\nRestoration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Restoration failed:', err);
        process.exit(1);
    }
};

restore();
