/**
 * Agent Socket - Real-time agent activity broadcasting
 * 
 * Broadcasts agent activities to connected clients for live monitoring
 */

import logger from '../core/logger.js';
import { EVENTS } from '../constants/index.js';

/**
 * Setup agent socket listeners
 * Broadcasts agent activities to all connected clients
 */
export function setupAgentSocket(io, eventBus) {
  logger.info('🔌 Setting up Agent Socket listeners...');

  // Broadcast Context Agent activities
  eventBus.on(EVENTS.CONTEXT_READY, (payload) => {
    io.emit('agent:activity', {
      agent: 'ContextAgent',
      type: 'context',
      message: `Analyzed environment: ${payload.context.location.primary} at ${payload.context.temporal.timeOfDay}`,
      data: {
        location: payload.context.location.primary,
        timeOfDay: payload.context.temporal.timeOfDay,
        alertness: `${(payload.context.cognitiveState.alertness * 100).toFixed(0)}%`,
        noiseLevel: `${(payload.context.environmental.noiseLevel * 100).toFixed(0)}%`,
      },
    });
  });

  // Broadcast Strategy Agent activities
  eventBus.on(EVENTS.STRATEGY_READY, (payload) => {
    io.emit('agent:activity', {
      agent: 'StrategyAgent',
      type: 'strategy',
      message: `Selected strategy: ${payload.strategy.type} (${(payload.strategy.intensity * 100).toFixed(0)}% intensity) - ${payload.strategy.rationale}`,
      data: {
        strategyType: payload.strategy.type,
        intensity: payload.strategy.intensity,
        rationale: payload.strategy.rationale,
      },
    });
  });

  // Broadcast Generation Agent activities
  eventBus.on(EVENTS.PLAN_PROPOSED, (payload) => {
    io.emit('agent:activity', {
      agent: 'GenerationAgent',
      type: 'plan',
      message: `Generated plan: ${payload.plan.parameters.beatFrequency.toFixed(2)}Hz beat, ${payload.plan.parameters.carrierFrequency.toFixed(1)}Hz carrier, ${payload.plan.parameters.band} band`,
      data: {
        beatFrequency: payload.plan.parameters.beatFrequency,
        carrierFrequency: payload.plan.parameters.carrierFrequency,
        volume: payload.plan.parameters.volume,
        band: payload.plan.parameters.band,
      },
    });
  });

  // Broadcast Enforcement decisions
  eventBus.on(EVENTS.PLAN_APPROVED, (payload) => {
    io.emit('agent:activity', {
      agent: 'EnforcementBridge',
      type: 'approved',
      message: `Plan APPROVED - All safety checks passed`,
      data: {
        beatFrequency: payload.plan.parameters.beatFrequency.toFixed(2),
        carrierFrequency: payload.plan.parameters.carrierFrequency.toFixed(1),
        warnings: payload.policyResult.warnings.length,
      },
    });
  });

  eventBus.on(EVENTS.PLAN_BLOCKED, (payload) => {
    io.emit('agent:activity', {
      agent: 'EnforcementBridge',
      type: 'blocked',
      message: `Plan BLOCKED - ${payload.violations.length} policy violation(s) detected`,
      data: {
        reason: payload.violations[0]?.message || 'Policy violation',
        violations: payload.violations.map(v => v.message),
      },
    });
  });

  // Broadcast errors
  eventBus.on(EVENTS.CONTEXT_ERROR, (payload) => {
    io.emit('agent:activity', {
      agent: 'ContextAgent',
      type: 'error',
      message: `Error: ${payload.error}`,
      data: {},
    });
  });

  eventBus.on(EVENTS.STRATEGY_ERROR, (payload) => {
    io.emit('agent:activity', {
      agent: 'StrategyAgent',
      type: 'error',
      message: `Error: ${payload.error}`,
      data: {},
    });
  });

  eventBus.on(EVENTS.PLAN_ERROR, (payload) => {
    io.emit('agent:activity', {
      agent: 'GenerationAgent',
      type: 'error',
      message: `Error: ${payload.error}`,
      data: {},
    });
  });

  logger.info('✅ Agent Socket listeners configured');
}
