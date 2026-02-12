/**
 * Email HTML Templates for Digest Emails
 */

const dailyDigestTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
        .task-list { list-style: none; padding: 0; }
        .task-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .task-title { font-weight: 600; }
        .task-deadline { font-size: 12px; color: #ef4444; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
        .stat-card { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
        .stat-value { font-size: 24px; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .btn { display: inline-block; background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UniTask Daily Digest</h1>
            <p>Here's your summary for ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
            <h3>Hello, ${data.name}! 👋</h3>
            <p>Here are your tasks for today:</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${data.todoCount}</div>
                    <div class="stat-label">To Do</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.overdueCount}</div>
                    <div class="stat-label">Overdue</div>
                </div>
            </div>

            <h4>🔥 Urgent / Due Today</h4>
            <ul class="task-list">
                ${data.urgentTasks.length > 0
        ? data.urgentTasks.map(t => `
                        <li class="task-item">
                            <span class="task-title">${t.title}</span>
                            <span class="task-deadline">${new Date(t.deadline).toLocaleDateString()}</span>
                        </li>
                    `).join('')
        : '<li>All caught up! No urgent tasks.</li>'
    }
            </ul>

            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">View My Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>You're receiving this because you enabled Daily Digests in your Settings.</p>
            <p>&copy; 2026 UniTask. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const weeklyDigestTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
        .group-card { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #eee; }
        .group-name { font-weight: bold; font-size: 18px; color: #111827; }
        .progress-bar { height: 10px; background: #e5e7eb; border-radius: 5px; margin-top: 8px; overflow: hidden; }
        .progress-fill { height: 100%; background: #10b981; border-radius: 5px; }
        .team-stats { margin-top: 20px; }
        .stat-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UniTask Weekly Wrap-up</h1>
            <p>Project progress for the past week</p>
        </div>
        <div class="content">
            <h3>Great work this week, ${data.name}! 🚀</h3>
            <p>Your team has been busy. Here's a look at your group progress:</p>

            ${data.groups.map(g => `
                <div class="group-card">
                    <div class="group-name">${g.name}</div>
                    <div class="stat-row">
                        <span>Progress</span>
                        <span>${g.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${g.progress}%"></div>
                    </div>
                    <div class="stat-row" style="margin-top: 10px;">
                        <span>Tasks Completed: ${g.completedTasks}</span>
                        <span>Total Tasks: ${g.totalTasks}</span>
                    </div>
                </div>
            `).join('')}

            <div class="team-stats">
                <h4>📊 Your Personal Stats</h4>
                <div class="stat-row">
                    <span>Tasks Completed this week</span>
                    <strong>${data.completedThisWeek}</strong>
                </div>
                <div class="stat-row">
                    <span>GitHub Commits tracked</span>
                    <strong>${data.totalCommits}</strong>
                </div>
            </div>

            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">View Team Progress</a>
            </center>
        </div>
        <div class="footer">
            <p>You're receiving this because you enabled Weekly Digests in your Settings.</p>
            <p>&copy; 2026 UniTask. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    dailyDigestTemplate,
    weeklyDigestTemplate
};
