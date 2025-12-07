import Groq from 'groq-sdk';

// Feature-specific API keys
const FEATURE_KEYS = {
    STUDY_ROOM: process.env.STUDY_ROOM_API_KEY || process.env.GROQ_API_KEY,
    MOCK_INTERVIEW: process.env.MOCK_INTERVIEW_API_KEY || process.env.GROQ_API_KEY,
    QUIZ: process.env.QUIZ_API_KEY || process.env.GROQ_API_KEY,
    DEFAULT: process.env.GROQ_API_KEY
};

console.log('🔑 Using Groq AI - Feature-specific API keys loaded:');
console.log(`   - Study Rooms: ${FEATURE_KEYS.STUDY_ROOM ? '✓' : '✗'}`);
console.log(`   - Mock Interviews: ${FEATURE_KEYS.MOCK_INTERVIEW ? '✓' : '✗'}`);
console.log(`   - Quiz: ${FEATURE_KEYS.QUIZ ? '✓' : '✗'}`);

// Rate limiting configuration
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests per feature
const MAX_PROMPT_LENGTH = 2000; // Max characters to prevent token explosion

// Separate queues for each feature
const featureQueues = {
    STUDY_ROOM: [],
    MOCK_INTERVIEW: [],
    QUIZ: [],
    DEFAULT: []
};

const featureProcessing = {
    STUDY_ROOM: false,
    MOCK_INTERVIEW: false,
    QUIZ: false,
    DEFAULT: false
};

const processQueue = async (feature) => {
    if (featureProcessing[feature] || featureQueues[feature].length === 0) return;
    
    featureProcessing[feature] = true;
    const { prompt, messages, resolve, reject } = featureQueues[feature].shift();
    
    try {
        // Execute either prompt-based or message-based request
        const result = messages 
            ? await executeChatRequest(messages, feature)
            : await executeAIRequest(prompt, feature);
        resolve(result);
    } catch (error) {
        reject(error);
    } finally {
        featureProcessing[feature] = false;
        
        // Process next request after interval
        if (featureQueues[feature].length > 0) {
            setTimeout(() => processQueue(feature), MIN_REQUEST_INTERVAL);
        }
    }
};

const executeAIRequest = async (prompt, feature) => {
    const apiKey = FEATURE_KEYS[feature] || FEATURE_KEYS.DEFAULT;
    
    if (!apiKey) {
        throw new Error('No API key configured for this feature');
    }
    
    console.log(`🔑 Using ${feature} with Groq AI`);
    
    // Initialize Groq client
    const groq = new Groq({ apiKey });
    
    // Try models in order of preference (fastest to most capable)
    const models = [
        'llama-3.3-70b-versatile',  // Fastest, great for general tasks
        'llama-3.1-70b-versatile',  // Very capable
        'mixtral-8x7b-32768'        // Good for longer context
    ];
    
    let lastError = null;
    
    for (const modelName of models) {
        try {
            console.log(`Trying Groq model: ${modelName}...`);
            console.log(`Prompt length: ${prompt.length} characters`);
            
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: modelName,
                temperature: 0.7,
                max_tokens: 1024,
            });
            
            const text = chatCompletion.choices[0]?.message?.content || '';
            
            console.log(`✅ Success with ${modelName} for ${feature}`);
            return text;
            
        } catch (error) {
            console.log(`❌ Failed with ${modelName}: ${error.message}`);
            lastError = error;
            
            // Check if it's a rate limit error
            if (error.message.includes('429') || 
                error.message.includes('rate limit')) {
                
                const waitSeconds = 60; // Default wait time
                throw new Error(`RATE_LIMIT:${waitSeconds}:${feature}`);
            }
            
            // Try next model on error
            if (modelName === models[models.length - 1]) {
                throw new Error(`AI_ERROR:${error.message}`);
            }
        }
    }
    
    // If all models failed
    throw lastError || new Error('All AI models failed');
};

