require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function listModels() {
    try {
        // For v1beta (default usually covers more models)
        console.log("Checking v1beta models...");
        // Accessing model list is slightly different depending on version, 
        // but let's try the standard way first.
        // Note: The SDK might not expose listModels directly on genAI instance easily 
        // without using the specific model manager, but let's try accessing via a model request 
        // if list isn't obvious, or just use the direct API response if I can.

        // Actually, the SDK has a verify method or we can just try to hit the endpoint using fetch 
        // if the SDK is opaque, but let's try to assume the user has a valid key and just want to see 
        // what *works*.

        // Changing strategy: The SDK doesn't always have a clean 'listModels' helper in the high-level entry.
        // I'll use a direct fetch to the API to be sure, avoiding SDK version quirks.

        const key = process.env.GOOGLE_AI_API_KEY;
        if (!key) {
            console.error("No API Key found in env!");
            return;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models (v1beta):");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.error("Failed to list models:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
