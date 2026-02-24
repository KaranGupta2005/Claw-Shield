/**
 * Intent Model - User Contract Definition
 * 
 * Translates user intent into technical boundaries and constraints
 * This is NOT prediction - it's a declaration of allowed behavioral space
 */

export const INTENT_CONTRACTS = {
  sleep: {
    description: 'Sleep preparation - maximum safety, minimum stimulation',
    constraints: {
      beatFrequency: { min: 0.5, max: 4, reason: 'Delta waves only for sleep' },
      carrierFrequency: { min: 100, max: 200, reason: 'Low carriers for calming' },
      volume: { min: 0.2, max: 0.6, reason: 'Gentle volume for sleep' },
      intensity: { min: 0.1, max: 0.4, reason: 'Very low intensity' },
      maxDuration: 3600,
    },
    requiredCharacteristics: ['gentle', 'calming'],
    forbiddenCharacteristics: ['stimulating', 'activating', 'energizing'],
  },

  rest: {
    description: 'Rest and relaxation - gentle, restorative',
    constraints: {
      beatFrequency: { min: 0.5, max: 8, reason: 'Delta to Theta for rest' },
      carrierFrequency: { min: 100, max: 250, reason: 'Low to medium carriers' },
      volume: { min: 0.2, max: 0.7, reason: 'Comfortable volume' },
      intensity: { min: 0.1, max: 0.5, reason: 'Low to moderate intensity' },
      maxDuration: 3600,
    },
    requiredCharacteristics: ['calming', 'relaxing'],
    forbiddenCharacteristics: ['stimulating', 'activating'],
  },

  meditation: {
    description: 'Meditation and mindfulness - centered, present',
    constraints: {
      beatFrequency: { min: 4, max: 10, reason: 'Theta to low Alpha for meditation' },
      carrierFrequency: { min: 150, max: 300, reason: 'Gentle to medium carriers' },
      volume: { min: 0.3, max: 0.7, reason: 'Present but not overwhelming' },
      intensity: { min: 0.2, max: 0.6, reason: 'Moderate intensity' },
      maxDuration: 5400,
    },
    requiredCharacteristics: ['centered', 'grounding', 'present'],
    forbiddenCharacteristics: ['stimulating', 'energizing'],
  },

  mindfulness: {
    description: 'Mindfulness practice - aware, present',
    constraints: {
      beatFrequency: { min: 4, max: 10, reason: 'Theta to low Alpha' },
      carrierFrequency: { min: 150, max: 300, reason: 'Gentle to medium carriers' },
      volume: { min: 0.3, max: 0.7, reason: 'Supportive volume' },
      intensity: { min: 0.2, max: 0.6, reason: 'Moderate intensity' },
      maxDuration: 5400,
    },
    requiredCharacteristics: ['present', 'grounding'],
    forbiddenCharacteristics: ['stimulating', 'energizing'],
  },

  focus: {
    description: 'General focus - balanced stimulation',
    constraints: {
      beatFrequency: { min: 8, max: 25, reason: 'Alpha to mid Beta for focus' },
      carrierFrequency: { min: 150, max: 400, reason: 'Medium to high carriers' },
      volume: { min: 0.3, max: 0.8, reason: 'Effective volume' },
      intensity: { min: 0.3, max: 0.8, reason: 'Moderate to high intensity' },
      maxDuration: 7200,
    },
    requiredCharacteristics: ['focus', 'sustained'],
    forbiddenCharacteristics: [],
  },

  deep_focus: {
    description: 'Deep focus - strong but safe stimulation',
    constraints: {
      beatFrequency: { min: 13, max: 30, reason: 'Beta waves for deep focus' },
      carrierFrequency: { min: 200, max: 450, reason: 'Medium to high carriers' },
      volume: { min: 0.4, max: 0.8, reason: 'Strong presence' },
      intensity: { min: 0.5, max: 0.9, reason: 'High intensity allowed' },
      maxDuration: 7200,
    },
    requiredCharacteristics: ['immersive', 'sustained'],
    forbiddenCharacteristics: [],
  },

  creative_work: {
    description: 'Creative work - exploratory, dynamic',
    constraints: {
      beatFrequency: { min: 8, max: 20, reason: 'Alpha to low Beta for creativity' },
      carrierFrequency: { min: 200, max: 400, reason: 'Medium carriers' },
      volume: { min: 0.3, max: 0.8, reason: 'Flexible volume' },
      intensity: { min: 0.4, max: 0.8, reason: 'Moderate to high intensity' },
      maxDuration: 7200,
    },
    requiredCharacteristics: ['exploratory', 'dynamic'],
    forbiddenCharacteristics: [],
  },

  creativity: {
    description: 'Creative exploration - flow state',
    constraints: {
      beatFrequency: { min: 8, max: 20, reason: 'Alpha to low Beta' },
      carrierFrequency: { min: 200, max: 400, reason: 'Medium carriers' },
      volume: { min: 0.3, max: 0.8, reason: 'Flexible volume' },
      intensity: { min: 0.4, max: 0.8, reason: 'Moderate to high intensity' },
      maxDuration: 7200,
    },
    requiredCharacteristics: ['exploratory', 'flow'],
    forbiddenCharacteristics: [],
  },

  light_focus: {
    description: 'Light focus - gentle concentration',
    constraints: {
      beatFrequency: { min: 8, max: 15, reason: 'Alpha to low Beta' },
      carrierFrequency: { min: 150, max: 350, reason: 'Gentle to medium carriers' },
      volume: { min: 0.3, max: 0.7, reason: 'Comfortable volume' },
      intensity: { min: 0.3, max: 0.6, reason: 'Moderate intensity' },
      maxDuration: 5400,
    },
    requiredCharacteristics: ['supportive', 'comfortable'],
    forbiddenCharacteristics: ['intense', 'overwhelming'],
  },
};

