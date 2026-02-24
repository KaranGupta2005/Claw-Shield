import { EVENTS } from '../constants/index.js';
import logger from '../core/logger.js';
import User from '../models/User.js';
import { reverseGeocode } from '../services/geocodingService.js';
import { getTimeBucket, adjustForChronotype } from '../utils/timeUtils.js';

/**
 * Context Agent - Perception Layer
 * 
 * Transforms raw session input into structured "world state"
 * This is sensor fusion, not decision-making
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

      // Build comprehensive context
      const context = await buildContext(payload);

      // Emit CONTEXT_READY event
      eventBus.emit(EVENTS.CONTEXT_READY, {
        sessionId: payload.sessionId,
        userId: payload.userId,
        context,
      });

      logger.info('🧠 Context Agent: Context prepared successfully', {
        sessionId: payload.sessionId,
        location: context.location.primary,
        timeOfDay: context.temporal.timeOfDay,
        intent: context.intent,
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
 * Build comprehensive context from session data
 * This is the core perception function
 * @private
 */
async function buildContext(payload) {
  const { userId, preferences, sessionId } = payload;

  // Fetch user profile for behavioral traits
  const user = await User.findById(userId).select(
    'chronotype soundSensitivity name email'
  );

  if (!user) {
    throw new Error('User not found');
  }

  // 1. TEMPORAL CONTEXT - Semantic time interpretation
  const baseTimeBucket = getTimeBucket(new Date());
  const temporal = adjustForChronotype(baseTimeBucket, user.chronotype);

  // 2. LOCATION CONTEXT - Probabilistic place type from coordinates
  let location;
  if (preferences?.coordinates) {
    const { lat, lng } = preferences.coordinates;
    location = await reverseGeocode(lat, lng);
  } else if (preferences?.locationHint) {
    // If user provides a hint like "library" or "home", use it directly
    location = inferLocationFromHint(preferences.locationHint);
  } else {
    // No location data - use uniform distribution
    location = {
      primary: 'unknown',
      distribution: {
        library: 0.125,
        cafe: 0.125,
        office: 0.125,
        home: 0.125,
        transit: 0.125,
        outdoor: 0.125,
        commercial: 0.125,
        educational: 0.125,
      },
      confidence: 0.125,
    };
  }

  // 3. USER TRAITS - Stable behavioral characteristics
  const userTraits = {
    chronotype: user.chronotype,
    soundSensitivity: user.soundSensitivity,
    userId: user._id.toString(),
    userName: user.name,
  };

  // 4. INTENT - What the user wants to achieve
  const intent = preferences?.intent || 'focus'; // Default to focus

  // 5. ENVIRONMENTAL FACTORS - Derived from location + time
  const environmental = deriveEnvironmentalFactors(location, temporal);

  // 6. COGNITIVE STATE - Probabilistic estimate of user's mental state
  const cognitiveState = estimateCognitiveState(temporal, userTraits, environmental);

  // Return unified world state
  return {
    sessionId,
    timestamp: new Date(),
    
    // Core perception dimensions
    temporal,
    location,
    userTraits,
    intent,
    environmental,
    cognitiveState,

    // Metadata
    version: '1.0',
    confidence: calculateOverallConfidence(location, temporal),
  };
}

/**
 * Infer location from user-provided hint
 * @private
 */
function inferLocationFromHint(hint) {
  const normalized = hint.toLowerCase().trim();
  
  const hintMap = {
    library: { library: 0.9, educational: 0.1 },
    cafe: { cafe: 0.8, commercial: 0.2 },
    coffee: { cafe: 0.8, commercial: 0.2 },
    office: { office: 0.9, commercial: 0.1 },
    work: { office: 0.7, commercial: 0.3 },
    home: { home: 0.9, residential: 0.1 },
    park: { outdoor: 0.9, transit: 0.1 },
    outdoor: { outdoor: 0.8, transit: 0.2 },
    train: { transit: 0.9, commercial: 0.1 },
    bus: { transit: 0.9, commercial: 0.1 },
    transit: { transit: 0.9, commercial: 0.1 },
    subway: { transit: 0.9, commercial: 0.1 },
    school: { educational: 0.9, library: 0.1 },
    university: { educational: 0.9, library: 0.1 },
  };

  const distribution = hintMap[normalized] || {
    unknown: 1.0,
  };

  const primary = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)[0][0];

  return {
    primary,
    distribution,
    confidence: Math.max(...Object.values(distribution)),
    source: 'hint',
  };
}

/**
 * Derive environmental factors from location and time
 * @private
 */
function deriveEnvironmentalFactors(location, temporal) {
  // Estimate noise level based on location and time
  let noiseLevel = 0.5; // Default medium

  if (location.primary === 'library' || location.primary === 'educational') {
    noiseLevel = 0.2; // Quiet
  } else if (location.primary === 'cafe' || location.primary === 'commercial') {
    noiseLevel = 0.7; // Moderate to loud
  } else if (location.primary === 'transit') {
    noiseLevel = 0.8; // Loud
  } else if (location.primary === 'home') {
    noiseLevel = 0.3; // Quiet to moderate
  } else if (location.primary === 'outdoor') {
    noiseLevel = 0.4; // Variable
  }

  // Adjust for time of day
  if (temporal.timeOfDay === 'late_night' || temporal.timeOfDay === 'early_morning') {
    noiseLevel *= 0.5; // Quieter at night
  }

  // Estimate distraction level
  let distractionLevel = 0.5;
  if (location.primary === 'library') {
    distractionLevel = 0.2;
  } else if (location.primary === 'cafe' || location.primary === 'commercial') {
    distractionLevel = 0.7;
  } else if (location.primary === 'transit') {
    distractionLevel = 0.9;
  } else if (location.primary === 'home') {
    distractionLevel = 0.4;
  }

  return {
    noiseLevel,
    distractionLevel,
    ambientType: location.primary,
    timeContext: temporal.workContext,
  };
}

/**
 * Estimate cognitive state from context
 * @private
 */
function estimateCognitiveState(temporal, userTraits, environmental) {
  // Base alertness from time and chronotype
  let alertness = temporal.energyLevel;

  // Adjust for sound sensitivity and noise
  const noiseTolerance = 1.0 - (userTraits.soundSensitivity / 10);
  const noiseImpact = environmental.noiseLevel * (1 - noiseTolerance);
  alertness = Math.max(0.1, alertness - noiseImpact * 0.3);

  // Estimate focus capacity
  const focusCapacity = alertness * (1 - environmental.distractionLevel * 0.5);

  return {
    alertness: Math.min(1.0, Math.max(0.1, alertness)),
    focusCapacity: Math.min(1.0, Math.max(0.1, focusCapacity)),
    stressLevel: environmental.distractionLevel * 0.6,
    readiness: (alertness + focusCapacity) / 2,
  };
}

/**
 * Calculate overall confidence in context
 * @private
 */
function calculateOverallConfidence(location, temporal) {
  // Location confidence is already provided
  const locationConf = location.confidence || 0.5;
  
  // Temporal confidence is high (we know the time)
  const temporalConf = 0.9;

  // Weighted average
  return locationConf * 0.6 + temporalConf * 0.4;
}
