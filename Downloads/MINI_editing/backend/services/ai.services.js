import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const generateResult = async (prompt) => {
    // Try multiple model names in order of preference (newest first)
    const modelNames = [
        'gemini-2.0-flash-exp',              // Latest experimental model
        'gemini-1.5-flash',                  // Stable 1.5 flash model
        'gemini-1.5-flash-latest',           // Latest 1.5 flash
        'gemini-pro',                        // Fallback stable model
    ];
    
    for (const modelName of modelNames) {
        try {
            console.log(`Trying AI model: ${modelName}...`);
            
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const systemPrompt = `You are an expert in MERN stack development with 10 years of experience. 
You write clean, modular code with best practices, proper error handling, and helpful comments.
You provide concise, practical solutions.`;

            const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nYour Answer:`;
            
            console.log('Sending request to Gemini API...');
            
            // Generate content
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();
            
            console.log(`✅ SUCCESS with model: ${modelName}`);
            return text;
            
        } catch (error) {
            console.log(`❌ Failed with ${modelName}: ${error.message}`);
            
            // If this is the last model, return error
            if (modelName === modelNames[modelNames.length - 1]) {
                console.error('=== All AI Models Failed ===');
                console.error('Error details:', error.message);
                
                return `❌ AI Service Unavailable

The AI models are not accessible with the current API key. This could be because:

1. The API key needs to be regenerated at: https://makersuite.google.com/app/apikey
2. The Generative Language API needs to be enabled in Google Cloud Console
3. Your API key might have expired or reached quota limits

Error: ${error.message}

Please update the GOOGLE_API_KEY in the .env file with a new key.`;
            }
            // Continue to next model
        }
    }
}
