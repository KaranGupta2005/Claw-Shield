/**
 * Logger - Centralized logging utility
 * Provides structured logging for the entire application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.enableColors = process.env.NODE_ENV !== 'production';
  }

  _shouldLog(level) {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    
    if (this.enableColors) {
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[90m', // Gray
      };
      const reset = '\x1b[0m';
      return `${colors[level]}[${timestamp}] ${level}${reset}: ${message} ${metaStr}`;
    }
    
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  }

  error(message, meta = {}) {
    if (this._shouldLog('ERROR')) {
      console.error(this._formatMessage('ERROR', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog('WARN')) {
      console.warn(this._formatMessage('WARN', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog('INFO')) {
      console.log(this._formatMessage('INFO', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog('DEBUG')) {
      console.log(this._formatMessage('DEBUG', message, meta));
    }
  }
}

const logger = new Logger();

export default logger;
