import Interview from '../../../models/interview.model.js';

// POST /api/interview/session/start
export const startSession = async (req, res) => {
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

        // Provide Hume AI credentials for empathic voice interface
        const humeApiKey = process.env.HUME_API_KEY || '';
        const humeSecretKey = process.env.HUME_SECRET_KEY || '';

        if (!humeApiKey) {
            console.warn('HUME_API_KEY not configured. Voice AI features will be disabled.');
        }

        const response = {
            humeApiKey,
            humeSecretKey,
            interviewId,
            userId: req.user._id,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('startSession error:', error);
        return res.status(500).json({ error: 'Failed to start session' });
    }
};
