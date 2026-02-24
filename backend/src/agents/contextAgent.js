import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';

/**
 * Context Agent - Prepares context for reasoning
 * 
 * Listens to: SESSION_STARTED
 * Emits: CONTEXT_READY, CONTEXT_ERROR
 */

export function register(eventBus) {
  logger.info('🧠 Context Agent: Registering listeners...');

  eventBus.on(EVENTS.SESSION_STARTED, async (payload) => {
    try {
      logger.info('🧠 Context Agent: Processing SESSION_STARTED', {
        sessionId: payload.sessionId,
      });

      // Prepare context based on user preferences and session data
      const context = await prepareContext(payload);

      // Emit CONTEXT_READY event
      eventBus.emit(EVENTS.CONTEXT_READY, {
        sessionId: payload.sessionId,
        userId: payload.userId,
        context,
      });

      logger.info('🧠 Context Agent: Context prepared successfully', {
        sessionId: payload.sessionId,
      });
    } catch (error) {
      logger.error('🧠 Context Agent: Error preparing context', {
        sessionId: payload.sessionId,
        error: error.message,
      });

      eventBus.emit(EVENTS.CONTEXT_ERROR, {
        sessionId: payload.sessionId,
        error: error.message,
      });
    }
  });

  logger.info('🧠 Context Agent: Registration complete');
}

/**
 * Prepare context for the session
 * @private
 */
async function prepareContext(payload) {
  const { userId, preferences, sessionId } = payload;

  // TODO: Fetch user data, preferences, history
  // TODO: Analyze chronotype and sound sensitivity
  // TODO: Retrieve relevant memory

  return {
    userId,
    sessionId,
    chronotype: preferences?.chronotype || 'neutral',
    soundSensitivity: preferences?.soundSensitivity || 5,
    timestamp: new Date(),
    // Placeholder for future context data
    userHistory: [],
    environmentalFactors: {},
  };
}
