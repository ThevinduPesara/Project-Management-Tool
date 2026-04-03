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
        const tasks = await Task.find({ group: req.params.groupId })
            .populate('assignedTo', 'name email')
            .populate('reviewedBy', 'name');
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

        if (oldStatus === 'Under Review' && status === 'Done') {
            const group = await Group.findById(task.group);
            if (!group) return res.status(404).json({ msg: 'Group not found' });

            const isLeader = group.leader.toString() === req.user.id ||
                group.members.some(m => m.user.toString() === req.user.id && m.role === 'leader');

            if (!isLeader) {
                return res.status(403).json({ msg: 'Only the Group Leader can approve tasks from review' });
            }

            // Added validation: Require submissionNote to move from Under Review to Done
            if (!task.submissionNote || task.submissionNote.trim() === '' || task.submissionNote === 'No note provided.') {
                return res.status(400).json({ msg: 'A submission note is required before approving and finishing this task.' });
            }

            task.reviewedBy = req.user.id;
        }

        // New Validation: Require submissionNote when moving to Under Review
        if (status === 'Under Review') {
            if (!req.body.submissionNote || req.body.submissionNote.trim() === '') {
                return res.status(400).json({ msg: 'Please add a submission note explaining your work.' });
            }
        }

        if (req.body.submissionNote) {
            task.submissionNote = req.body.submissionNote;
        }

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

        // Fetch populated task to return to frontend
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('reviewedBy', 'name');

        res.json(populatedTask);
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
        if (process.env.MOCK_DB === 'true') {
            return res.json([
                { _id: 't1', title: 'Implement Mock Mode', status: 'In Progress', group: { name: 'ITPM Project' }, assignedTo: { name: 'Test User' } },
                { _id: 't2', title: 'Verify Dashboard', status: 'In Progress', group: { name: 'Frontend Team' }, assignedTo: { name: 'Test User' } }
            ]);
        }
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('group', 'name')
            .populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update full task details
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, deadline, assignedTo, type } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const group = await Group.findById(task.group);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        const member = group.members.find(m => m.user.toString() === req.user.id);
        if (!member || !['leader', 'task-manager'].includes(member.role)) {
            return res.status(403).json({ msg: 'Only Leaders and Task Managers can edit tasks' });
        }

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.deadline = deadline !== undefined ? deadline : task.deadline;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.type = type || task.type;

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('reviewedBy', 'name');

        res.json(populatedTask);
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const group = await Group.findById(task.group);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        const member = group.members.find(m => m.user.toString() === req.user.id);
        if (!member || !['leader', 'task-manager'].includes(member.role)) {
            return res.status(403).json({ msg: 'Only Leaders and Task Managers can delete tasks' });
        }

        await Task.findByIdAndDelete(req.params.id);

        const { logActivity } = require('../utils/activityLogger');
        await logActivity(req.user.id, task.group, 'task_deleted', { taskTitle: task.title });

        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
