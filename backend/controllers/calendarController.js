const { google } = require('googleapis');
const User = require('../models/User');
const Task = require('../models/Task');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/api/calendar/callback'
);

exports.getAuthUrl = async (req, res) => {
    const { id } = req.user; // Use req.user.id from authMiddleware
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: id, // Pass userId in state to identify user on callback
        prompt: 'consent'
    });
    res.json({ url });
};

exports.handleCallback = async (req, res) => {
    const { code, state: userId } = req.query;

    if (!userId) {
        return res.status(400).send('Missing user state');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens to user
        await User.findByIdAndUpdate(userId, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        });

        // Redirect back to frontend settings
        res.redirect('http://localhost:5173/settings?calendar=connected');
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.status(500).send('Authentication failed');
    }
};

exports.syncDeadlines = async (req, res) => {
    const { id: userId } = req.user;

    try {
        const user = await User.findById(userId);
        if (!user || !user.googleRefreshToken) {
            return res.status(401).json({ message: 'Google Calendar not connected' });
        }

        // Setup oauth2 client with user tokens
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:5000/api/calendar/callback'
        );
        auth.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Get tasks with deadlines
        const tasks = await Task.find({ assignedTo: userId, deadline: { $exists: true } });

        for (const task of tasks) {
            const event = {
                summary: `Task: ${task.title}`,
                description: task.description,
                start: {
                    dateTime: task.deadline.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: new Date(task.deadline.getTime() + 3600000).toISOString(), // +1 hour
                    timeZone: 'UTC',
                },
            };

            await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });
        }

        res.json({ message: `Successfully synced ${tasks.length} tasks with Google Calendar` });

    } catch (error) {
        console.error('Calendar Sync Error:', error);
        res.status(500).json({ message: 'Calendar sync failed', error: error.message });
    }
};
