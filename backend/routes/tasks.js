const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Group = require('../models/Group');
const notificationController = require('../controllers/notificationController');

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, groupId, deadline, assignedTo, type } = req.body;

        // check if user is in group
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        const member = group.members.find(m => m.user.toString() === req.user.id);
        if (!member) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Only Leader and Task-Manager can create tasks
        if (!['leader', 'task-manager'].includes(member.role)) {
            return res.status(403).json({ msg: 'Only Leaders and Task Managers can create tasks' });
        }

        const newTask = new Task({
            title,
            description,
            group: groupId,
            deadline,
            assignedTo: assignedTo || null,
            type: type || 'Task'
        });

        await newTask.save();

        const { logActivity } = require('../utils/activityLogger');
        await logActivity(req.user.id, groupId, 'task_created', { title, taskId: newTask._id });

        if (assignedTo) {
            await notificationController.createNotification(
                assignedTo,
                `You have been assigned to a new task: ${title}`,
                'info',
                req.app.get('io')
            );
        }

        res.json(newTask);
    } catch (err) {
        console.error('Task creation error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Get group tasks
router.get('/group/:groupId', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ group: req.params.groupId }).populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const oldStatus = task.status;
        task.status = status;

        // Add to history
        task.statusHistory.push({
            from: oldStatus,
            to: status,
            updatedBy: req.user.id
        });

        if (status === 'Done') {
            task.completedAt = new Date();
        }

        await task.save();

        const { logActivity } = require('../utils/activityLogger');
        await logActivity(req.user.id, task.group, 'task_status_updated', {
            taskId: task._id,
            taskTitle: task.title,
            from: oldStatus,
            to: status
        });

        res.json(task);
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Update task assignment
router.patch('/:id/assign', auth, async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        task.assignedTo = assignedTo;
        await task.save();

        if (assignedTo) {
            await notificationController.createNotification(
                assignedTo,
                `You have been assigned to task: ${task.title}`,
                'info',
                req.app.get('io')
            );
        }

        res.json(task);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get user's assigned tasks across all groups
router.get('/my-tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('group', 'name')
            .populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
