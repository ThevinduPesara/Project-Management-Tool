require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function listModels() {
    try {
        console.log("Listing models...");
        // Use the internal method to see what we can find
        // Note: listModels is on the genAI object in newer versions
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels ?
            await genAI.listModels() :
            null;

        if (result) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log("listModels method not found on genAI object.");
            // Try another way if it's a different version
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("Testing gemini-1.5-flash directly...");
            const response = await model.generateContent("test");
            console.log("Success!");
        }
    } catch (err) {
        console.error("Error:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

listModels();
