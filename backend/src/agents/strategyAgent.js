import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';

/**
 * Strategy Agent - Proposes reasoning strategies
 * 
 * Listens to: CONTEXT_READY
 * Emits: STRATEGY_READY, STRATEGY_ERROR
 */

export function register(eventBus) {
  logger.info('🎯 Strategy Agent: Registering listeners...');

  eventBus.on(EVENTS.CONTEXT_READY, async (payload) => {
    try {
      logger.info('🎯 Strategy Agent: Processing CONTEXT_READY', {
        sessionId: payload.sessionId,
      });

      // Generate strategy based on context
      const strategy = await generateStrategy(payload);

      // Emit STRATEGY_READY event
      eventBus.emit(EVENTS.STRATEGY_READY, {
        sessionId: payload.sessionId,
        userId: payload.userId,
        context: payload.context,
        strategy,
      });

      logger.info('🎯 Strategy Agent: Strategy generated successfully', {
        sessionId: payload.sessionId,
      });
    } catch (error) {
      logger.error('🎯 Strategy Agent: Error generating strategy', {
        sessionId: payload.sessionId,
        error: error.message,
      });

      eventBus.emit(EVENTS.STRATEGY_ERROR, {
        sessionId: payload.sessionId,
        error: error.message,
      });
    }
  });

  logger.info('🎯 Strategy Agent: Registration complete');
}

/**
 * Generate strategy based on context
 * @private
 */
async function generateStrategy(payload) {
  const { context, sessionId } = payload;

  // TODO: Use ML models to select optimal strategy
  // TODO: Consider chronotype, sound sensitivity, history
  // TODO: Apply reinforcement learning

  return {
    sessionId,
    type: 'binaural_beats',
    parameters: {
      baseFrequency: 200,
      beatFrequency: 10,
      duration: 1800, // 30 minutes
      rampDuration: 60,
    },
    rationale: 'Selected based on user chronotype and sensitivity',
    confidence: 0.85,
    timestamp: new Date(),
  };
}
