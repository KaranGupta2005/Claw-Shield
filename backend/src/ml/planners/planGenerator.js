/**
 * Plan Generator - ML Planning Module
 * 
 * Transforms context + strategy into structured action plans
 * This is the intelligence layer that proposes what to try
 * 
 * Currently uses rule-based logic, but interface is designed
 * to be replaced with ML models (bandits, RL, neural planners)
 */

import {
  getFrequencyParams,
  getRampProfile,
  getRecommendedDuration,
  SAFETY_CONSTRAINTS,
} from '../config/frequencyConfig.js';
import logger from '../../core/logger.js';

/**
 * Generate a plan from context and strategy
 * 
 * This is the main interface - accepts semantic inputs, returns structured plan
 * Future ML models will replace this implementation but keep the same signature
 * 
 * @param {Object} context - World state from Context Agent
 * @param {Object} strategy - Behavioral direction from Strategy Agent
 * @returns {Object} Structured action plan
 */
export async function generatePlan(context, strategy) {
  try {
    logger.info('🎨 Plan Generator: Generating plan', {
      strategyType: strategy.type,
      intensity: strategy.intensity,
    });

    // 1. Get base frequency parameters from strategy
    const frequencyParams = getFrequencyParams(
      strategy.type,
      strategy.intensity
    );

    // 2. Get ramp profile based on strategy and user sensitivity
    const rampProfile = getRampProfile(
      strategy.type,
      context.userTraits.soundSensitivity
    );

    // 3. Get recommended duration
    const baseDuration = getRecommendedDuration(strategy.type);

    // 4. Apply context-aware adjustments
    const adjustedParams = applyContextAdjustments(
      frequencyParams,
      context,
      strategy
    );

    // 5. Build structured plan
    const plan = {
      // Core parameters
      type: 'binaural_beats',
      parameters: {
        // Frequency parameters
        carrierFrequency: adjustedParams.carrierFrequency,
        beatFrequency: adjustedParams.beatFrequency,
        volume: adjustedParams.volume,
        
        // Temporal parameters
        duration: baseDuration,
        rampIn: rampProfile.duration,
        rampOut: rampProfile.duration,
        rampCurve: rampProfile.curve,
        
        // Metadata
        band: frequencyParams.band,
        bandRange: frequencyParams.bandRange,
      },

      // Reasoning trace
      reasoning: {
        strategyType: strategy.type,
        strategyIntensity: strategy.intensity,
        baseFrequency: frequencyParams.beatFrequency,
        adjustments: adjustedParams.adjustments,
        rampProfile: rampProfile.description,
      },

      // Metadata
      confidence: calculatePlanConfidence(context, strategy),
      timestamp: new Date(),
      version: '1.0',
    };

    logger.info('🎨 Plan Generator: Plan generated', {
      beatFrequency: plan.parameters.beatFrequency.toFixed(2),
      carrierFrequency: plan.parameters.carrierFrequency.toFixed(2),
      duration: plan.parameters.duration,
      confidence: plan.confidence,
    });

    return plan;
  } catch (error) {
    logger.error('🎨 Plan Generator: Error generating plan', {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Apply context-aware adjustments to base parameters
 * This is where environmental and cognitive factors influence the plan
 * @private
 */
function applyContextAdjustments(baseParams, context, strategy) {
  const adjustments = [];
  let { carrierFrequency, beatFrequency, volume } = baseParams;

  // Adjustment 1: High noise environment - increase volume slightly
  if (context.environmental.noiseLevel > 0.6) {
    const volumeBoost = Math.min(0.1, context.environmental.noiseLevel * 0.15);
    volume = Math.min(SAFETY_CONSTRAINTS.maxVolume, volume + volumeBoost);
    adjustments.push(`Volume +${(volumeBoost * 100).toFixed(0)}% for noisy environment`);
  }

  // Adjustment 2: Low alertness - slightly increase beat frequency (more stimulating)
  if (context.cognitiveState.alertness < 0.5 && strategy.type !== 'sleep_prepare') {
    const alertnessBoost = (0.5 - context.cognitiveState.alertness) * 2; // 0-1 Hz
    beatFrequency = Math.min(SAFETY_CONSTRAINTS.maxBeatFrequency, beatFrequency + alertnessBoost);
    adjustments.push(`Beat frequency +${alertnessBoost.toFixed(1)}Hz for low alertness`);
  }

  // Adjustment 3: High stress - lower carrier frequency (more calming)
  if (context.cognitiveState.stressLevel > 0.6) {
    const stressReduction = context.cognitiveState.stressLevel * 30; // Up to 30 Hz reduction
    carrierFrequency = Math.max(SAFETY_CONSTRAINTS.minCarrierFrequency, carrierFrequency - stressReduction);
    adjustments.push(`Carrier -${stressReduction.toFixed(0)}Hz for stress reduction`);
  }

  // Adjustment 4: Evening chronotype in evening - optimize for their peak
  if (
    context.userTraits.chronotype === 'evening' &&
    (context.temporal.timeOfDay === 'evening' || context.temporal.timeOfDay === 'night')
  ) {
    // Evening people can handle slightly higher frequencies in evening
    beatFrequency = Math.min(SAFETY_CONSTRAINTS.maxBeatFrequency, beatFrequency * 1.05);
    adjustments.push('Beat frequency +5% for evening chronotype peak');
  }

  // Adjustment 5: Morning chronotype in morning - optimize for their peak
  if (
    context.userTraits.chronotype === 'morning' &&
    (context.temporal.timeOfDay === 'early_morning' || context.temporal.timeOfDay === 'morning')
  ) {
    // Morning people benefit from activation in morning
    beatFrequency = Math.min(SAFETY_CONSTRAINTS.maxBeatFrequency, beatFrequency * 1.05);
    adjustments.push('Beat frequency +5% for morning chronotype peak');
  }

  // Adjustment 6: Very high sensitivity - reduce volume
  if (context.userTraits.soundSensitivity >= 9) {
    volume = Math.max(SAFETY_CONSTRAINTS.minVolume, volume * 0.85);
    adjustments.push('Volume -15% for very high sensitivity');
  }

  // Adjustment 7: Low focus capacity - slightly reduce intensity
  if (context.cognitiveState.focusCapacity < 0.4 && strategy.type !== 'sleep_prepare') {
    beatFrequency = beatFrequency * 0.95;
    adjustments.push('Beat frequency -5% for low focus capacity');
  }

  return {
    carrierFrequency: Math.round(carrierFrequency * 10) / 10,
    beatFrequency: Math.round(beatFrequency * 10) / 10,
    volume: Math.round(volume * 100) / 100,
    adjustments: adjustments.length > 0 ? adjustments : ['No adjustments needed'],
  };
}

/**
 * Calculate confidence in the generated plan
 * Based on how well context aligns with strategy
 * @private
 */
function calculatePlanConfidence(context, strategy) {
  let confidence = 0.8; // Base confidence

  // Higher confidence if context strongly supports strategy
  if (strategy.type === 'deep_focus') {
    if (context.environmental.noiseLevel < 0.3 && context.cognitiveState.alertness > 0.7) {
      confidence += 0.1; // Ideal conditions
    }
  }

  if (strategy.type === 'sleep_prepare') {
    if (context.temporal.timeOfDay === 'night' || context.temporal.timeOfDay === 'late_night') {
      confidence += 0.1; // Right time for sleep
    }
  }

  if (strategy.type === 'energize') {
    if (context.cognitiveState.alertness < 0.5) {
      confidence += 0.1; // Clear need for energy
    }
  }

  // Lower confidence if context conflicts with strategy
  if (strategy.type === 'deep_focus' && context.environmental.distractionLevel > 0.7) {
    confidence -= 0.1; // Challenging environment
  }

  // Confidence from strategy itself
  confidence = (confidence + strategy.confidence) / 2;

  return Math.max(0.5, Math.min(0.95, confidence));
}

/**
 * Validate plan parameters against safety constraints
 * This is a sanity check, not enforcement (that happens in Policy Engine)
 * @public (for testing)
 */
export function validatePlan(plan) {
  const { parameters } = plan;
  const errors = [];

  if (parameters.carrierFrequency < SAFETY_CONSTRAINTS.minCarrierFrequency ||
      parameters.carrierFrequency > SAFETY_CONSTRAINTS.maxCarrierFrequency) {
    errors.push(`Carrier frequency ${parameters.carrierFrequency} outside safe range`);
  }

  if (parameters.beatFrequency < SAFETY_CONSTRAINTS.minBeatFrequency ||
      parameters.beatFrequency > SAFETY_CONSTRAINTS.maxBeatFrequency) {
    errors.push(`Beat frequency ${parameters.beatFrequency} outside safe range`);
  }

  if (parameters.volume < SAFETY_CONSTRAINTS.minVolume ||
      parameters.volume > SAFETY_CONSTRAINTS.maxVolume) {
    errors.push(`Volume ${parameters.volume} outside safe range`);
  }

  if (parameters.duration < SAFETY_CONSTRAINTS.minDuration ||
      parameters.duration > SAFETY_CONSTRAINTS.maxDuration) {
    errors.push(`Duration ${parameters.duration} outside safe range`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
