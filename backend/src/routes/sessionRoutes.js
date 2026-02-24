import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  startSession,
  endSession,
  getSession,
  getUserSessions,
} from '../controllers/sessionController.js';

const router = express.Router();

// All session routes require authentication
router.use(protect);

// POST /api/sessions/start - Start a new session
router.post('/start', startSession);

// POST /api/sessions/:sessionId/end - End a session
router.post('/:sessionId/end', endSession);

// GET /api/sessions/:sessionId - Get session details
router.get('/:sessionId', getSession);

// GET /api/sessions - Get user's sessions
router.get('/', getUserSessions);

export default router;
