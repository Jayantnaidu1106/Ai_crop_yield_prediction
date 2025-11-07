import express from 'express';
import * as studyRoomController from '../controllers/studyroom.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a new study room
router.post('/create', authUser, studyRoomController.createStudyRoom);

// Get all public study rooms
router.get('/public', authUser, studyRoomController.getPublicStudyRooms);

// Get user's study rooms
router.get('/my-rooms', authUser, studyRoomController.getUserStudyRooms);

// Join a study room by code (private rooms)
router.post('/join', authUser, studyRoomController.joinStudyRoom);

// Join a study room by ID (public rooms or direct links)
router.post('/join/:id', authUser, studyRoomController.joinStudyRoomById);

// Get study room by ID
router.get('/:id', authUser, studyRoomController.getStudyRoomById);

// Remove participant (owner only)
router.post('/remove-participant', authUser, studyRoomController.removeParticipant);

// Leave study room
router.post('/leave', authUser, studyRoomController.leaveStudyRoom);

// Delete study room (owner only)
router.delete('/:id', authUser, studyRoomController.deleteStudyRoom);

export default router;
