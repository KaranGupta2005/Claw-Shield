/**
 * Enforcement Bridge - The Gate
 * 
 * Listens for proposed plans and evaluates them through the Policy Engine
 * Acts as a security checkpoint between planning and execution
 * 
 * Listens to: PLAN_PROPOSED
 * Emits: PLAN_APPROVED, PLAN_BLOCKED
 */

import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';
import { evaluatePlan } from './policyEngine.js';

/**
 * Register Enforcement Bridge
 * @param {EventBus} eventBus - The event bus instance
 */
export function register(eventBus) {
  logger.info('⚖️  Enforcement Bridge: Registering listeners...');

  eventBus.on(EVENTS.PLAN_PROPOSED, async (payload) => {
    try {
      logger.info('⚖️  Enforcement Bridge: Evaluating proposed plan', {
        sessionId: payload.sessionId,
        intent: payload.context?.intent,
      });

      // Evaluate plan through Policy Engine
      const policyResult = evaluatePlan(
        payload.plan,
        payload.context,
        payload.strategy
      );

      if (policyResult.isAllowed()) {
        // Plan approved - emit for execution
        eventBus.emit(EVENTS.PLAN_APPROVED, {
          sessionId: payload.sessionId,
          userId: payload.userId,
          context: payload.context,
          strategy: payload.strategy,
          plan: payload.plan,
          policyResult: {
            allowed: true,
            warnings: policyResult.getWarnings(),
            timestamp: policyResult.timestamp,
          },
        });

        logger.info('⚖️  Enforcement Bridge: Plan APPROVED', {
          sessionId: payload.sessionId,
          warnings: policyResult.getWarnings().length,
        });
      } else {
        // Plan blocked - emit rejection
        eventBus.emit(EVENTS.PLAN_BLOCKED, {
          sessionId: payload.sessionId,
          userId: payload.userId,
          violations: policyResult.getViolations(),
          warnings: policyResult.getWarnings(),
          plan: payload.plan, // Include plan for logging
          context: payload.context,
          strategy: payload.strategy,
        });

        logger.warn('⚖️  Enforcement Bridge: Plan BLOCKED', {
          sessionId: payload.sessionId,
          violations: policyResult.getViolations().length,
          reasons: policyResult.getViolations().map(v => v.rule),
        });
      }
    } catch (error) {
      logger.error('⚖️  Enforcement Bridge: Error evaluating plan', {
        sessionId: payload.sessionId,
        error: error.message,
        stack: error.stack,
      });

      // Emit error event
      eventBus.emit(EVENTS.PLAN_ERROR, {
        sessionId: payload.sessionId,
        error: error.message,
      });
    }
  });

  logger.info('⚖️  Enforcement Bridge: Registration complete');
}
