import Interview from '../../../models/interview.model.js';

// POST /api/interview/create
export const createInterview = async (req, res) => {
    try {
        const { title, jobRole, sourceType, jobDescription, resumeUrl } = req.body;

        if (!title || !sourceType) {
            return res.status(400).json({ error: 'title and sourceType are required' });
        }

        const interview = await Interview.create({
            userId: req.user._id,
            title,
            jobRole,
            sourceType,
            jobDescription,
            resumeUrl,
            status: 'pending'
        });

        return res.status(201).json({ interview });
    } catch (error) {
        console.error('createInterview error:', error);
        return res.status(500).json({ error: 'Failed to create interview' });
    }
};
