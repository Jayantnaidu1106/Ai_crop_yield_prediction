import { Hume } from 'hume';
import Groq from 'groq-sdk';

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_CONFIG_ID = process.env.HUME_CONFIG_ID;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log('🎭 Hume Interview Service loaded');
console.log(`   - Hume Key: ${HUME_API_KEY ? '✓' : '✗'}`);
console.log(`   - Hume Config: ${HUME_CONFIG_ID ? '✓' : '✗'}`);
console.log(`   - Groq Fallback Key: ${GROQ_API_KEY ? '✓' : '✗'}`);

/**
 * Generate interview response using Hume EVI (if configured) or Groq fallback
 */
export const generateInterviewResponse = async (conversationHistory, userMessage, systemPrompt) => {
    try {
        // Try Hume EVI first if configured
        if (HUME_API_KEY && HUME_CONFIG_ID) {
            try {
                console.log('🎭 Using Hume EVI with conversation memory');
                return await generateHumeEVIResponse(conversationHistory, userMessage, systemPrompt);
            } catch (humeError) {
                console.error('❌ Hume EVI failed, falling back to Groq:', humeError.message);
            }
        }

        // Fallback to Groq
        console.log('🤖 Using Groq fallback');
        return await generateGroqResponse(conversationHistory, userMessage, systemPrompt);

    } catch (error) {
        console.error('❌ All AI services failed:', error);
        throw error;
    }
};

/**
 * Generate response using Hume EVI API
 */
async function generateHumeEVIResponse(conversationHistory, userMessage, systemPrompt) {
    try {
        const client = new Hume({
            apiKey: HUME_API_KEY,
            secretKey: process.env.HUME_SECRET_KEY
        });

        // Build conversation context for Hume
        const conversationContext = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // Add current message
        conversationContext.push({
            role: 'user',
            content: userMessage
        });

        console.log(`📝 Hume EVI request with ${conversationContext.length} messages`);

        // Try Hume's text-based chat API (EVI config)
        // Note: Hume SDK structure may vary - adjust based on actual SDK docs
        const response = await client.chat.chat({
            config_id: HUME_CONFIG_ID,
            messages: conversationContext
        });

        const responseText = response.message?.content || response.content || response.text || '';
        console.log(`✅ Hume response: ${responseText.substring(0, 100)}...`);
        
        if (!responseText) {
            throw new Error('Empty response from Hume');
        }
        
        return responseText.trim();
    } catch (error) {
        console.error('❌ Hume EVI API error:', error.message);
        // Re-throw to trigger fallback
        throw error;
    }
}

/**
 * Fallback: Generate response using Groq
 */
async function generateGroqResponse(conversationHistory, userMessage, systemPrompt) {
    if (!GROQ_API_KEY) {
        throw new Error('No AI service configured');
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Build messages array
    const messages = [];
    
    // Enhanced system prompt for anti-repetition
    const enhancedSystemPrompt = `${systemPrompt}

CONVERSATIONAL INTELLIGENCE:
- You're having a real conversation, not following a script
- Show you're actively listening by referencing their specific answers
- Use natural transitions ("That makes sense", "Interesting", "I like that approach")
- Ask follow-ups that dig deeper into what they just said
- Mix technical rigor with human warmth
- Vary your question types: technical depth, practical scenarios, trade-offs, debugging, system design
- Remember what you've already asked - never repeat topics
- Build on previous answers to create a flowing conversation

CRITICAL: Each response should feel unique and tailored to what they JUST said. No generic questions.`;

    messages.push({
        role: 'system',
        content: enhancedSystemPrompt
    });
    
    // Add conversation history
    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
    }
    
    // Add current message
    messages.push({
        role: 'user',
        content: userMessage
    });

    console.log(`📝 Groq chat with ${messages.length} messages`);

    const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'];

    for (const modelName of models) {
        try {
            console.log(`Trying ${modelName}...`);
            
            const completion = await groq.chat.completions.create({
                messages: messages,
                model: modelName,
                temperature: 0.9,
                max_tokens: 450,
                top_p: 0.95,
                frequency_penalty: 0.5,
                presence_penalty: 0.6
            });

            const responseText = completion.choices[0]?.message?.content || '';
            
            console.log(`✅ Groq success: ${responseText.substring(0, 100)}...`);
            
            return responseText.trim();

        } catch (error) {
            console.error(`❌ Failed with ${modelName}:`, error.message);
            
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            
            // Try next model
            if (modelName !== models[models.length - 1]) {
                continue;
            }
            
            throw error;
        }
    }
    
    throw new Error('All models failed');
}
