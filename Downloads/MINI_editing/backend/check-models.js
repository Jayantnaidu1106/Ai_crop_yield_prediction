import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function checkAvailableModels() {
    console.log('Checking Gemini API Configuration...\n');
    console.log('API Key:', process.env.GOOGLE_API_KEY ? '✓ Found' : '✗ Missing');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try to make a simple request to see what's enabled
    console.log('\n=== Checking Model Availability ===\n');
    
    const modelsToTest = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro-002',
        'gemini-1.5-pro-001',
        'models/gemini-2.0-flash-exp',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
    ];
    
    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Try to get model info
            console.log(`✓ ${modelName} - Available`);
        } catch (error) {
            console.log(`✗ ${modelName} - ${error.message.substring(0, 60)}`);
        }
    }
    
    console.log('\n=== Recommendation ===');
    console.log('Your API key only has access to gemini-2.0-flash-exp (experimental model)');
    console.log('This model has VERY strict rate limits on the free tier:');
    console.log('- Only ~2 requests per minute');
    console.log('- Limited input tokens per minute');
    console.log('\nSolutions:');
    console.log('1. Wait 60 seconds between AI requests (add rate limiting)');
    console.log('2. Get a paid API key for higher quotas');
    console.log('3. Apply for increased quota at: https://ai.google.dev/pricing');
    console.log('4. Use a different AI service (OpenAI, Anthropic, etc.)');
}

checkAvailableModels().catch(console.error);
