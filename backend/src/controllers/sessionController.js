import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';
import Session from '../models/Session.js';
import ExpressError from '../middlewares/expressError.js';

/**
 * Session Controller - Translates HTTP requests into system events
 * 
 * Controllers are thin - they only emit events, never call agents directly
 */

export const startSession = async (req, res, next) => {
  const { eventBus } = req.app.locals;
  const userId = req.user._id;
  const { preferences } = req.body;

  // Create session in database
  const session = new Session({
    userId,
    status: 'active',
    preferences: preferences || {},
    startedAt: new Date(),
  });

  await session.save();

  logger.info('📍 Session Controller: Session created', {
    sessionId: session._id,
    userId,
  });

  // Emit SESSION_STARTED event (agents will react)
  eventBus.emit(EVENTS.SESSION_STARTED, {
    sessionId: session._id.toString(),
    userId: userId.toString(),
    preferences: session.preferences,
  });

  // Return immediately - agents process asynchronously
  res.status(201).json({
    success: true,
    message: 'Session started',
    session: {
      id: session._id,
      status: session.status,
      startedAt: session.startedAt,
    },
  });
};

export const endSession = async (req, res, next) => {
  const { eventBus } = req.app.locals;
  const { sessionId } = req.params;
  const userId = req.user._id;

  // Update session in database
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, userId },
    { status: 'ended', endedAt: new Date() },
    { new: true }
  );

  if (!session) {
    throw new ExpressError(404, 'Session not found');
  }

  logger.info('📍 Session Controller: Session ended', {
    sessionId,
    userId,
  });

  // Emit SESSION_ENDED event
  eventBus.emit(EVENTS.SESSION_ENDED, {
    sessionId: sessionId.toString(),
    userId: userId.toString(),
  });

  res.json({
    success: true,
    message: 'Session ended',
    session: {
      id: session._id,
      status: session.status,
      endedAt: session.endedAt,
    },
  });
};

export const getSession = async (req, res, next) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await Session.findOne({ _id: sessionId, userId });

  if (!session) {
    throw new ExpressError(404, 'Session not found');
  }

  res.json({
    success: true,
    session,
  });
};

export const getUserSessions = async (req, res, next) => {
  const userId = req.user._id;
  const { limit = 10, skip = 0 } = req.query;

  const sessions = await Session.find({ userId })
    .sort({ startedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Session.countDocuments({ userId });

  res.json({
    success: true,
    sessions,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    },
  });
};