export const TEMPORAL_CONSTRAINTS = {
  late_night: {
    description: 'Late night (11 PM - 5 AM) - maximum caution',
    constraints: {
      maxBeatFrequency: 10,
      maxVolume: 0.6,
      maxIntensity: 0.5,
      forbiddenIntents: ['energize'],
    },
  },
  night: {
    description: 'Night (8 PM - 11 PM) - reduced stimulation',
    constraints: {
      maxBeatFrequency: 20,
      maxVolume: 0.7,
      maxIntensity: 0.7,
      forbiddenIntents: [],
    },
  },
  early_morning: {
    description: 'Early morning (5 AM - 9 AM) - gentle activation',
    constraints: {
      maxBeatFrequency: 40,
      maxVolume: 0.8,
      maxIntensity: 0.9,
      forbiddenIntents: [],
    },
  },
  morning: { constraints: {} },
  midday: { constraints: {} },
  afternoon: { constraints: {} },
  evening: { constraints: {} },
};

export const SENSITIVITY_CONSTRAINTS = {
  high: {
    threshold: 8,
    description: 'High sensitivity - extra protection',
    constraints: {
      maxVolume: 0.6,
      maxIntensity: 0.7,
      maxBeatFrequency: 25,
      minRampDuration: 90,
    },
  },
  very_high: {
    threshold: 9,
    description: 'Very high sensitivity - maximum protection',
    constraints: {
      maxVolume: 0.5,
      maxIntensity: 0.6,
      maxBeatFrequency: 20,
      minRampDuration: 120,
    },
  },
};

export function getIntentContract(intent) {
  const contract = INTENT_CONTRACTS[intent];
  if (!contract) {
    return INTENT_CONTRACTS.meditation;
  }
  return contract;
}

export function getTemporalConstraints(timeOfDay) {
  return TEMPORAL_CONSTRAINTS[timeOfDay] || { constraints: {} };
}

export function getSensitivityConstraints(soundSensitivity) {
  if (soundSensitivity >= 9) {
    return SENSITIVITY_CONSTRAINTS.very_high;
  }
  if (soundSensitivity >= 8) {
    return SENSITIVITY_CONSTRAINTS.high;
  }
  return null;
}

export function isIntentForbidden(intent, timeOfDay) {
  const temporal = getTemporalConstraints(timeOfDay);
  return temporal.constraints.forbiddenIntents?.includes(intent) || false;
}
