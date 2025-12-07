import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { generateResult } from '../services/ai.services.js';

const router = Router();

router.get('/get-result', aiController.getResult);
router.post('/chat', aiController.chat);

export default router
