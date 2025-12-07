import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testAI() {
    console.log('Testing Google Generative AI...');
    console.log('API Key:', process.env.GOOGLE_API_KEY ? 'Found' : 'Missing');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // First, try to list available models
    try {
        console.log('\n=== Attempting to list available models ===');
        const models = await genAI.listModels();
        console.log('Available models:');
        models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
        });
    } catch (error) {
        console.log('Could not list models:', error.message);
    }
    
    // Test different model names (updated for 2024)
    const modelNames = [
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro-002',
        'gemini-2.0-flash-exp',
    ];
    
    for (const modelName of modelNames) {
        try {
            console.log(`\n=== Testing model: ${modelName} ===`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in one sentence');
            const response = result.response;
            const text = response.text();
            console.log(`✅ SUCCESS with ${modelName}`);
            console.log('Response:', text);
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}`);
            console.log('Error:', error.message);
        }
    }
}

testAI().catch(console.error);
