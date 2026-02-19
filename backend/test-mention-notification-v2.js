require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Group = require('./models/Group');
const Notification = require('./models/Notification');
const notificationController = require('./controllers/notificationController');
const { extractMentions } = require('./utils/chatUtils');

async function testMentionNotification() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Find a group with members
        const group = await Group.findOne({}).populate('members.user');
        if (!group || !group.members || group.members.length === 0) {
            console.error('No groups or members found.');
            process.exit(1);
        }

        const sender = group.members[0].user;
        const targetMember = group.members.find(m => m.user && m.user._id.toString() !== sender._id.toString());

        if (!targetMember) {
            console.error('Need another member in the group to mention.');
            process.exit(1);
        }

        const receiver = targetMember.user;
        const handle = receiver.name.replace(/\s+/g, '').toLowerCase();

        console.log(`>>> Testing mention extraction for handle: @${handle} (User: ${receiver.name})`);

        const content = `Hey @${handle} check this out!`;
        const mentions = await extractMentions(content, group._id);

        console.log('>>> Extracted mentions:', mentions);

        if (mentions.some(id => id.toString() === receiver._id.toString())) {
            console.log('>>> SUCCESS: Mention correctly extracted.');
        } else {
            console.log('>>> FAILURE: Mention not extracted.');
        }

        // Mock io object
        const mockIo = {
            to: (room) => {
                console.log(`>>> Mock IO: Emitting to room ${room}`);
                return {
                    emit: (event, data) => {
                        console.log(`>>> SUCCESS: Mock IO emitted event "${event}" with message: ${data.message}`);
                    }
                };
            }
        };

        if (mentions.length > 0) {
            await notificationController.createNotification(
                mentions[0],
                `${sender.name} mentioned you in chat`,
                'info',
                mockIo
            );
            console.log('>>> SUCCESS: Notification created and emitted.');
        }

    } catch (error) {
        console.error('>>> Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testMentionNotification();
