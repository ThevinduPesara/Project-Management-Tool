const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task');
const Group = require('../models/Group');

// Configure Multer for PDF uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// @route   GET api/ai/test-models
// @desc    Test which Gemini models are available
router.get('/test-models', auth, async (req, res) => {
    try {
        // Try different model names
        const modelNames = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
        const results = [];

        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
                const result = await model.generateContent('Hello');
                results.push({
                    model: modelName,
                    status: 'works',
                    response: result.response.text()
                });
            } catch (err) {
                results.push({
                    model: modelName,
                    status: 'error',
                    error: err.message
                });
            }
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/ai/analyze
// @desc    Analyze project brief and suggest tasks
router.post('/analyze', [auth, upload.single('file')], async (req, res) => {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            return res.status(500).json({
                msg: 'Backend configuration error: API Key missing. Please restart the server.'
            });
        }

        let text = req.body.text || '';

        // Parse uploaded PDF if present
        if (req.file) {
            try {
                const data = await pdf(req.file.buffer);
                text += '\n' + data.text;
            } catch (pdfErr) {
                console.error('PDF Parse Error:', pdfErr);
                return res.status(400).json({
                    msg: 'Failed to parse PDF file. Please ensure it is a valid PDF.'
                });
            }
        }

        if (!text.trim()) {
            return res.status(400).json({
                msg: 'Please provide a project brief or upload a PDF.'
            });
        }

        // Use the correct model name - try gemini-pro first
        let model;
        try {
            model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });
        } catch (modelErr) {
            console.error('Model initialization error:', modelErr);
            return res.status(500).json({
                msg: 'Failed to initialize AI model. Please check API configuration.'
            });
        }

        const prompt = `Analyze this project brief and suggest a list of tasks.
Return ONLY a valid JSON array of objects. 
Each object MUST have: "title", "description", "type" (Story/Task/Bug), and "priority" (Low/Medium/High).

Brief:
${text}`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Clean markdown formatting if present
        if (responseText.includes('```json')) {
            responseText = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
            responseText = responseText.split('```')[1].split('```')[0].trim();
        }

        try {
            const tasks = JSON.parse(responseText);

            // Validate the response structure
            if (!Array.isArray(tasks)) {
                throw new Error('Response is not an array');
            }

            // Validate each task has required fields
            const validatedTasks = tasks.map(task => {
                if (!task.title || !task.description || !task.type || !task.priority) {
                    throw new Error('Task missing required fields');
                }
                return {
                    title: task.title,
                    description: task.description,
                    type: task.type,
                    priority: task.priority
                };
            });

            res.json(validatedTasks);
        } catch (parseErr) {
            console.error('AI JSON Parse Error:', parseErr);
            console.error('Attempted to parse:', responseText);
            res.status(500).json({
                msg: 'AI generated an invalid response. Please try again.',
                debug: process.env.NODE_ENV === 'development' ? responseText : undefined
            });
        }

    } catch (err) {
        console.error('AI General Error:', err);
        res.status(500).json({
            msg: 'AI analysis failed: ' + (err.message || 'Unknown error')
        });
    }
});

// @route   POST api/ai/confirm
// @desc    Bulk create and assign suggested tasks
router.post('/confirm', auth, async (req, res) => {
    try {
        const { groupId, suggestedTasks } = req.body;

        // Validate input
        if (!groupId) {
            return res.status(400).json({ msg: 'Group ID is required' });
        }

        if (!suggestedTasks || !Array.isArray(suggestedTasks) || suggestedTasks.length === 0) {
            return res.status(400).json({ msg: 'Suggested tasks are required' });
        }

        // Find the group and populate members with their skills
        const group = await Group.findById(groupId).populate('members', '_id name skills');

        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if user is a member of the group
        const isMember = group.members.some(member =>
            member._id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({ msg: 'Not authorized to create tasks for this group' });
        }

        const members = group.members;

        if (members.length === 0) {
            return res.status(400).json({ msg: 'Group has no members to assign tasks to' });
        }

        // Use AI to intelligently assign tasks based on member skills
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        // Prepare member information for AI
        const memberInfo = members.map((member, index) => ({
            index: index,
            name: member.name,
            skills: member.skills && member.skills.length > 0 ? member.skills : ['General']
        }));

        // Prepare tasks information
        const taskInfo = suggestedTasks.map((task, index) => ({
            index: index,
            title: task.title,
            description: task.description,
            type: task.type || 'Task',
            priority: task.priority || 'Medium'
        }));

        const aiPrompt = `You are a project manager assigning tasks to team members based on their skills.

Members:
${JSON.stringify(memberInfo, null, 2)}

Tasks to assign:
${JSON.stringify(taskInfo, null, 2)}

Analyze each task and assign it to the most suitable member based on their skills. If a member has no specific skills, they can handle general tasks.

Return ONLY a valid JSON array where each object has:
- "taskIndex": the index of the task
- "memberIndex": the index of the assigned member
- "reason": brief explanation (max 10 words) why this member is suitable

Example: [{"taskIndex": 0, "memberIndex": 1, "reason": "Has relevant frontend skills"}]`;

        let assignments;
        try {
            const result = await model.generateContent(aiPrompt);
            let responseText = result.response.text().trim();

            // Clean markdown formatting if present
            if (responseText.includes('```json')) {
                responseText = responseText.split('```json')[1].split('```')[0].trim();
            } else if (responseText.includes('```')) {
                responseText = responseText.split('```')[1].split('```')[0].trim();
            }

            assignments = JSON.parse(responseText);

            // Validate assignments
            if (!Array.isArray(assignments) || assignments.length !== suggestedTasks.length) {
                throw new Error('Invalid AI response format');
            }
        } catch (aiErr) {
            console.error('AI Assignment Error:', aiErr);
            // Fallback to round-robin if AI fails
            assignments = suggestedTasks.map((task, index) => ({
                taskIndex: index,
                memberIndex: index % members.length,
                reason: 'Auto-assigned (AI unavailable)'
            }));
        }

        // Create tasks with AI-assigned members
        const tasksToCreate = suggestedTasks.map((task, index) => {
            const assignment = assignments.find(a => a.taskIndex === index) || {
                memberIndex: index % members.length,
                reason: 'Auto-assigned'
            };

            return {
                title: task.title,
                description: task.description,
                type: task.type || 'Task',
                priority: task.priority || 'Medium',
                status: 'To Do',
                group: groupId,
                assignedTo: members[assignment.memberIndex]._id,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
                createdBy: req.user.id
            };
        });

        const createdTasks = await Task.insertMany(tasksToCreate);

        // Populate assignedTo field for response
        const populatedTasks = await Task.find({
            _id: { $in: createdTasks.map(t => t._id) }
        }).populate('assignedTo', 'name email');

        res.json(populatedTasks);
    } catch (err) {
        console.error('Bulk Create Error:', err);
        res.status(500).json({
            msg: 'Server error while creating tasks',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route   POST api/ai/generate-suggestion
// @desc    Generate AI suggestion for a single task or feature
router.post('/generate-suggestion', auth, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ msg: 'Prompt is required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ suggestion: responseText });
    } catch (err) {
        console.error('AI Suggestion Error:', err);
        res.status(500).json({
            msg: 'Failed to generate suggestion: ' + (err.message || 'Unknown error')
        });
    }
});

module.exports = router;