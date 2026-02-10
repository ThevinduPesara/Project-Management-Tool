const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

exports.verifyTaskWithAI = async (req, res) => {
    const { taskId, submissionNote } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        const prompt = `
        You are a meticulous Quality Assurance (QA) Engineer. 
        Verify if the following task has been completed correctly based on its requirements and the user's submission note.

        TASK REQUIREMENTS:
        Title: ${task.title}
        Description: ${task.description || 'No description provided'}

        USER SUBMISSION NOTE:
        ${submissionNote || 'No note provided'}

        VERDICT CRITERIA:
        - If the submission note clearly addresses the main requirements, return "PASS".
        - If there are missing parts or the note is vague, return "FAIL".

        Return ONLY a JSON object in this format:
        {
            "verdict": "PASS" | "FAIL",
            "feedback": "Detailed feedback itemized by requirements",
            "suggestions": "What to do next if failed"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Remove markdown code blocks if present
        let jsonStr = text.replace(/```json|```/g, '').trim();

        // Find the first { and last } to handle extra text
        const firstBracket = jsonStr.indexOf('{');
        const lastBracket = jsonStr.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }

        const verification = JSON.parse(jsonStr);

        // Update task with submission note and feedback
        task.submissionNote = submissionNote;
        task.qaFeedback = verification.feedback;
        await task.save();

        res.json(verification);

    } catch (error) {
        console.error('AI QA Error:', error);
        res.status(500).json({ message: 'Failed to verify task', error: error.message });
    }
};
