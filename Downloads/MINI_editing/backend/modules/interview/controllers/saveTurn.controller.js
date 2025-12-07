import Interview from '../../../models/interview.model.js';
import InterviewTurn from '../../../models/interviewTurn.model.js';

// POST /api/interview/session/turn
export const saveTurn = async (req, res) => {
    try {
        const { interviewId, speaker, text } = req.body;

        if (!interviewId || !speaker || !text) {
            return res.status(400).json({ error: 'interviewId, speaker, and text are required' });
        }

        if (!['user', 'ai'].includes(speaker)) {
            return res.status(400).json({ error: 'speaker must be user or ai' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        if (interview.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized for this interview' });
        }

        const turn = await InterviewTurn.create({
            interviewId,
            speaker,
            text
        });

        return res.status(201).json({ turn });
    } catch (error) {
        console.error('saveTurn error:', error);
        return res.status(500).json({ error: 'Failed to save turn' });
    }
};
