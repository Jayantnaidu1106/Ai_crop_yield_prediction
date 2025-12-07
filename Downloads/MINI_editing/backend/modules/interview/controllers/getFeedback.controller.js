import Interview from '../../../models/interview.model.js';
import InterviewFeedback from '../../../models/interviewFeedback.model.js';

// GET /api/interview/feedback/:id
export const getFeedback = async (req, res) => {
    try {
        const { id: interviewId } = req.params;

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

        const feedback = await InterviewFeedback.findOne({ interviewId });
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        return res.status(200).json({ feedback });
    } catch (error) {
        console.error('getFeedback error:', error);
        return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};
