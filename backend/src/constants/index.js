// Event Constants - Single Source of Truth for all system events

export const EVENTS = {
  // Session Events
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_ENDED: 'SESSION_ENDED',
  SESSION_PAUSED: 'SESSION_PAUSED',
  SESSION_RESUMED: 'SESSION_RESUMED',
  SESSION_ERROR: 'SESSION_ERROR',

  // Context Events
  CONTEXT_REQUESTED: 'CONTEXT_REQUESTED',
  CONTEXT_READY: 'CONTEXT_READY',
  CONTEXT_ERROR: 'CONTEXT_ERROR',

  // Strategy Events
  STRATEGY_REQUESTED: 'STRATEGY_REQUESTED',
  STRATEGY_READY: 'STRATEGY_READY',
  STRATEGY_ERROR: 'STRATEGY_ERROR',

  // Plan Events
  PLAN_PROPOSED: 'PLAN_PROPOSED',
  PLAN_APPROVED: 'PLAN_APPROVED',
  PLAN_BLOCKED: 'PLAN_BLOCKED',
  PLAN_ERROR: 'PLAN_ERROR',

  // Execution Events
  EXECUTION_STARTED: 'EXECUTION_STARTED',
  EXECUTION_COMPLETED: 'EXECUTION_COMPLETED',
  EXECUTION_FAILED: 'EXECUTION_FAILED',

  // Memory Events
  MEMORY_UPDATED: 'MEMORY_UPDATED',
  MEMORY_RETRIEVED: 'MEMORY_RETRIEVED',
  MEMORY_ERROR: 'MEMORY_ERROR',

  // Evaluation Events
  EVALUATION_REQUESTED: 'EVALUATION_REQUESTED',
  EVALUATION_COMPLETED: 'EVALUATION_COMPLETED',
  EVALUATION_ERROR: 'EVALUATION_ERROR',

  // Audio Generation Events
  AUDIO_GENERATION_STARTED: 'AUDIO_GENERATION_STARTED',
  AUDIO_GENERATION_COMPLETED: 'AUDIO_GENERATION_COMPLETED',
  AUDIO_GENERATION_ERROR: 'AUDIO_GENERATION_ERROR',
};

// Event Payload Schemas (for documentation)
export const EVENT_SCHEMAS = {
  SESSION_STARTED: {
    sessionId: 'string (required)',
    userId: 'string (required)',
    preferences: 'object (optional)',
    timestamp: 'Date (auto-generated)',
  },
  CONTEXT_READY: {
    sessionId: 'string (required)',
    context: 'object (required)',
    userId: 'string (required)',
  },
  STRATEGY_READY: {
    sessionId: 'string (required)',
    strategy: 'object (required)',
    context: 'object (required)',
  },
  PLAN_PROPOSED: {
    sessionId: 'string (required)',
    plan: 'object (required)',
    strategy: 'object (required)',
  },
  PLAN_APPROVED: {
    sessionId: 'string (required)',
    plan: 'object (required)',
    approvedBy: 'string (required)',
  },
  EXECUTION_STARTED: {
    sessionId: 'string (required)',
    plan: 'object (required)',
    executionId: 'string (required)',
  },
};

// Other Constants
export const SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  ERROR: 'error',
};

export const CHRONOTYPE = {
  MORNING: 'morning',
  EVENING: 'evening',
  NEUTRAL: 'neutral',
};
