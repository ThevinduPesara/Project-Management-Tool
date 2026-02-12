const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Group = require('../models/Group');
const { sendDailyDigest, sendWeeklyDigest } = require('../utils/emailService');
const { getRepoCommitStats } = require('../utils/githubService');

/**
 * Initialize all scheduled jobs
 */
const initSchedulers = () => {
    // 1. Daily Digest Job - Runs every morning at 8:00 AM
    // Seconds Minutes Hours DayOfMonth Month DayOfWeek
    cron.schedule('0 0 8 * * *', async () => {
        console.log('Running Daily Digest Job...');
        try {
            const users = await User.find({ emailDigestEnabled: true, emailDigestFrequency: 'daily' });
            for (const user of users) {
                await processDailyDigest(user);
            }
        } catch (error) {
            console.error('Error in Daily Digest Job:', error);
        }
    }, {
        timezone: "Asia/Colombo" // User's timezone
    });

    // 2. Weekly Digest Job - Runs every Monday at 9:00 AM
    cron.schedule('0 0 9 * * 1', async () => {
        console.log('Running Weekly Digest Job...');
        try {
            const users = await User.find({ emailDigestEnabled: true, emailDigestFrequency: 'weekly' });
            for (const user of users) {
                await processWeeklyDigest(user);
            }
        } catch (error) {
            console.error('Error in Weekly Digest Job:', error);
        }
    }, {
        timezone: "Asia/Colombo"
    });

    console.log('Schedulers initialized successfully');
};

/**
 * Gather data and send Daily Digest for a user
 */
const processDailyDigest = async (user) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        // Find tasks assigned to user that are not done
        const tasks = await Task.find({
            assignedTo: user._id,
            status: { $ne: 'Done' }
        });

        const overdueCount = tasks.filter(t => t.deadline && new Date(t.deadline) < startOfDay).length;
        const todoCount = tasks.length;

        // Urgent tasks: due today or overdue
        const urgentTasks = tasks.filter(t => t.deadline && new Date(t.deadline) <= endOfDay);

        await sendDailyDigest(user, {
            todoCount,
            overdueCount,
            urgentTasks: urgentTasks.slice(0, 5) // Send top 5 urgent tasks
        });
    } catch (error) {
        console.error(`Error processing daily digest for ${user.email}:`, error);
    }
};

/**
 * Gather data and send Weekly Digest for a user
 */
const processWeeklyDigest = async (user) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Find groups user is part of
        const groups = await Group.find({ members: user._id });
        const groupStats = [];

        let totalCommits = 0;
        let completedThisWeek = 0;

        for (const group of groups) {
            const tasks = await Task.find({ group: group._id });
            const completedTasks = tasks.filter(t => t.status === 'Done');
            const totalTasks = tasks.length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

            // Tasks completed by user this week
            const userCompletedThisWeek = completedTasks.filter(t =>
                t.assignedTo?.toString() === user._id.toString() &&
                t.updatedAt >= oneWeekAgo
            ).length;
            completedThisWeek += userCompletedThisWeek;

            // GitHub stats for user in this group
            if (group.githubRepo && user.githubUsername) {
                const repoStats = await getRepoCommitStats(group.githubRepo);
                if (repoStats && repoStats[user.githubUsername.toLowerCase()]) {
                    totalCommits += repoStats[user.githubUsername.toLowerCase()];
                }
            }

            groupStats.push({
                name: group.name,
                progress,
                completedTasks: completedTasks.length,
                totalTasks
            });
        }

        await sendWeeklyDigest(user, {
            groups: groupStats,
            completedThisWeek,
            totalCommits
        });
    } catch (error) {
        console.error(`Error processing weekly digest for ${user.email}:`, error);
    }
};

module.exports = { initSchedulers };
