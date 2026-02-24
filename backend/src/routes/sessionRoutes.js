import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middlewares/authMiddleware.js';
import {
  startSession,
  endSession,
  getSession,
  getUserSessions,
} from '../controllers/sessionController.js';
import wrapAsync from '../middlewares/wrapAsync.js';

const router = express.Router();

// Demo route without authentication (for testing)
router.post('/demo/start', wrapAsync(async (req, res) => {
  // Create a valid ObjectId for demo user
  req.user = { _id: new mongoose.Types.ObjectId() };
  await startSession(req, res);
}));

// All other session routes require authentication
router.use(protect);

// POST /api/sessions/start - Start a new session
router.post('/start', wrapAsync(startSession));

// POST /api/sessions/:sessionId/end - End a session
router.post('/:sessionId/end', wrapAsync(endSession));

// GET /api/sessions/:sessionId - Get session details
router.get('/:sessionId', wrapAsync(getSession));

// GET /api/sessions - Get user's sessions
router.get('/', wrapAsync(getUserSessions));

export default router;
