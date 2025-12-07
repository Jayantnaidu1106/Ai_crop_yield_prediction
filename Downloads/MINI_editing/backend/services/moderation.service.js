// Content moderation service for study rooms
// AI-powered content moderation using Groq

import Groq from 'groq-sdk';
import User from '../models/user.models.js';

// Process warning for a user (works for both projects and study rooms)
export const processWarning = async (room, userId) => {
    try {
        // Ensure userId is a string for consistent comparison
        const userIdStr = userId?.toString() || userId;
        
        // Get current warning count
        const warningCount = room.warningCount.get(userIdStr) || 0;
        const newWarningCount = warningCount + 1;

        // Update warning count
        room.warningCount.set(userIdStr, newWarningCount);

        // If user has 3 warnings, remove them
        if (newWarningCount >= 3) {
            // Check if it's a project or study room
            const isProject = room.users !== undefined;
            
            if(isProject){
                // Remove from project users array
                room.users = room.users.filter(
                    u => u.toString() !== userIdStr
                );
            } else {
                // Remove from study room participants
                room.participants = room.participants.filter(
                    p => p.user.toString() !== userIdStr
                );
            }

            // Add to removed users (store as ObjectId if possible, otherwise as string)
            room.removedUsers.push({
                user: userId, // Store original userId (could be ObjectId or string)
                removedAt: new Date(),
                removedBy: room.owner,
                reason: 'Automatic removal due to inappropriate content (3 warnings)'
            });

            await room.save();
            return { removed: true, warningCount: newWarningCount };
        }

        await room.save();
        return { removed: false, warningCount: newWarningCount };
    } catch (error) {
        console.error('Process warning error:', error);
        throw error;
    }
};

// Get warning count for a user
export const getWarningCount = (room, userId) => {
    return room.warningCount.get(userId.toString()) || 0;
};

// Reset warnings for a user (owner only)
export const resetWarnings = async (room, userId) => {
    try {
        room.warningCount.delete(userId.toString());
        await room.save();
        return true;
    } catch (error) {
        console.error('Reset warnings error:', error);
        return false;
    }
};

// AI-powered content moderation using Groq
export const aiModerateContent = async (message) => {
    // Skip AI moderation if message is too short or doesn't have API key
    if (!process.env.GROQ_API_KEY || message.length < 5) {
        return { inappropriate: false, reason: 'too_short' };
    }

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `You are a content moderator. Analyze if this message contains SEVERE inappropriate content.

ONLY flag as INAPPROPRIATE if it contains:
- Hate speech, racism, sexism
- Explicit threats or violence
- Sexual/pornographic content
- Severe bullying or harassment
- Dangerous self-harm content

DO NOT flag as inappropriate:
- Normal conversation, greetings, questions
- Mild frustration or disagreement
- Educational discussions
- Programming or technical content

Message: "${message}"

Respond ONLY with one word: either "APPROPRIATE" or "INAPPROPRIATE"`;

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1, // Very low for consistent moderation
            max_tokens: 10,
        });

        const result = response.choices[0]?.message?.content?.trim().toUpperCase() || 'APPROPRIATE';
        const isInappropriate = result.includes('INAPPROPRIATE');

        return {
            inappropriate: isInappropriate,
            reason: isInappropriate ? 'AI detected inappropriate content' : 'content is appropriate',
            confidence: isInappropriate ? 'high' : 'low'
        };

    } catch (error) {
        console.error('AI moderation error:', error);
        // Fallback: Don't flag if AI fails (innocent until proven guilty)
        return { inappropriate: false, reason: 'ai_error' };
    }
};