// Execute chat request with messages array
const executeChatRequest = async (messages, feature) => {
    const apiKey = FEATURE_KEYS[feature] || FEATURE_KEYS.DEFAULT;
    
    if (!apiKey) {
        throw new Error('No API key configured for this feature');
    }
    
    console.log(`🔑 Using ${feature} chat with Groq AI`);
    
    // Initialize Groq client
    const groq = new Groq({ apiKey });
    
    // Try models in order
    const models = [
        'llama-3.3-70b-versatile',
        'llama-3.1-70b-versatile',
        'mixtral-8x7b-32768'
    ];
    
    let lastError = null;
    
    for (const modelName of models) {
        try {
            console.log(`Trying Groq chat model: ${modelName}...`);
            console.log(`Messages count: ${messages.length}`);
            
            const chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: modelName,
                temperature: 0.8,
                max_tokens: 512,
            });
            
            const text = chatCompletion.choices[0]?.message?.content || '';
            
            console.log(`✅ Success with ${modelName}`);
            return text;
            
        } catch (error) {
            console.log(`❌ Failed with ${modelName}: ${error.message}`);
            lastError = error;
            
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                const waitSeconds = 60;
                throw new Error(`RATE_LIMIT:${waitSeconds}:${feature}`);
            }
            
            if (modelName === models[models.length - 1]) {
                throw new Error(`AI_ERROR:${error.message}`);
            }
        }
    }
    
    throw lastError || new Error('All AI models failed');
};

export const generateResult = async (prompt, feature = 'DEFAULT') => {
    // Truncate prompt if too long
    if (prompt.length > MAX_PROMPT_LENGTH) {
        console.warn(`⚠️ Prompt truncated from ${prompt.length} to ${MAX_PROMPT_LENGTH} chars`);
        prompt = prompt.substring(0, MAX_PROMPT_LENGTH) + '\n...[truncated]';
    }
    
    return new Promise((resolve, reject) => {
        const queuePosition = featureQueues[feature].length + 1;
        
        if (queuePosition > 1) {
            console.log(`📋 ${feature} request queued at position ${queuePosition}`);
        }
        
        featureQueues[feature].push({
            prompt,
            resolve,
            reject: (error) => {
                if (error.message?.startsWith('RATE_LIMIT:')) {
                    const [_, seconds, feat] = error.message.split(':');
                    reject(new Error(`Rate limit hit for ${feat}. Please wait ${seconds} seconds and try again.`));
                } else if (error.message?.startsWith('AI_ERROR:')) {
                    const msg = error.message.replace('AI_ERROR:', '');
                    reject(new Error(`AI service error: ${msg}`));
                } else {
                    reject(error);
                }
            }
        });
        
        processQueue(feature);
    });
};

// New function for chat-based completions with conversation history
export const generateChatCompletion = async (conversationHistory, userMessage, systemPrompt, feature = 'DEFAULT') => {
    // Build messages array for Groq chat API
    const messages = [];
    
    // Add system message if provided
    if (systemPrompt) {
        messages.push({
            role: 'system',
            content: systemPrompt
        });
    }
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
    }
    
    // Add current user message
    messages.push({
        role: 'user',
        content: userMessage
    });
    
    console.log(`📝 Queueing chat with ${messages.length} messages for ${feature}`);
    
    // Use the queue system with messages instead of prompt
    return new Promise((resolve, reject) => {
        const queuePosition = featureQueues[feature].length + 1;
        
        if (queuePosition > 1) {
            console.log(`📋 ${feature} chat queued at position ${queuePosition}`);
        }
        
        featureQueues[feature].push({
            messages,  // Pass messages instead of prompt
            resolve,
            reject: (error) => {
                if (error.message?.startsWith('RATE_LIMIT:')) {
                    const [_, seconds, feat] = error.message.split(':');
                    reject(new Error(`Rate limit hit for ${feat}. Please wait ${seconds} seconds and try again.`));
                } else if (error.message?.startsWith('AI_ERROR:')) {
                    const msg = error.message.replace('AI_ERROR:', '');
                    reject(new Error(`AI service error: ${msg}`));
                } else {
                    reject(error);
                }
            }
        });
        
        processQueue(feature);
    });
};

/**
 * Generate structured JSON response for feedback
 */
export const generateJSONFeedback = async (prompt, feature = 'MOCK_INTERVIEW') => {
    const apiKey = FEATURE_KEYS[feature] || FEATURE_KEYS.DEFAULT;
    
    if (!apiKey) {
        throw new Error('No API key configured for this feature');
    }
    
    console.log(`🎯 Generating JSON feedback with ${feature}`);
    
    const groq = new Groq({ apiKey });
    
    try {
        // Use llama-3.3-70b-versatile with JSON mode
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical interview evaluator. Always respond with valid JSON only, no additional text or formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5, // Lower temperature for more consistent JSON
            max_tokens: 2048,
            response_format: { type: "json_object" } // Force JSON response
        });
        
        const jsonText = chatCompletion.choices[0]?.message?.content || '{}';
        console.log('✅ JSON feedback generated');
        
        // Parse and return
        return JSON.parse(jsonText);
        
    } catch (error) {
        console.error('❌ JSON feedback generation failed:', error.message);
        throw error;
    }
};
