const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const User = require('./models/User');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const fs = require('fs');
        let output = '--- DATABASE DIAGNOSTIC ---\n';

        const allUsers = await User.find({});
        output += `\n--- ALL USERS (${allUsers.length}) ---\n`;
        allUsers.forEach(u => output += `- ${u.name} | ${u.email} | ${u._id.toString()}\n`);

        const allGroups = await Group.find({});
        output += `\n--- ALL GROUPS (${allGroups.length}) ---\n`;
        for (const g of allGroups) {
            output += `\nGroup: ${g.name} (${g._id.toString()})\n`;
            output += `Leader: ${g.leader.toString()}\n`;
            output += `Members: ${JSON.stringify(g.members)}\n`;

            const leaderExists = allUsers.some(u => u._id.toString() === g.leader.toString());
            output += `Leader exists in DB? ${leaderExists}\n`;
        }

        fs.writeFileSync('diag-results.txt', output);
        console.log('Results written to diag-results.txt');
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic failed:', err);
        process.exit(1);
    }
};

checkDB();
