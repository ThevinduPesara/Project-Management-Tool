try {
    console.log('Testing requirements...');
    require('dotenv').config();
    console.log('1. dotenv loaded');
    require('./routes/auth');
    console.log('2. authRoutes loaded');
    require('./routes/notification');
    console.log('3. notificationRoutes loaded');
    require('./routes/chat');
    console.log('4. chatRoutes loaded');
    const { createNotification } = require('./controllers/notificationController');
    console.log('5. createNotification loaded');
    console.log('All tests passed!');
} catch (err) {
    console.error('CRASH DETECTED:');
    console.error(err);
    process.exit(1);
}
