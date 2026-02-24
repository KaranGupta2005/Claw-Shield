/**
 * Frequency Configuration
 * 
 * Defines frequency ranges and parameters for binaural beat generation
 * Based on neuroscience research on brainwave entrainment
 */

/**
 * Brainwave frequency bands and their cognitive associations
 */
export const FREQUENCY_BANDS = {
  // Delta (0.5-4 Hz) - Deep sleep, healing
  DELTA: {
    min: 0.5,
    max: 4,
    states: ['deep_sleep', 'healing', 'unconscious'],
  },
  
  // Theta (4-8 Hz) - Meditation, creativity, light sleep
  THETA: {
    min: 4,
    max: 8,
    states: ['meditation', 'creativity', 'light_sleep', 'relaxation'],
  },
  
  // Alpha (8-13 Hz) - Relaxed focus, calm alertness
  ALPHA: {
    min: 8,
    max: 13,
    states: ['relaxed_focus', 'calm', 'present', 'learning'],
  },
  
  // Beta (13-30 Hz) - Active thinking, focus, alertness
  BETA: {
    min: 13,
    max: 30,
    states: ['focus', 'alertness', 'active_thinking', 'problem_solving'],
  },
  
  // Gamma (30-100 Hz) - Peak performance, insight, flow
  GAMMA: {
    min: 30,
    max: 100,
    states: ['peak_performance', 'insight', 'flow', 'integration'],
  },
};

/**
 * Carrier frequency ranges (base tones)
 * Lower carriers are gentler, higher carriers are more stimulating
 */
export const CARRIER_RANGES = {
  VERY_LOW: { min: 100, max: 150, description: 'Very gentle, soothing' },
  LOW: { min: 150, max: 200, description: 'Gentle, calming' },
  MEDIUM: { min: 200, max: 300, description: 'Balanced, neutral' },
  HIGH: { min: 300, max: 400, description: 'Energizing, activating' },
  VERY_HIGH: { min: 400, max: 500, description: 'Very stimulating' },
};

/**
 * Strategy-to-frequency mappings
 * Maps behavioral strategies to appropriate frequency parameters
 */
export const STRATEGY_FREQUENCY_MAP = {
  sleep_prepare: {
    band: 'DELTA',
    beatFrequency: { min: 1, max: 3 },
    carrierRange: 'VERY_LOW',
    description: 'Deep delta waves for sleep preparation',
  },
  
  meditation: {
    band: 'THETA',
    beatFrequency: { min: 5, max: 7 },
    carrierRange: 'LOW',
    description: 'Theta waves for meditative states',
  },
  
  gentle_focus: {
    band: 'ALPHA',
    beatFrequency: { min: 9, max: 11 },
    carrierRange: 'MEDIUM',
    description: 'Alpha waves for relaxed focus',
  },
  
  deep_focus: {
    band: 'BETA',
    beatFrequency: { min: 15, max: 20 },
    carrierRange: 'MEDIUM',
    description: 'Beta waves for sustained concentration',
  },
  
  creative_flow: {
    band: 'ALPHA',
    beatFrequency: { min: 10, max: 12 },
    carrierRange: 'MEDIUM',
    description: 'Alpha-theta border for creative states',
  },
  
  stabilize: {
    band: 'ALPHA',
    beatFrequency: { min: 8, max: 10 },
    carrierRange: 'LOW',
    description: 'Low alpha for grounding and stability',
  },
  
  cooldown: {
    band: 'THETA',
    beatFrequency: { min: 4, max: 6 },
    carrierRange: 'LOW',
    description: 'Theta waves for relaxation',
  },
  
  energize: {
    band: 'BETA',
    beatFrequency: { min: 18, max: 25 },
    carrierRange: 'HIGH',
    description: 'High beta for activation',
  },
};

/**
 * Ramp profiles - how frequencies change over time
 */
export const RAMP_PROFILES = {
  GENTLE: {
    duration: 120, // 2 minutes
    curve: 'ease-in-out',
    description: 'Slow, smooth transition',
  },
  
  MODERATE: {
    duration: 60, // 1 minute
    curve: 'ease-in',
    description: 'Standard transition',
  },
  
  QUICK: {
    duration: 30, // 30 seconds
    curve: 'linear',
    description: 'Fast transition',
  },
  
  IMMEDIATE: {
    duration: 5, // 5 seconds
    curve: 'linear',
    description: 'Almost instant',
  },
};

/**
 * Session duration recommendations (in seconds)
 */
