const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Group = require('../models/Group');

// Get global dashboard summary stats
router.get('/summary', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get all groups user is part of
        const groups = await Group.find({ members: userId });
        const groupIds = groups.map(g => g._id);
        const activeProjects = groups.length;

        // 2. Get all tasks in these groups
        const tasks = await Task.find({ group: { $in: groupIds } })
            .populate('assignedTo', 'name')
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        const totalTasks = tasks.length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

        const now = new Date();
        const overdueTasks = tasks.filter(t =>
            t.status !== 'Done' && t.deadline && new Date(t.deadline) < now
        ).length;

        // 3. Recent Tasks (limit to 4)
        const recentTasks = tasks.slice(0, 4);

        // 4. Team Contributions (across all projects)
        const memberStats = {};
        tasks.forEach(task => {
            if (task.assignedTo) {
                const uid = task.assignedTo._id.toString();
                if (!memberStats[uid]) {
                    memberStats[uid] = { name: task.assignedTo.name, assigned: 0, completed: 0 };
                }
                memberStats[uid].assigned += 1;
                if (task.status === 'Done') memberStats[uid].completed += 1;
            }
        });

        const teamContributions = Object.values(memberStats).map(stat => ({
            name: stat.name,
            score: stat.assigned === 0 ? 0 : Math.round((stat.completed / stat.assigned) * 100),
            completed: stat.completed,
            total: stat.assigned
        }));

        // 5. Recent Activity (Latest 10 status changes)
        const recentActivityRaw = await Task.find({ group: { $in: groupIds } })
            .select('title statusHistory group')
            .populate('statusHistory.updatedBy', 'name')
            .populate('group', 'name')
            .lean();

        const flattenedActivity = recentActivityRaw.reduce((acc, task) => {
            if (!task.statusHistory || !Array.isArray(task.statusHistory)) return acc;

            const history = task.statusHistory.map(h => ({
                ...h,
                taskTitle: task.title,
                groupName: task.group?.name || 'Unknown Group',
                taskId: task._id
            }));
            return [...acc, ...history];
        }, []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);

        res.json({
            activeProjects,
            totalTasks,
            inProgressTasks,
            overdueTasks,
            recentTasks,
            teamContributions,
            recentActivity: flattenedActivity
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
