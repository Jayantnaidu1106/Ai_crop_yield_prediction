import {Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Create a new project
router.post('/create',
    [body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters')],
    authMiddleware.authUser,
    projectController.createProject);

// Get user's projects
router.get('/all', authMiddleware.authUser, projectController.getAllProjects);

// Get all public projects
router.get('/public', authMiddleware.authUser, projectController.getPublicProjects);

// Get project by ID
router.get('/get-project/:projectId',
     authMiddleware.authUser, projectController.getProjectById);

// Join project by code (for private projects)
router.post('/join-by-code', authMiddleware.authUser, projectController.joinProjectByCode);

// Join project by ID (for public projects or direct links)
router.post('/join/:id', authMiddleware.authUser, projectController.joinProjectById);

// Add user to project (legacy - for backward compatibility)
router.put('/add-user', authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({min:1}).withMessage('At least one user is required').bail().custom((users)=>users.every(user=>typeof user === 'string')).withMessage('Users must be an array of strings'),
    projectController.addUserToProject);

// Remove user from project (owner only)
router.post('/remove-user', authMiddleware.authUser, projectController.removeUserFromProject);

// Leave project
router.post('/leave', authMiddleware.authUser, projectController.leaveProject);

// Delete project (owner only)
router.delete('/:id', authMiddleware.authUser, projectController.deleteProject);

export default router;