const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Group = require('../models/Group');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allow images, documents, and archives
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/zip', 'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const uploadSingle = upload.single('file');

exports.uploadMiddleware = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. file too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large. Max size is 10MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred when uploading
            return res.status(400).json({ error: err.message });
        }
        // Everything went fine.
        next();
    });
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        };

        res.status(201).json(fileInfo);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

exports.getResources = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all groups user is a member of
        const groups = await Group.find({ 'members.user': userId }).select('_id name');
        const groupIds = groups.map(g => g._id);

        // 2. Find messages in those groups that have attachments
        const messages = await Message.find({
            group: { $in: groupIds },
            'attachments.0': { $exists: true }
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name')
        .populate('group', 'name');

        // 3. Flatten attachments and include group/sender info
        const resources = messages.reduce((acc, msg) => {
            const msgResources = msg.attachments.map(att => ({
                ...att.toObject(),
                sender: msg.sender,
                group: msg.group,
                messageId: msg._id,
                createdAt: msg.createdAt
            }));
            return [...acc, ...msgResources];
        }, []);

        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
};
