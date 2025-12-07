import express from 'express';
import { authUser } from '../middlewares/auth.middleware.js';
import Message from '../models/message.model.js';
import projectModel from '../models/project.model.js';
import StudyRoom from '../models/studyroom.model.js';

const router = express.Router();

// Get messages for a project or study room
router.get('/:projectId', authUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id || req.user.userId || req.user.id;

        // Try to find as project first (backward compatibility)
        let project = await projectModel.findById(projectId);
        let hasAccess = false;

        if (project) {
            // Check project access
            const isOwner = project.owner.toString() === userId.toString();
            const isParticipant = project.users.some(u => u.toString() === userId.toString());
            hasAccess = isOwner || isParticipant;
        } else {
            // Try as study room
            const studyRoom = await StudyRoom.findById(projectId);
            if (studyRoom) {
                // Check study room access
                hasAccess = studyRoom.isOwner(userId) || studyRoom.isParticipant(userId);
            }
        }

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get messages that are not deleted for this user
        const messages = await Message.find({
            project: projectId,
            deletedForEveryone: false,
            deletedBy: { $ne: userId }
        })
        .populate('sender', 'email name')
        .sort({ timestamp: 1 })
        .limit(500); // Limit to last 500 messages

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get whiteboard state
router.get('/whiteboard/:projectId', authUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ whiteboardState: project.whiteboardState || '' });
    } catch (error) {
        console.error('Get whiteboard error:', error);
        res.status(500).json({ error: 'Failed to fetch whiteboard state' });
    }
});

export default router;
