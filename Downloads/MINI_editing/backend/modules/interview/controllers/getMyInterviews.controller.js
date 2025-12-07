import Interview from '../../../models/interview.model.js';

// GET /api/interview/my
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ interviews });
    } catch (error) {
        console.error('getMyInterviews error:', error);
        return res.status(500).json({ error: 'Failed to fetch interviews' });
    }
};
