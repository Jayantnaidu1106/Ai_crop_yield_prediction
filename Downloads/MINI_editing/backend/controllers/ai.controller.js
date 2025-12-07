import * as ai from '../services/ai.services.js';
import * as hume from '../services/hume.services.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        const result = await ai.generateResult(prompt);
        res.send(result);
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const chat = async (req, res) => {
    try {
        const { message, systemPrompt, conversationHistory, useHume } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let result;

        // Use Hume AI for mock interviews (more natural, empathetic responses)
        if (useHume) {
            console.log('🎭 Using Hume AI for interview conversation');
            result = await hume.generateInterviewResponse(
                conversationHistory || [],
                message,
                systemPrompt
            );
        } else {
            // Use Groq for other features
            console.log('🤖 Using Groq AI for chat');
            result = await ai.generateChatCompletion(
                conversationHistory || [],
                message,
                systemPrompt,
                'MOCK_INTERVIEW'
            );
        }
        
        res.json({ response: result.trim() });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate response'
        });
    }
}