require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in this version effectively without admin SDK
        // But let's try a simple generation with a known fallback if 1.5 fails

        console.log("Trying gemini-1.5-flash...");
        const result = await model.generateContent("Test");
        console.log("Success with gemini-1.5-flash");
    } catch (err) {
        console.error("Error with gemini-1.5-flash:", err.message);

        try {
            console.log("Trying gemini-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            await model2.generateContent("Test");
            console.log("Success with gemini-pro");
        } catch (err2) {
            console.error("Error with gemini-pro:", err2.message);
        }
    }
}

listModels();
