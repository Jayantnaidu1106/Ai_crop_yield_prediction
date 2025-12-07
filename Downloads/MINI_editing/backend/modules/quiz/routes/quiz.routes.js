import { Router } from 'express';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';

const router = Router();

/**
 * Quiz Module Routes
 * All routes are protected with JWT authentication
 * 
 * Future endpoints:
 * - POST /quiz/generate - Generate quiz from PDF using RAG
 * - GET /quiz/:id - Get quiz by ID
 * - POST /quiz/:id/submit - Submit quiz answers
 * - GET /quiz/history - Get user's quiz history
 */

// Placeholder endpoint
router.get('/health', authMiddleware.authUser, (req, res) => {
    res.json({
        module: 'quiz',
        status: 'ready',
        message: 'Quiz module is ready for implementation',
        user: req.user.email
    });
});

export default router;
