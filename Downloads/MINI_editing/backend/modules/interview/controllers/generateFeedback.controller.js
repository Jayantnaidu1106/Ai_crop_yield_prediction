import Interview from '../../../models/interview.model.js';
import InterviewTurn from '../../../models/interviewTurn.model.js';
import InterviewFeedback from '../../../models/interviewFeedback.model.js';
import { generateJSONFeedback } from '../../../services/ai.services.js';

// POST /api/interview/session/feedback
export const generateFeedback = async (req, res) => {
    try {
        const { interviewId } = req.body;

        if (!interviewId) {
            return res.status(400).json({ error: 'interviewId is required' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        if (interview.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized for this interview' });
        }

        const turns = await InterviewTurn.find({ interviewId }).sort({ createdAt: 1 });

        if (!turns.length) {
            return res.status(400).json({ error: 'No turns found for this interview' });
        }

        // Get all user responses for analysis
        const userResponses = turns.filter(t => t.speaker === 'user');
        const aiQuestions = turns.filter(t => t.speaker === 'ai');
        
        // Build conversation transcript
        let transcript = turns.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n\n');
        
        // Truncate if too long (keep most recent)
        if (transcript.length > 2500) {
            const words = transcript.split(' ');
            transcript = '...[earlier conversation truncated]\n\n' + words.slice(-400).join(' ');
        }

        // Enhanced prompt for comprehensive feedback - FORCE JSON OUTPUT
        const prompt = `Analyze this technical interview and return ONLY a JSON object (no markdown, no explanation).

TRANSCRIPT:
${transcript}

Return this exact JSON structure with your analysis:
{
  "summary": "2-3 sentence overall performance assessment",
  "rating": 7,
  "overallImpression": "One paragraph with overall impression and hiring recommendation",
  "metrics": {
    "technicalKnowledge": {"score": 7, "feedback": "Technical depth assessment"},
    "communicationSkills": {"score": 6, "feedback": "Communication clarity evaluation"},
    "problemSolvingApproach": {"score": 7, "feedback": "Problem-solving analysis"},
    "confidence": {"score": 6, "feedback": "Confidence level based on language (assertive vs hedging)"},
    "clarityOfAnswers": {"score": 6, "feedback": "Answer structure and clarity"},
    "depthOfKnowledge": {"score": 7, "feedback": "Deep vs surface-level understanding"}
  },
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "weaknesses": ["Specific area to improve 1", "Specific area to improve 2"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}

CRITICAL: Return ONLY the JSON object above, with your analysis replacing the placeholder values. No text before or after the JSON.`;

        console.log('🎯 Generating comprehensive feedback...');
        
        // Use specialized JSON feedback function
        let feedbackJson;
        try {
            feedbackJson = await generateJSONFeedback(prompt, 'MOCK_INTERVIEW');
            console.log('✅ Successfully generated JSON feedback');
        } catch (jsonErr) {
            console.error('❌ JSON generation failed:', jsonErr.message);
            
            // Fallback: Create basic feedback
            feedbackJson = {
                summary: "The interview was completed. Detailed analysis is being processed.",
                rating: 6,
                overallImpression: "Your interview has been recorded. Please try requesting feedback again for a detailed evaluation.",
                metrics: {
                    technicalKnowledge: { score: 6, feedback: "Assessment in progress" },
                    communicationSkills: { score: 6, feedback: "Assessment in progress" },
                    problemSolvingApproach: { score: 6, feedback: "Assessment in progress" },
                    confidence: { score: 6, feedback: "Assessment in progress" },
                    clarityOfAnswers: { score: 6, feedback: "Assessment in progress" },
                    depthOfKnowledge: { score: 6, feedback: "Assessment in progress" }
                },
                strengths: ["Completed the interview", "Engaged with the questions"],
                weaknesses: ["Detailed analysis pending"],
                recommendations: ["Please request feedback again for complete evaluation"]
            };
        }

        // Ensure arrays are properly formatted
        const strengths = Array.isArray(feedbackJson.strengths) 
            ? feedbackJson.strengths 
            : (feedbackJson.strengths ? [feedbackJson.strengths] : []);
            
        const weaknesses = Array.isArray(feedbackJson.weaknesses)
            ? feedbackJson.weaknesses
            : (feedbackJson.weaknesses ? [feedbackJson.weaknesses] : []);
            
        const recommendations = Array.isArray(feedbackJson.recommendations)
            ? feedbackJson.recommendations
            : (feedbackJson.recommendations ? [feedbackJson.recommendations] : []);

        // Upsert feedback
        const feedback = await InterviewFeedback.findOneAndUpdate(
            { interviewId },
            {
                summary: feedbackJson.summary,
                strengths,
                weaknesses,
                rating: feedbackJson.rating,
                metrics: feedbackJson.metrics || {},
                recommendations,
                overallImpression: feedbackJson.overallImpression
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        interview.status = 'completed';
        await interview.save();

        console.log('✅ Comprehensive feedback generated');
        return res.status(200).json({ feedback });
    } catch (error) {
        console.error('generateFeedback error:', error);
        return res.status(500).json({ error: 'Failed to generate feedback' });
    }
};
