try {
    console.log('Testing requires...');
    console.log('Requiring notificationController...');
    require('./controllers/notificationController');
    console.log('Requiring aiController...');
    require('./controllers/aiController');
    console.log('Requiring calendarController...');
    require('./controllers/calendarController');
    console.log('Requiring routes/notification...');
    require('./routes/notification');
    console.log('Requiring routes/ai...');
    require('./routes/ai');
    console.log('Requiring routes/calendar...');
    require('./routes/calendar');
    console.log('All requires successful');
} catch (error) {
    console.error('Error requiring module:', error);
}
