const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const fs = require('fs');
const Task = require('../models/Task');
const Group = require('../models/Group');
const notificationController = require('./notificationController');
const statsController = require('./statsController');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Helper to call Gemini with retries for 429 errors
 */
const generateWithRetry = async (model, prompt, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return await result.response;
        } catch (error) {
            const isRateLimit = error.message?.includes('429') || error.status === 429;
            if (isRateLimit && i < retries - 1) {
                console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
};

exports.estimateDifficulty = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Analyze task: "${title}". Description: "${description || ''}".
        Estimate difficulty (Easy, Medium, Hard).
        Return ONLY valid JSON: { "difficulty": "Level", "emoji": "Emoji", "estimatedHours": Number }.
        `;

        const response = await generateWithRetry(model, prompt);
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        res.json(analysis);
    } catch (error) {
        console.error('AI Estimation Error:', error);
        res.status(500).json({ message: 'Failed to estimate difficulty', error: error.message });
    }
}

exports.analyzeProject = async (req, res) => {
    try {
        let projectText = req.body.text || '';

        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdf(dataBuffer);
            projectText += "\n\n" + pdfData.text;
            fs.unlinkSync(req.file.path);
        }

        if (!projectText.trim()) {
            return res.status(400).json({ msg: 'Project description required.' });
        }

        const group = await Group.findById(req.body.groupId).populate('members', 'name skills');
        const membersWithSkills = group ? group.members.map(m => `${m.name} (${m.skills?.join(', ') || 'Generalist'})`).join('\n') : 'None';

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Expert PM Mode. Create task list for: ${projectText}.
        Team: ${membersWithSkills}.
        Return ONLY a raw JSON array of tasks: [{"title": "Name", "description": "Info", "type": "Story"|"Task"|"Bug", "estimatedHours": N, "assignedToName": "Name" or ""}].
        No markdown.
        `;

        const response = await generateWithRetry(model, prompt);
        let text = response.text();
        let jsonStr = text.replace(/```json|```/g, '').trim();

        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }

        const analysis = JSON.parse(jsonStr);
        res.json(analysis);

    } catch (err) {
        console.error('AI Analysis Error:', err);
        res.status(500).json({ msg: 'Analysis failed', error: err.message });
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
}

exports.confirmPlan = async (req, res) => {
    try {
        const { groupId, suggestedTasks } = req.body;

        if (!groupId || !suggestedTasks || !Array.isArray(suggestedTasks)) {
            return res.status(400).json({ msg: 'Invalid plan data' });
        }

        const group = await Group.findById(groupId).populate('members');
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        const createdTasks = [];

        for (const task of suggestedTasks) {
            let assignedToId = null;
            if (task.assignedToName) {
                const member = group.members.find(m => m.name === task.assignedToName);
                if (member) assignedToId = member._id;
            }

            const newTask = new Task({
                title: task.title,
                description: task.description,
                type: task.type || 'Task',
                estimatedHours: task.estimatedHours,
                difficultyLevel: task.difficulty,
                group: groupId,
                status: 'To Do',
                assignedTo: assignedToId
            });
            await newTask.save();
            createdTasks.push(newTask);
        }

        const notificationMsg = `Applied plan to "${group.name}" with ${createdTasks.length} tasks.`;
        for (const member of group.members) {
            await notificationController.createNotification(member._id, notificationMsg);
        }

        res.json({ msg: 'Plan applied', tasks: createdTasks });

    } catch (error) {
        console.error('Confirm Plan Error:', error);
        res.status(500).json({ msg: 'Failed to apply plan', error: error.message });
    }
};

exports.askAssistant = async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;

        if (!question) {
            return res.status(400).json({ msg: 'Question required' });
        }

        const context = await statsController.getUserContext(userId);
        if (!context) {
            return res.status(500).json({ msg: 'Failed to retrieve context' });
        }

        const systemPrompt = `
        You are a smart Project Assistant for ${context.userName}.
        Date: ${context.currentDate}
        
        PROJECT DATA:
        - Your Tasks: ${context.tasks}
        - Project Details: ${context.projectContext}
        - Dev Activity: ${context.developmentActivity}
        - Team Activity: ${context.recentActivity}
        
        INSTRUCTIONS:
        1. For project/task/GitHub questions, use the PROJECT DATA. Be specific.
        2. For general questions (non-project), use your internal knowledge.
        3. Professional & concise. No markdown formatting.
        
        Question: "${question}"
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await generateWithRetry(model, systemPrompt);
        const answer = response.text();

        res.json({ answer });

    } catch (error) {
        console.error('AI Assistant Error:', error);
        const isRateLimit = error.message?.includes('429');
        res.status(isRateLimit ? 429 : 500).json({
            msg: isRateLimit ? 'AI is currently busy due to rate limits. Please try again in 30 seconds.' : 'Failed to get answer',
            error: error.message
        });
    }
};
