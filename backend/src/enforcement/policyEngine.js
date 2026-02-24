/**
 * Policy Engine - The Judge
 * Purely rule-based, deterministic evaluation of plans
 */

import {
  getIntentContract,
  getTemporalConstraints,
  getSensitivityConstraints,
  isIntentForbidden,
} from './intentModel.js';
import logger from '../core/logger.js';

export class PolicyResult {
  constructor(allowed, violations = [], warnings = []) {
    this.allowed = allowed;
    this.violations = violations;
    this.warnings = warnings;
    this.timestamp = new Date();
  }

  isAllowed() {
    return this.allowed;
  }

  isBlocked() {
    return !this.allowed;
  }

  getViolations() {
    return this.violations;
  }

  getWarnings() {
    return this.warnings;
  }
}

export function evaluatePlan(plan, context, strategy) {
  const violations = [];
  const warnings = [];

  logger.info('⚖️  Policy Engine: Evaluating plan', {
    intent: context.intent,
    strategyType: strategy.type,
    beatFrequency: plan.parameters.beatFrequency,
  });

  if (isIntentForbidden(context.intent, context.temporal.timeOfDay)) {
    violations.push({
      rule: 'FORBIDDEN_INTENT',
      message: `Intent "${context.intent}" is forbidden during ${context.temporal.timeOfDay}`,
      severity: 'CRITICAL',
    });
  }

  const intentViolations = evaluateIntentContract(plan, context.intent, strategy);
  violations.push(...intentViolations);

  const temporalViolations = evaluateTemporalConstraints(plan, context.temporal.timeOfDay);
  violations.push(...temporalViolations);

  const sensitivityViolations = evaluateSensitivityConstraints(plan, context.userTraits.soundSensitivity);
  violations.push(...sensitivityViolations);

  const concernWarnings = checkConcerningPatterns(plan, context, strategy);
  warnings.push(...concernWarnings);

  const allowed = violations.length === 0;

  if (allowed) {
    logger.info('⚖️  Policy Engine: Plan APPROVED', { warnings: warnings.length });
  } else {
    logger.warn('⚖️  Policy Engine: Plan BLOCKED', {
      violations: violations.length,
      reasons: violations.map(v => v.rule),
    });
  }

  return new PolicyResult(allowed, violations, warnings);
}

function evaluateIntentContract(plan, intent, strategy) {
  const violations = [];
  const contract = getIntentContract(intent);
  const params = plan.parameters;

  if (params.beatFrequency < contract.constraints.beatFrequency.min ||
      params.beatFrequency > contract.constraints.beatFrequency.max) {
    violations.push({
      rule: 'INTENT_BEAT_FREQUENCY',
      message: `Beat frequency ${params.beatFrequency}Hz violates intent "${intent}"`,
      reason: contract.constraints.beatFrequency.reason,
      severity: 'HIGH',
    });
  }

  if (params.carrierFrequency < contract.constraints.carrierFrequency.min ||
      params.carrierFrequency > contract.constraints.carrierFrequency.max) {
    violations.push({
      rule: 'INTENT_CARRIER_FREQUENCY',
      message: `Carrier frequency ${params.carrierFrequency}Hz violates intent "${intent}"`,
      reason: contract.constraints.carrierFrequency.reason,
      severity: 'HIGH',
    });
  }

  if (params.volume < contract.constraints.volume.min ||
      params.volume > contract.constraints.volume.max) {
    violations.push({
      rule: 'INTENT_VOLUME',
      message: `Volume ${(params.volume * 100).toFixed(0)}% violates intent "${intent}"`,
      reason: contract.constraints.volume.reason,
      severity: 'MEDIUM',
    });
  }

  if (strategy.intensity < contract.constraints.intensity.min ||
      strategy.intensity > contract.constraints.intensity.max) {
    violations.push({
      rule: 'INTENT_INTENSITY',
      message: `Intensity ${(strategy.intensity * 100).toFixed(0)}% violates intent "${intent}"`,
      reason: contract.constraints.intensity.reason,
      severity: 'HIGH',
    });
  }

  if (params.duration > contract.constraints.maxDuration) {
    violations.push({
      rule: 'INTENT_DURATION',
      message: `Duration ${Math.floor(params.duration / 60)}min exceeds intent "${intent}" limit`,
      severity: 'MEDIUM',
    });
  }

  if (contract.forbiddenCharacteristics.length > 0) {
    const forbidden = strategy.characteristics.filter(char =>
      contract.forbiddenCharacteristics.includes(char)
    );
    
    if (forbidden.length > 0) {
      violations.push({
        rule: 'INTENT_FORBIDDEN_CHARACTERISTICS',
        message: `Strategy has forbidden characteristics for intent "${intent}": ${forbidden.join(', ')}`,
        severity: 'HIGH',
      });
    }
  }

  return violations;
}

