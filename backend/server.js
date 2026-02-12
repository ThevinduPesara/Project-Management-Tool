const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notification');
const calendarRoutes = require('./routes/calendar');
const chatRoutes = require('./routes/chat');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/qa', require('./routes/qa'));
app.use('/api/chat', chatRoutes);

// Socket.io authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.user.id;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a group chat room
    socket.on('join-group', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.userId} joined group ${groupId}`);

        // Notify others in the group
        socket.to(groupId).emit('user-joined', {
            userId: socket.userId,
            timestamp: new Date()
        });
    });

    // Leave a group chat room
    socket.on('leave-group', (groupId) => {
        socket.leave(groupId);
        console.log(`User ${socket.userId} left group ${groupId}`);

        // Notify others in the group
        socket.to(groupId).emit('user-left', {
            userId: socket.userId,
            timestamp: new Date()
        });
    });

    // Send a message
    socket.on('send-message', async (data) => {
        try {
            const { groupId, content } = data;

            // Create and save message
            const message = new Message({
                sender: socket.userId,
                group: groupId,
                content: content.trim(),
                readBy: [socket.userId]
            });

            await message.save();
            await message.populate('sender', 'name email');

            // Broadcast to all users in the group (including sender)
            io.to(groupId).emit('new-message', message);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { groupId, isTyping } = data;
        socket.to(groupId).emit('user-typing', {
            userId: socket.userId,
            isTyping
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
    });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Student Group Assignment Tracker API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Socket.io server is ready for real-time connections');
});
