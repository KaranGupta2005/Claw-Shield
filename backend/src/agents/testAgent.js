import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';

/**
 * Test Agent - Validates EventBus functionality
 * 
 * This agent listens to all events and logs them for debugging.
 * Enable with TEST_AGENT=true environment variable.
 */

const enabled = process.env.TEST_AGENT === 'true';

export function register(eventBus) {
  if (!enabled) {
    logger.info('🧪 Test Agent: Disabled (set TEST_AGENT=true to enable)');
    return;
  }

  logger.info('🧪 Test Agent: Registering listeners...');

  // Listen to all session events
  eventBus.on(EVENTS.SESSION_STARTED, (payload) => {
    logger.info('🧪 Test Agent received SESSION_STARTED', {
      sessionId: payload.sessionId,
      userId: payload.userId,
    });
  });

  eventBus.on(EVENTS.SESSION_ENDED, (payload) => {
    logger.info('🧪 Test Agent received SESSION_ENDED', {
      sessionId: payload.sessionId,
    });
  });

  // Listen to context events
  eventBus.on(EVENTS.CONTEXT_READY, (payload) => {
    logger.info('🧪 Test Agent received CONTEXT_READY', {
      sessionId: payload.sessionId,
    });
  });

  // Listen to strategy events
  eventBus.on(EVENTS.STRATEGY_READY, (payload) => {
    logger.info('🧪 Test Agent received STRATEGY_READY', {
      sessionId: payload.sessionId,
    });
  });

  // Listen to plan events
  eventBus.on(EVENTS.PLAN_PROPOSED, (payload) => {
    logger.info('🧪 Test Agent received PLAN_PROPOSED', {
      sessionId: payload.sessionId,
    });
  });

  eventBus.on(EVENTS.PLAN_APPROVED, (payload) => {
    logger.info('🧪 Test Agent received PLAN_APPROVED', {
      sessionId: payload.sessionId,
    });
  });

  // Listen to wildcard for all events
  eventBus.on('*', ({ eventName, payload }) => {
    logger.debug(`🧪 Test Agent wildcard: ${eventName}`, {
      sessionId: payload.sessionId || 'N/A',
    });
  });

  logger.info('🧪 Test Agent: Registration complete');
}
