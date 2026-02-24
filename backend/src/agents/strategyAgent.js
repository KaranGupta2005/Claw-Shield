import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';

/**
 * Strategy Agent - High-Level Reasoning Layer
 * 
 * Transforms "what is happening" (context) into "how we should respond" (strategy)
 * 
 * This is the cognitive layer between perception and generation.
 * Uses deterministic, rule-based reasoning for interpretability and speed.
 * 
 * Listens to: CONTEXT_READY
 * Emits: STRATEGY_READY, STRATEGY_ERROR
 */

// Strategy types - behavioral patterns, not technical outputs
const STRATEGIES = {
  SLEEP_PREPARE: 'sleep_prepare',
  DEEP_FOCUS: 'deep_focus',
  GENTLE_FOCUS: 'gentle_focus',
  CREATIVE_FLOW: 'creative_flow',
  STABILIZE: 'stabilize',
  COOLDOWN: 'cooldown',
  ENERGIZE: 'energize',
  MEDITATION: 'meditation',
};

export function register(eventBus) {
  logger.info('🎯 Strategy Agent: Registering listeners...');

  eventBus.on(EVENTS.CONTEXT_READY, async (payload) => {
    try {
      logger.info('🎯 Strategy Agent: Processing CONTEXT_READY', {
        sessionId: payload.sessionId,
        intent: payload.context?.intent,
        location: payload.context?.location?.primary,
      });

      // Select strategy based on context
      const strategy = selectStrategy(payload.context);

      // Emit STRATEGY_READY event with extended payload
      eventBus.emit(EVENTS.STRATEGY_READY, {
        sessionId: payload.sessionId,
        userId: payload.userId,
        context: payload.context,
        strategy,
      });

      logger.info('🎯 Strategy Agent: Strategy selected', {
        sessionId: payload.sessionId,
        strategyType: strategy.type,
        intensity: strategy.intensity,
        confidence: strategy.confidence,
      });
    } catch (error) {
      logger.error('🎯 Strategy Agent: Error selecting strategy', {
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
 * Select strategy using rule-based reasoning
 * 
 * Priority order:
 * 1. User intent (explicit goal)
 * 2. Safety considerations (time, sensitivity)
 * 3. Environmental context
 * 4. Cognitive state
 * 
 * @private
 */
function selectStrategy(context) {
  const {
    intent,
    temporal,
    location,
    userTraits,
    environmental,
    cognitiveState,
  } = context;

  // Rule 1: Sleep intent overrides everything
  if (intent === 'sleep' || intent === 'rest') {
    return buildStrategy(
      STRATEGIES.SLEEP_PREPARE,
      0.3, // Very low intensity
      'User explicitly requested sleep preparation',
      ['gentle', 'calming', 'gradual_reduction']
    );
  }

  // Rule 2: Meditation intent
  if (intent === 'meditation' || intent === 'mindfulness') {
    return buildStrategy(
      STRATEGIES.MEDITATION,
      0.4,
      'User requested meditation support',
      ['centered', 'grounding', 'present']
    );
  }

  // Rule 3: Late night sessions should be calmer
  if (temporal.timeOfDay === 'late_night') {
    if (intent === 'focus' || intent === 'deep_focus') {
      return buildStrategy(
        STRATEGIES.GENTLE_FOCUS,
        0.5,
        'Late night focus requires gentler stimulation',
        ['calm', 'sustained', 'non_disruptive']
      );
    }
    return buildStrategy(
      STRATEGIES.COOLDOWN,
      0.4,
      'Late night activity should promote wind-down',
      ['relaxing', 'calming', 'sleep_friendly']
    );
  }
  
  // Rule 3b: Night sessions (but not late night) can still be gentle for focus
  if (temporal.timeOfDay === 'night' && (intent === 'focus' || intent === 'deep_focus')) {
    return buildStrategy(
      STRATEGIES.GENTLE_FOCUS,
      0.5,
      'Night focus requires gentler stimulation',
      ['calm', 'sustained', 'non_disruptive']
    );
  }

  // Rule 4: High sensitivity requires gentler approach
  if (userTraits.soundSensitivity >= 8) {
    if (intent === 'focus' || intent === 'deep_focus') {
      return buildStrategy(
        STRATEGIES.GENTLE_FOCUS,
        0.5,
        'High sound sensitivity requires gentle stimulation',
        ['subtle', 'gradual', 'comfortable']
      );
    }
  }

  // Rule 5: Noisy/distracting environment needs stabilization (check before deep focus)
  if (environmental.noiseLevel > 0.7 || environmental.distractionLevel > 0.7) {
    return buildStrategy(
      STRATEGIES.STABILIZE,
      0.6,
      'High environmental distraction requires stabilizing approach',
      ['masking', 'anchoring', 'protective']
    );
  }

  // Rule 6: Evening chronotype in evening = optimal focus
  if (
    userTraits.chronotype === 'evening' &&
    (temporal.timeOfDay === 'evening' || temporal.timeOfDay === 'night') &&
    (intent === 'focus' || intent === 'deep_focus')
  ) {
    return buildStrategy(
      STRATEGIES.DEEP_FOCUS,
      0.7,
      'Evening person in evening hours, optimal for deep focus',
      ['peak_performance', 'sustained', 'immersive']
    );
  }

  // Rule 7: Deep focus in optimal conditions
  if (intent === 'deep_focus' || intent === 'focus') {
    // Check if environment supports deep focus
    const isQuietEnvironment = environmental.noiseLevel < 0.4;
    const isLowDistraction = environmental.distractionLevel < 0.5;
    const hasGoodAlertness = cognitiveState.alertness > 0.6;

    if (isQuietEnvironment && isLowDistraction && hasGoodAlertness) {
      return buildStrategy(
        STRATEGIES.DEEP_FOCUS,
        0.7,
        'Optimal conditions for deep focus detected',
        ['immersive', 'sustained', 'flow_inducing']
      );
    } else {
      return buildStrategy(
        STRATEGIES.GENTLE_FOCUS,
        0.6,
        'Environment or cognitive state suggests gentler focus approach',
        ['supportive', 'adaptive', 'comfortable']
      );
    }
  }

  // Rule 8: Creative work
  if (intent === 'creative_work' || intent === 'creativity') {
    return buildStrategy(
      STRATEGIES.CREATIVE_FLOW,
      0.6,
      'Creative work benefits from flow-inducing patterns',
      ['exploratory', 'dynamic', 'inspiring']
    );
  }

  // Rule 9: Low energy needs energizing
  if (cognitiveState.alertness < 0.4 && temporal.timeOfDay !== 'late_night') {
    return buildStrategy(
      STRATEGIES.ENERGIZE,
      0.7,
      'Low alertness detected, energizing approach selected',
      ['stimulating', 'activating', 'uplifting']
    );
  }

  // Rule 10: High stress needs stabilization
  if (cognitiveState.stressLevel > 0.7) {
    return buildStrategy(
      STRATEGIES.STABILIZE,
      0.5,
      'High stress detected, stabilization approach selected',
      ['grounding', 'calming', 'regulating']
    );
  }

  // Rule 11: Morning chronotype in morning = energize
  if (
    userTraits.chronotype === 'morning' &&
    (temporal.timeOfDay === 'early_morning' || temporal.timeOfDay === 'morning') &&
    intent === 'focus'
  ) {
    return buildStrategy(
      STRATEGIES.ENERGIZE,
      0.6,
      'Morning person in morning hours, energizing approach',
      ['activating', 'fresh', 'productive']
    );
  }

  // Default: Gentle focus (safe fallback)
  return buildStrategy(
    STRATEGIES.GENTLE_FOCUS,
    0.5,
    'Default gentle focus strategy',
    ['balanced', 'adaptive', 'safe']
  );
}

/**
 * Build strategy object with metadata
 * @private
 */
function buildStrategy(type, intensity, rationale, characteristics) {
  // Calculate confidence based on how specific the reasoning was
  const confidence = calculateConfidence(type, intensity);

  return {
    type,
    intensity, // 0.0 to 1.0 - how strong the intervention should be
    rationale, // Human-readable explanation
    characteristics, // Descriptive tags for this strategy
    confidence, // How confident we are in this selection
    timestamp: new Date(),
    version: '1.0',
  };
}

/**
 * Calculate confidence in strategy selection
 * @private
 */
function calculateConfidence(type, intensity) {
  // Sleep and meditation are high confidence (explicit intent)
  if (type === STRATEGIES.SLEEP_PREPARE || type === STRATEGIES.MEDITATION) {
    return 0.95;
  }

  // Deep focus requires specific conditions, so slightly lower confidence
  if (type === STRATEGIES.DEEP_FOCUS) {
    return 0.85;
  }

  // Gentle focus is safe fallback, moderate confidence
  if (type === STRATEGIES.GENTLE_FOCUS) {
    return 0.75;
  }

  // Other strategies have good confidence
  return 0.80;
}

/**
 * Get strategy description for explainability
 * @public (for testing/debugging)
 */
export function getStrategyDescription(strategyType) {
  const descriptions = {
    [STRATEGIES.SLEEP_PREPARE]: 'Gentle preparation for sleep with calming patterns',
    [STRATEGIES.DEEP_FOCUS]: 'Immersive focus state for demanding cognitive work',
    [STRATEGIES.GENTLE_FOCUS]: 'Supportive focus without overwhelming stimulation',
    [STRATEGIES.CREATIVE_FLOW]: 'Dynamic patterns to support creative exploration',
    [STRATEGIES.STABILIZE]: 'Grounding patterns to reduce stress and distraction',
    [STRATEGIES.COOLDOWN]: 'Gradual wind-down for relaxation',
    [STRATEGIES.ENERGIZE]: 'Activating patterns to boost alertness',
    [STRATEGIES.MEDITATION]: 'Centered patterns for mindfulness practice',
  };

  return descriptions[strategyType] || 'Unknown strategy';
}
