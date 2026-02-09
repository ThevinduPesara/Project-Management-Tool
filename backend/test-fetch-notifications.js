require('dotenv').config();
const jwt = require('jsonwebtoken');
// Axois removed, using fetch
const mongoose = require('mongoose');
const User = require('./models/User');

async function testFetch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'gajadeeraconstruction@gmail.com' });

        if (!user) {
            console.error('User not found');
            return;
        }

        // Generate Token
        const payload = {
            user: {
                id: user._id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token for user:', user._id);

        // Make Request
        try {
            const res = await fetch('http://localhost:5000/api/notifications', {
                method: 'GET',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response Status:', res.status);
            const data = await res.json();
            console.log('Notifications:', JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('Fetch Error:', err);
        }

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testFetch();
