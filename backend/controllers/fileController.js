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

exports.createResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { groupId } = req.body;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        // Verify user is in group
        const group = await Group.findOne({ _id: groupId, 'members.user': req.user.id });
        if (!group) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }

        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        };

        const newMessage = new Message({
            sender: req.user.id,
            group: groupId,
            content: 'Shared a new resource',
            attachments: [fileInfo]
        });

        await newMessage.save();

        res.status(201).json(fileInfo);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: 'Failed to create resource' });
    }
};

exports.updateResource = async (req, res) => {
    try {
        const { messageId, filename } = req.params;
        const { originalName } = req.body;

        if (!originalName) {
            return res.status(400).json({ error: 'New name is required' });
        }

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Resource not found' });

        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to update this resource' });
        }

        const attachmentIndex = message.attachments.findIndex(a => a.filename === filename);
        if (attachmentIndex === -1) return res.status(404).json({ error: 'Resource file not found' });

        message.attachments[attachmentIndex].originalName = originalName;
        await message.save();

        res.json({ message: 'Resource updated successfully' });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const { messageId, filename } = req.params;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Resource not found' });

        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this resource' });
        }

        const attachmentIndex = message.attachments.findIndex(a => a.filename === filename);
        if (attachmentIndex === -1) return res.status(404).json({ error: 'Resource file not found' });

        // Remove from filesystem
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove attachment from message
        message.attachments.splice(attachmentIndex, 1);

        // If message has no more attachments and was just a file share message, delete message entirely
        if (message.attachments.length === 0 && message.content === 'Shared a new resource') {
            await Message.findByIdAndDelete(messageId);
        } else {
            await message.save();
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
};
