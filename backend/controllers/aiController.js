const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const fs = require('fs');
const Task = require('../models/Task');
const Group = require('../models/Group');
const notificationController = require('./notificationController');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

exports.estimateDifficulty = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        const prompt = `
        Analyze the following task and estimate its difficulty level (Easy, Medium, Hard) and suggest an appropriate emoji.
        Return ONLY a JSON object in this format: { "difficulty": "Level", "emoji": "Emoji", "estimatedHours": Number }.
        
        Task Title: ${title}
        Task Description: ${description || 'No description provided'}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response to ensure it's valid JSON
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

        // Handle file upload if present
        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdf(dataBuffer);
            projectText += "\n\n" + pdfData.text;

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
        }

        if (!projectText.trim()) {
            return res.status(400).json({ msg: 'Please provide project description text or upload a PDF.' });
        }

        // Fetch group members to provide context for AI assignments
        const group = await Group.findById(req.body.groupId).populate('members', 'name');
        const memberNames = group ? group.members.map(m => m.name).join(', ') : 'No members found';

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        const prompt = `
        You are an expert Project Manager. Create a detailed task list for the following project description.
        
        Project Description:
        ${projectText}

        Team Members: ${memberNames}

        Return ONLY a JSON array of tasks. Each task object should look like this:
        {
            "title": "Task Title",
            "description": "Brief description of the task",
            "type": "Story" | "Task" | "Bug",
            "estimatedHours": Number,
            "assignedToName": "One of the team member names provided, or empty if you can't decide"
        }
        
        Do not include any markdown formatting like \`\`\`json. Just return the raw JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        let jsonStr = text.replace(/```json|```/g, '').trim();

        const firstBracket = jsonStr.indexOf('['); // Changed to '[' for array parsing
        const lastBracket = jsonStr.lastIndexOf(']'); // Changed to ']' for array parsing
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }

        const analysis = JSON.parse(jsonStr);

        res.json(analysis); // Changed from 'plan' to 'analysis'

    } catch (err) {
        console.error('AI Analysis Error:', err);
        res.status(500).json({ msg: 'Failed to analyze project', error: err.message });

        // Cleanup if file exists and error occurred
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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
            // Find member by name if AI suggested an assignment
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

        // Notify all group members
        const notificationMsg = `A new AI Project Plan has been applied to group "${group.name}" with ${createdTasks.length} tasks.`;
        for (const member of group.members) {
            await notificationController.createNotification(member._id, notificationMsg);
        }

        res.json({ msg: 'Plan applied successfully', tasks: createdTasks });

    } catch (error) {
        console.error('Confirm Plan Error:', error);
        res.status(500).json({ msg: 'Failed to apply plan', error: error.message });
    }
};
