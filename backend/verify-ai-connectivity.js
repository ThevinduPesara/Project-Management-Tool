require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkAI() {
    const key = process.env.GOOGLE_AI_API_KEY;
    console.log("API Key found:", key ? "Yes (length: " + key.length + ")" : "No");

    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\nTesting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            console.log(`Success with ${modelName}:`, result.response.text());
        } catch (err) {
            console.error(`Failed with ${modelName}:`, err.message);
        }
    }
}

checkAI();
