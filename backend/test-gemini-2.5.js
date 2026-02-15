require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini25() {
    try {
        const key = process.env.GOOGLE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Asking gemini-2.5-flash...");
        const result = await model.generateContent("Hello! Are you gemini 2.5?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (err) {
        console.error("Error with gemini-2.5-flash:", err);
    }
}

testGemini25();
