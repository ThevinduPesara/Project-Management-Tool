const mongoose = require('mongoose');
require('dotenv').config();
const statsController = require('./controllers/statsController');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('./models/User');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function testVoiceAssistant() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Get a test user
        const user = await User.findOne();
        if (!user) {
            console.error("No users found to test with.");
            return;
        }
        console.log(`Testing with User: ${user.name} (${user._id})`);

        // 2. Test Context Fetching
        console.log("\n--- Testing getUserContext ---");
        const context = await statsController.getUserContext(user._id);
        console.log("User Context Retrieved:");
        console.log(JSON.stringify(context, null, 2));

        if (!context || !context.tasks) {
            console.error("Context fetch failed or empty.");
        }

        // 3. Test AI Response (Simulating askAssistant)
        console.log("\n--- Testing AI Response for Project Breakdown ---");

        const prompt1 = `
        You are a smart Project Assistant. Answer the question based on context.
        Project Context:
        ${context.projectContext}
        
        User Question: "How many tasks are in each project?"
        Answer concisely.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result1 = await model.generateContent(prompt1);
        console.log("AI Response (Project Count):", (await result1.response).text());

        console.log("\n--- Testing AI Response for GitHub Activity ---");
        const prompt2 = `
        You are a smart Project Assistant. Answer the question based on context.
        GitHub Stats:
        ${context.developmentActivity}
        
        User Question: "Who has the most commits and how many?"
        Answer concisely.
        `;
        const result2 = await model.generateContent(prompt2);
        console.log("AI Response (GitHub):", (await result2.response).text());

        console.log("\n--- Testing General Knowledge ---");
        const prompt3 = `
        You are a smart Project Assistant.
        User Question: "What is the capital of France?"
        Answer concisely.
        `;
        const result3 = await model.generateContent(prompt3);
        console.log("AI Response (General):", (await result3.response).text());

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nTest Completed");
    }
}

testVoiceAssistant();
