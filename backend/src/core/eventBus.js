import { EventEmitter } from 'events';
import { EVENTS } from '../constants/index.js';
import logger from './logger.js';

/**
 * EventBus - The nervous system of the backend
 * 
 * Wraps Node.js EventEmitter to provide:
 * - Event validation against constants
 * - Automatic logging and tracing
 * - Error handling for failed listeners
 * - Future extension points for telemetry
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase for multiple agents
    this.eventLog = [];
    this.loggingEnabled = process.env.LOG_EVENTS === 'true';
  }

  /**
   * Enable or disable event logging at runtime
   */
  setLogging(enabled) {
    this.loggingEnabled = enabled;
    logger.info(`🔔 Event logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Emit an event with validation and logging
   * @param {string} eventName - Event name from EVENTS constants
   * @param {object} payload - Event payload
   */
  emit(eventName, payload = {}) {
    // Validate event name
    if (!this._isValidEvent(eventName)) {
      logger.warn(`⚠️  Unknown event emitted: ${eventName}`);
    }

    // Add metadata
    const enrichedPayload = {
      ...payload,
      _timestamp: new Date(),
      _eventName: eventName,
    };

    // Log event
    if (this.loggingEnabled) {
      this._logEvent(eventName, enrichedPayload);
    }

    // Emit with error handling
    try {
      super.emit(eventName, enrichedPayload);
      
      // Also emit a wildcard event for monitoring
      super.emit('*', { eventName, payload: enrichedPayload });
    } catch (error) {
      logger.error(`❌ Error emitting event ${eventName}:`, error);
      // Emit error event
      super.emit('EVENT_BUS_ERROR', { eventName, error, payload: enrichedPayload });
    }

    return true;
  }

  /**
   * Register an event listener with error handling
   * @param {string} eventName - Event name from EVENTS constants
   * @param {function} handler - Event handler function
   */
  on(eventName, handler) {
    const wrappedHandler = async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`❌ Error in listener for ${eventName}:`, error);
        this.emit('LISTENER_ERROR', { eventName, error, payload });
      }
    };

    super.on(eventName, wrappedHandler);
    
    if (this.loggingEnabled) {
      logger.info(`📡 Listener registered for: ${eventName}`);
    }

    return this;
  }

  /**
   * Register a one-time event listener
   * @param {string} eventName - Event name from EVENTS constants
   * @param {function} handler - Event handler function
   */
  once(eventName, handler) {
    const wrappedHandler = async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`❌ Error in one-time listener for ${eventName}:`, error);
        this.emit('LISTENER_ERROR', { eventName, error, payload });
      }
    };

    super.once(eventName, wrappedHandler);
    return this;
  }

  /**
   * Validate event name against constants
   * @private
   */
  _isValidEvent(eventName) {
    return Object.values(EVENTS).includes(eventName) || 
           eventName === '*' || 
           eventName === 'EVENT_BUS_ERROR' ||
           eventName === 'LISTENER_ERROR';
  }

  /**
   * Log event for tracing and debugging
   * @private
   */
  _logEvent(eventName, payload) {
    const logEntry = {
      event: eventName,
      timestamp: payload._timestamp,
      sessionId: payload.sessionId || 'N/A',
      // Redact sensitive data
      payload: this._redactSensitiveData(payload),
    };

    this.eventLog.push(logEntry);

    // Keep only last 1000 events in memory
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }

    logger.info(`🔔 Event: ${eventName}`, {
      sessionId: logEntry.sessionId,
      timestamp: logEntry.timestamp,
    });
  }

  /**
   * Redact sensitive data from logs
   * @private
   */
  _redactSensitiveData(payload) {
    const redacted = { ...payload };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    
    for (const field of sensitiveFields) {
      if (redacted[field]) {
        redacted[field] = '[REDACTED]';
      }
    }

    return redacted;
  }

  /**
   * Get recent event log (for debugging)
   */
  getEventLog(limit = 100) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName) {
    return this.listenerCount(eventName);
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents() {
    return this.eventNames();
  }
}

// Create singleton instance
const eventBus = new EventBus();

export default eventBus;
