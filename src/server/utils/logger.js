import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format
  }),

  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}

// Game-specific logging functions
export const gameLogger = {
  playerJoin: (playerId, playerName, socketId) => {
    logger.info(`Player joined: ${playerName} (${playerId}) from ${socketId}`);
  },

  playerLeave: (playerId, playerName, reason = 'disconnect') => {
    logger.info(`Player left: ${playerName} (${playerId}) - ${reason}`);
  },

  roomCreated: (roomId, roomName, hostName) => {
    logger.info(`Room created: ${roomName} (${roomId}) by ${hostName}`);
  },

  roomJoined: (roomId, roomName, playerName) => {
    logger.info(`Player ${playerName} joined room ${roomName} (${roomId})`);
  },

  gameStarted: (gameId, roomName, playerCount) => {
    logger.info(`Game started: ${gameId} in room ${roomName} with ${playerCount} players`);
  },

  gameEnded: (gameId, duration, winner) => {
    logger.info(`Game ended: ${gameId}, duration: ${duration}ms, winner: ${winner || 'None'}`);
  },

  tankDestroyed: (gameId, victimId, killerId, weapon) => {
    logger.debug(`Tank destroyed in game ${gameId}: ${victimId} killed by ${killerId} with ${weapon}`);
  },

  bulletFired: (gameId, playerId, position, velocity) => {
    logger.debug(`Bullet fired in game ${gameId} by ${playerId} at (${position.x}, ${position.y})`);
  },

  collision: (gameId, type, details) => {
    logger.debug(`Collision in game ${gameId}: ${type} - ${JSON.stringify(details)}`);
  },

  error: (context, error, details = {}) => {
    logger.error(`${context}: ${error.message}`, {
      error: error.stack,
      details,
      timestamp: new Date().toISOString()
    });
  },

  performance: (operation, duration, details = {}) => {
    if (duration > 100) { // Log slow operations
      logger.warn(`Slow operation: ${operation} took ${duration}ms`, details);
    } else {
      logger.debug(`Performance: ${operation} took ${duration}ms`, details);
    }
  },

  security: (event, playerId, details = {}) => {
    logger.warn(`Security event: ${event} from player ${playerId}`, details);
  }
};

// Performance monitoring wrapper
export function measurePerformance(operation, fn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      gameLogger.performance(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      gameLogger.performance(operation, duration, { error: error.message });
      throw error;
    }
  };
}

// Rate limiting for logs to prevent spam
class LogRateLimiter {
  constructor() {
    this.messages = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  shouldLog(key, limit = 10, windowMs = 60000) {
    const now = Date.now();

    if (!this.messages.has(key)) {
      this.messages.set(key, { count: 0, resetTime: now + windowMs });
    }

    const record = this.messages.get(key);

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;
    return record.count <= limit;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.messages) {
      if (now > record.resetTime) {
        this.messages.delete(key);
      }
    }
  }
}

const logRateLimiter = new LogRateLimiter();

// Rate-limited logging functions
export const rateLimitedLogger = {
  info: (key, message, limit = 10, windowMs = 60000) => {
    if (logRateLimiter.shouldLog(key, limit, windowMs)) {
      logger.info(message);
    }
  },

  warn: (key, message, limit = 5, windowMs = 60000) => {
    if (logRateLimiter.shouldLog(key, limit, windowMs)) {
      logger.warn(message);
    }
  },

  error: (key, message, limit = 3, windowMs = 60000) => {
    if (logRateLimiter.shouldLog(key, limit, windowMs)) {
      logger.error(message);
    }
  }
};

// HTTP request logging middleware (for Express)
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'http';

    logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });

  next();
};

// Graceful shutdown logging
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Unhandled error logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});