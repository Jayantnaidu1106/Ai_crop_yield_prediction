import Interview from '../../../models/interview.model.js';
import { generateResult } from '../../../services/ai.services.js';

// POST /api/interview/generate-questions
export const generateQuestions = async (req, res) => {
    try {
        const { interviewId, resumeText, jobDescription } = req.body;

        if (!interviewId) {
            return res.status(400).json({ error: 'interviewId is required' });
        }

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        // Build prompt content - TRUNCATE to save tokens
        const sourceText = resumeText || jobDescription || interview.jobDescription;
        if (!sourceText) {
            return res.status(400).json({ error: 'resumeText or jobDescription is required' });
        }

        // Extract key info and truncate to max 500 characters to save tokens
        const truncatedText = sourceText.length > 500 
            ? sourceText.substring(0, 500) + '...[truncated]'
            : sourceText;

        // Concise prompt - no verbose instructions
        const prompt = `Generate 5-8 interview questions for this role. Return only numbered list:

${truncatedText}`;

        const aiResponse = await generateResult(prompt, 'MOCK_INTERVIEW');

        // Parse questions: split by lines, keep non-empty
        const questions = aiResponse
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean)
            .slice(0, 8);

        // Save to interview
        interview.questions = questions;
        interview.status = 'ready';
        await interview.save();

        return res.status(200).json({ questions });
    } catch (error) {
        console.error('generateQuestions error:', error);
        return res.status(500).json({ error: 'Failed to generate questions' });
    }
};
