const Task = require('../models/Task');
const Group = require('../models/Group');
const User = require('../models/User');
const githubService = require('../utils/githubService');

// Simple in-memory cache for user context
const contextCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

exports.getUserContext = async (userId) => {
    try {
        const now = Date.now();
        const cached = contextCache.get(userId.toString());
        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

        const user = await User.findById(userId);
        if (!user) return null;

        // 1. Fetch User's Tasks (To Do / In Progress)
        const myTasks = await Task.find({
            assignedTo: userId,
            status: { $ne: 'Done' }
        }).populate('group', 'name').limit(15);

        // 2. Fetch Groups the user is in
        const userGroups = await Group.find({ 'members.user': userId }).populate('members.user', 'name githubUsername');
        const groupIds = userGroups.map(g => g._id);

        // 3. Fetch Recent Activity (Last 24h)
        const recentActivity = await Task.find({
            group: { $in: groupIds },
            status: 'Done',
            updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
        }).populate('assignedTo', 'name').populate('group', 'name').limit(10);

        // 4. Fetch Project-Wide Context & GitHub Stats
        const projectContexts = [];
        const developmentActivity = [];

        for (const group of userGroups) {
            // Task Stats for this group
            const projectTasksCount = await Task.countDocuments({ group: group._id });
            const todoCount = await Task.countDocuments({ group: group._id, status: 'To Do' });
            const inProgressCount = await Task.countDocuments({ group: group._id, status: 'In Progress' });
            const doneCount = await Task.countDocuments({ group: group._id, status: 'Done' });

            // Fetch a limited sample of tasks for context compression
            const projectTasks = await Task.find({ group: group._id }).populate('assignedTo', 'name').limit(10);

            let projectStr = `Project "${group.name}":\n`;
            projectStr += `- Stats: ${projectTasksCount} total (${todoCount} To Do, ${inProgressCount} In Progress, ${doneCount} Done)\n`;

            if (projectTasks.length > 0) {
                projectStr += `- Important Tasks (Top ${projectTasks.length}):\n`;
                projectTasks.forEach(t => {
                    const assigned = t.assignedTo ? t.assignedTo.name : 'Unassigned';
                    projectStr += `  * [${t.status}] ${t.title} (Assigned to: ${assigned})\n`;
                });
                if (projectTasksCount > 10) {
                    projectStr += `  * ... and ${projectTasksCount - 10} more tasks.\n`;
                }
            }
            projectContexts.push(projectStr);

            // GitHub Stats for this group
            if (group.githubRepo) {
                const githubStats = await githubService.getRepoCommitStats(group.githubRepo);
                if (githubStats) {
                    let gitStr = `GitHub Activity for ${group.name} (${group.githubRepo}):\n`;
                    for (const member of group.members) {
                        const userData = member.user;
                        if (userData && userData.githubUsername) {
                            const commits = githubStats[userData.githubUsername.toLowerCase()] || 0;
                            gitStr += `- ${userData.name} (${userData.githubUsername}): ${commits} commits\n`;
                        }
                    }
                    developmentActivity.push(gitStr);
                }
            }
        }

        // 5. Format summaries
        const taskSummary = myTasks.map(t => {
            const deadlineInfo = t.deadline ? ` (Due: ${new Date(t.deadline).toLocaleDateString()})` : '';
            return `- [${t.status}] ${t.title} (in ${t.group?.name})${deadlineInfo}`;
        }).join('\n');

        const activitySummary = recentActivity.map(t => `- ${t.assignedTo?.name} completed "${t.title}" in ${t.group?.name}`).join('\n');

        const result = {
            userName: user.name,
            taskCount: myTasks.length,
            tasks: taskSummary || "No pending tasks.",
            recentActivity: activitySummary || "No tasks completed in the last 24 hours.",
            projectContext: projectContexts.join('\n\n') || "No active projects.",
            developmentActivity: developmentActivity.join('\n\n') || "No GitHub activity found.",
            currentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };

        // Cache result
        contextCache.set(userId.toString(), { data: result, timestamp: now });

        return result;

    } catch (error) {
        console.error("Error fetching user context:", error);
        return null;
    }
};