function evaluateTemporalConstraints(plan, timeOfDay) {
  const violations = [];
  const temporal = getTemporalConstraints(timeOfDay);
  const constraints = temporal.constraints;
  const params = plan.parameters;

  if (constraints.maxBeatFrequency && params.beatFrequency > constraints.maxBeatFrequency) {
    violations.push({
      rule: 'TEMPORAL_BEAT_FREQUENCY',
      message: `Beat frequency ${params.beatFrequency}Hz exceeds ${timeOfDay} limit`,
      severity: 'HIGH',
    });
  }

  if (constraints.maxVolume && params.volume > constraints.maxVolume) {
    violations.push({
      rule: 'TEMPORAL_VOLUME',
      message: `Volume ${(params.volume * 100).toFixed(0)}% exceeds ${timeOfDay} limit`,
      severity: 'MEDIUM',
    });
  }

  return violations;
}

function evaluateSensitivityConstraints(plan, soundSensitivity) {
  const violations = [];
  const sensitivityConstraint = getSensitivityConstraints(soundSensitivity);
  
  if (!sensitivityConstraint) {
    return violations;
  }

  const constraints = sensitivityConstraint.constraints;
  const params = plan.parameters;

  if (params.volume > constraints.maxVolume) {
    violations.push({
      rule: 'SENSITIVITY_VOLUME',
      message: `Volume ${(params.volume * 100).toFixed(0)}% exceeds limit for sensitivity ${soundSensitivity}/10`,
      severity: 'HIGH',
    });
  }

  if (params.beatFrequency > constraints.maxBeatFrequency) {
    violations.push({
      rule: 'SENSITIVITY_BEAT_FREQUENCY',
      message: `Beat frequency ${params.beatFrequency}Hz exceeds limit for sensitivity ${soundSensitivity}/10`,
      severity: 'HIGH',
    });
  }

  if (params.rampIn < constraints.minRampDuration) {
    violations.push({
      rule: 'SENSITIVITY_RAMP_DURATION',
      message: `Ramp duration ${params.rampIn}s too short for sensitivity ${soundSensitivity}/10`,
      severity: 'MEDIUM',
    });
  }

  return violations;
}

function checkConcerningPatterns(plan, context, strategy) {
  const warnings = [];
  const params = plan.parameters;

  if ((context.temporal.timeOfDay === 'night' || context.temporal.timeOfDay === 'late_night') &&
      params.beatFrequency > 15) {
    warnings.push({
      pattern: 'HIGH_FREQUENCY_AT_NIGHT',
      message: `High beat frequency (${params.beatFrequency}Hz) during ${context.temporal.timeOfDay} may affect sleep`,
      recommendation: 'Consider gentler frequencies for evening sessions',
    });
  }

  if (plan.confidence < 0.6) {
    warnings.push({
      pattern: 'LOW_CONFIDENCE_PLAN',
      message: `Plan confidence is low (${(plan.confidence * 100).toFixed(0)}%)`,
      recommendation: 'Consider adjusting context or strategy',
    });
  }

  if (context.userTraits.soundSensitivity >= 7 && params.volume > 0.7) {
    warnings.push({
      pattern: 'HIGH_VOLUME_SENSITIVE_USER',
      message: `Volume ${(params.volume * 100).toFixed(0)}% may be uncomfortable for sensitivity ${context.userTraits.soundSensitivity}/10`,
      recommendation: 'Consider reducing volume',
    });
  }

  if (params.duration > 3600) {
    warnings.push({
      pattern: 'LONG_DURATION',
      message: `Session duration is ${Math.floor(params.duration / 60)} minutes`,
      recommendation: 'Consider shorter initial sessions',
    });
  }

  return warnings;
}
