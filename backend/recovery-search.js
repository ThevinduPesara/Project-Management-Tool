const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');

const recover = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const groups = await Group.find({});
        const users = await User.find({});
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u.name);

        const fs = require('fs');
        let report = '--- MEMBERSHIP RECOVERY REPORT ---\n';

        for (const group of groups) {
            report += `\nGroup: ${group.name} (${group._id.toString()})\n`;
            const foundUserIds = new Set();

            // 1. Check Tasks
            const tasks = await Task.find({ group: group._id });
            tasks.forEach(t => {
                if (t.assignedTo) foundUserIds.add(t.assignedTo.toString());
            });
            report += `- Found ${tasks.length} tasks. Users involved: ${[...foundUserIds].map(id => userMap[id] || id).join(', ')}\n`;

            // 2. Check Activity Logs
            if (ActivityLog) {
                const logs = await ActivityLog.find({ group: group._id });
                logs.forEach(l => {
                    if (l.user) foundUserIds.add(l.user.toString());
                });
                report += `- Found ${logs.length} activity logs. Users involved: ${[...foundUserIds].map(id => userMap[id] || id).join(', ')}\n`;
            }

            // 3. Check current members
            const currentMembers = group.members.map(m => (m.user?._id || m.user || m).toString());
            report += `- Current members in Group model: ${currentMembers.map(id => userMap[id] || id).join(', ')}\n`;

            // 4. Missing Users
            const missing = [...foundUserIds].filter(id => !currentMembers.includes(id));
            report += `- POTENTIAL MISSING MEMBERS: ${missing.map(id => `${userMap[id] || 'Unknown'} (${id})`).join(', ')}\n`;
        }

        fs.writeFileSync('recovery-report.txt', report);
        console.log('Recovery report written to recovery-report.txt');
        process.exit(0);
    } catch (err) {
        console.error('Recovery search failed:', err);
        process.exit(1);
    }
};

recover();
