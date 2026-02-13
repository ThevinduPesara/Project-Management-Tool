require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log("Success!");
    } catch (err) {
        console.error("Failed!");
        fs.writeFileSync('error_log.txt', err.message);
        console.log("Error written to error_log.txt");
    }
}

generate();