export const DURATION_RECOMMENDATIONS = {
  sleep_prepare: 1800, // 30 minutes
  meditation: 1200, // 20 minutes
  gentle_focus: 2700, // 45 minutes
  deep_focus: 3600, // 60 minutes
  creative_flow: 2400, // 40 minutes
  stabilize: 1800, // 30 minutes
  cooldown: 900, // 15 minutes
  energize: 1200, // 20 minutes
};

/**
 * Intensity modifiers - adjust parameters based on intensity level
 */
export const INTENSITY_MODIFIERS = {
  // Carrier frequency adjustment
  carrierAdjustment: (baseCarrier, intensity) => {
    // Higher intensity = higher carrier (more stimulating)
    const adjustment = (intensity - 0.5) * 100; // -50 to +50 Hz
    return Math.max(100, Math.min(500, baseCarrier + adjustment));
  },
  
  // Beat frequency adjustment
  beatAdjustment: (baseBeat, intensity, band) => {
    // Higher intensity = higher within band
    const bandConfig = FREQUENCY_BANDS[band];
    const range = bandConfig.max - bandConfig.min;
    return bandConfig.min + (range * intensity);
  },
  
  // Volume adjustment
  volumeAdjustment: (intensity) => {
    // Intensity affects volume (0.3 to 0.8)
    return 0.3 + (intensity * 0.5);
  },
};

/**
 * Safety constraints
 */
export const SAFETY_CONSTRAINTS = {
  minCarrierFrequency: 100,
  maxCarrierFrequency: 500,
  minBeatFrequency: 0.5,
  maxBeatFrequency: 40,
  minDuration: 300, // 5 minutes
  maxDuration: 7200, // 2 hours
  minVolume: 0.2,
  maxVolume: 0.8,
};

/**
 * Get frequency parameters for a strategy
 */
export function getFrequencyParams(strategyType, intensity = 0.5) {
  const strategyConfig = STRATEGY_FREQUENCY_MAP[strategyType];
  
  if (!strategyConfig) {
    throw new Error(`Unknown strategy type: ${strategyType}`);
  }
  
  const bandConfig = FREQUENCY_BANDS[strategyConfig.band];
  const carrierConfig = CARRIER_RANGES[strategyConfig.carrierRange];
  
  // Calculate base values
  const baseBeatFrequency = (strategyConfig.beatFrequency.min + strategyConfig.beatFrequency.max) / 2;
  const baseCarrier = (carrierConfig.min + carrierConfig.max) / 2;
  
  // Apply intensity modifiers
  const beatFrequency = INTENSITY_MODIFIERS.beatAdjustment(
    baseBeatFrequency,
    intensity,
    strategyConfig.band
  );
  
  const carrierFrequency = INTENSITY_MODIFIERS.carrierAdjustment(
    baseCarrier,
    intensity
  );
  
  const volume = INTENSITY_MODIFIERS.volumeAdjustment(intensity);
  
  return {
    beatFrequency: Math.max(
      SAFETY_CONSTRAINTS.minBeatFrequency,
      Math.min(SAFETY_CONSTRAINTS.maxBeatFrequency, beatFrequency)
    ),
    carrierFrequency: Math.max(
      SAFETY_CONSTRAINTS.minCarrierFrequency,
      Math.min(SAFETY_CONSTRAINTS.maxCarrierFrequency, carrierFrequency)
    ),
    volume: Math.max(
      SAFETY_CONSTRAINTS.minVolume,
      Math.min(SAFETY_CONSTRAINTS.maxVolume, volume)
    ),
    band: strategyConfig.band,
    bandRange: bandConfig,
  };
}

/**
 * Get ramp profile based on strategy and sensitivity
 */
export function getRampProfile(strategyType, soundSensitivity) {
  // High sensitivity = gentler ramps
  if (soundSensitivity >= 8) {
    return RAMP_PROFILES.GENTLE;
  }
  
  // Sleep and meditation need gentle ramps
  if (strategyType === 'sleep_prepare' || strategyType === 'meditation') {
    return RAMP_PROFILES.GENTLE;
  }
  
  // Energize can be quicker
  if (strategyType === 'energize') {
    return RAMP_PROFILES.QUICK;
  }
  
  // Default moderate
  return RAMP_PROFILES.MODERATE;
}

/**
 * Get recommended duration for strategy
 */
export function getRecommendedDuration(strategyType) {
  return DURATION_RECOMMENDATIONS[strategyType] || 1800; // Default 30 minutes
}
