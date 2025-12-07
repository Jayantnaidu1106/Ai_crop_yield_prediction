import { Router } from 'express';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';
import { createInterview } from '../controllers/createInterview.controller.js';
import { generateQuestions } from '../controllers/generateQuestions.controller.js';
import { startSession } from '../controllers/startSession.controller.js';
import { saveTurn } from '../controllers/saveTurn.controller.js';
import { generateFeedback } from '../controllers/generateFeedback.controller.js';
import { getMyInterviews } from '../controllers/getMyInterviews.controller.js';
import { getFeedback } from '../controllers/getFeedback.controller.js';

const router = Router();

/**
 * Interview Module Routes
 * All routes are protected with JWT authentication
 * 
 * Future endpoints:
 * - POST /interview/start - Start AI mock interview
 * - POST /interview/:id/answer - Submit answer to interview question
 * - GET /interview/:id - Get interview session details
 * - POST /interview/:id/end - End interview and get feedback
 * - GET /interview/history - Get user's interview history
 */

// Placeholder endpoint
router.get('/health', authMiddleware.authUser, (req, res) => {
    res.json({
        module: 'interview',
        status: 'ready',
        message: 'Interview module is ready for implementation',
        user: req.user.email
    });
});

// Create interview
router.post('/create', authMiddleware.authUser, createInterview);

// Generate questions
router.post('/generate-questions', authMiddleware.authUser, generateQuestions);

// Start session (Akool placeholders)
router.post('/session/start', authMiddleware.authUser, startSession);

// Save turn
router.post('/session/turn', authMiddleware.authUser, saveTurn);

// Generate feedback
router.post('/session/feedback', authMiddleware.authUser, generateFeedback);

// Get feedback
router.get('/feedback/:id', authMiddleware.authUser, getFeedback);

// Get my interviews
router.get('/my', authMiddleware.authUser, getMyInterviews);

export default router;
