import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testAI() {
    console.log('Testing Google Generative AI...');
    console.log('API Key:', process.env.GOOGLE_API_KEY ? 'Found' : 'Missing');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Test different model names
    const modelNames = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
    ];
    
    for (const modelName of modelNames) {
        try {
            console.log(`\n=== Testing model: ${modelName} ===`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello');
            const response = result.response;
            const text = response.text();
            console.log(`✅ SUCCESS with ${modelName}`);
            console.log('Response:', text.substring(0, 100));
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}`);
            console.log('Error:', error.message);
        }
    }
}

testAI().catch(console.error);
