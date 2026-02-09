const { GoogleGenerativeAI } = require("@google/generative-ai");

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
};
