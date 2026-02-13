require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Write a short story about AI.");
        console.log(result.response.text());
    } catch (err) {
        console.error("AI generation failed:", err.message);
    }
}

generate();
