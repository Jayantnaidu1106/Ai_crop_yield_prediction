import { Router } from 'express';
import { body } from 'express-validator';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

/**
 * POST /auth/register
 * Register a new user account
 * Body: { email, password, name (optional) }
 * Returns: { token, user }
 */
router.post('/register',
    [
        body('email').isEmail().withMessage('Email is not valid'),
        body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
        body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    ],
    userController.createUserController
);

/**
 * POST /auth/login
 * Login with email and password
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post('/login',
    [
        body('email').isEmail().withMessage('Email is not valid'),
        body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters')
    ],
    userController.loginController
);

/**
 * GET /auth/me
 * Get current authenticated user
 * Headers: Authorization: Bearer <token>
 * Returns: { user }
 */
router.get('/me', authMiddleware.authUser, userController.profileController);

/**
 * GET /auth/logout
 * Logout current user (blacklist token)
 * Headers: Authorization: Bearer <token>
 * Returns: { message }
 */
router.get('/logout', authMiddleware.authUser, userController.logoutController);

export default router;
