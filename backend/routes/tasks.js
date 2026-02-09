const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Group = require('../models/Group');

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, groupId, deadline, assignedTo, type } = req.body;

        // check if user is in group
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: 'Group not found' });
        if (!group.members.includes(req.user.id)) {
            return res.status(401).json({ msg: 'Unauthorized' });
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
        res.json(newTask);
    } catch (err) {
        res.status(500).send('Server Error');
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

        task.status = status;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Server Error');
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
