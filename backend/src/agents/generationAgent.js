/**
 * Generation Agent - Planning Layer
 * 
 * Bridge between reasoning (Strategy) and action (Execution)
 * Transforms behavioral intent into structured action plans
 * 
 * This agent is the boundary between cognitive agents and ML layer
 * It proposes plans but does not execute or enforce them
 * 
 * Listens to: STRATEGY_READY
 * Emits: PLAN_PROPOSED, PLAN_ERROR
 */

import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';
import { generatePlan, validatePlan } from '../ml/planners/planGenerator.js';

/**
 * Register Generation Agent
 * @param {EventBus} eventBus - The event bus instance
 */
export function register(eventBus) {
  logger.info('🎨 Generation Agent: Registering listeners...');

  eventBus.on(EVENTS.STRATEGY_READY, async (payload) => {
    try {
      logger.info('🎨 Generation Agent: Processing STRATEGY_READY', {
        sessionId: payload.sessionId,
        strategyType: payload.strategy?.type,
      });

      // Call ML planner to generate plan
      const plan = await generatePlan(payload.context, payload.strategy);

      // Validate plan (sanity check, not enforcement)
      const validation = validatePlan(plan);
      if (!validation.valid) {
        logger.warn('🎨 Generation Agent: Plan validation warnings', {
          sessionId: payload.sessionId,
          errors: validation.errors,
        });
      }

      // Emit PLAN_PROPOSED event with extended payload
      eventBus.emit(EVENTS.PLAN_PROPOSED, {
        sessionId: payload.sessionId,
        userId: payload.userId,
        context: payload.context,
        strategy: payload.strategy,
        plan, // New field added to payload
      });

      logger.info('🎨 Generation Agent: Plan proposed', {
        sessionId: payload.sessionId,
        planType: plan.type,
        beatFrequency: plan.parameters.beatFrequency,
        confidence: plan.confidence,
      });
    } catch (error) {
      logger.error('🎨 Generation Agent: Error generating plan', {
        sessionId: payload.sessionId,
        error: error.message,
        stack: error.stack,
      });

      eventBus.emit(EVENTS.PLAN_ERROR, {
        sessionId: payload.sessionId,
        error: error.message,
      });
    }
  });

  logger.info('🎨 Generation Agent: Registration complete');
}
