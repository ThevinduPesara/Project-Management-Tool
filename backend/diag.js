require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log("Testing Gemini API with key:", process.env.GOOGLE_AI_API_KEY ? "EXISTS" : "MISSING");
    if (!process.env.GOOGLE_AI_API_KEY) return;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Sending prompt...");
        const result = await model.generateContent("Return a valid JSON object: { \"test\": \"pass\" }");
        const response = await result.response;
        const text = response.text();
        console.log("Raw Response:", text);

        const jsonStr = text.replace(/```json|```/g, '').trim();
        console.log("Cleaned JSON String:", jsonStr);

        const parsed = JSON.parse(jsonStr);
        console.log("Parsed Successfully:", parsed);
    } catch (err) {
        console.error("Gemini Error:", err);
    }
}

testGemini();
