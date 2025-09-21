import Joi from 'joi';

/**
 * Validation schemas
 */
const schemas = {
  playerData: Joi.object({
    name: Joi.string().trim().min(2).max(20).required()
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .messages({
        'string.pattern.base': 'Player name can only contain letters, numbers, underscore and dash'
      }),
    avatar: Joi.string().optional().default('default'),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    preferences: Joi.object().optional()
  }),

  gameAction: Joi.object({
    type: Joi.string().valid(
      'move_left', 'move_right', 'stop',
      'rotate_turret', 'set_power', 'shoot'
    ).required(),
    delta: Joi.number().min(-5).max(5).when('type', {
      is: 'rotate_turret',
      then: Joi.required()
    }),
    power: Joi.number().min(10).max(100).when('type', {
      is: Joi.alternatives().try('set_power', 'shoot'),
      then: Joi.required()
    }),
    weaponType: Joi.string().valid('standard', 'heavy', 'light').optional().default('standard'),
    timestamp: Joi.number().optional()
  }),

  roomCreation: Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    maxPlayers: Joi.number().integer().min(2).max(8).optional().default(8),
    gameMode: Joi.string().valid('classic', 'last_tank_standing', 'team_battle').optional().default('classic'),
    mapName: Joi.string().valid('default', 'canyon', 'mountains', 'plains').optional().default('default'),
    password: Joi.string().max(20).optional(),
    isPrivate: Joi.boolean().optional().default(false)
  }),

  roomJoin: Joi.object({
    roomId: Joi.string().uuid().required(),
    password: Joi.string().max(20).optional()
  }),

  chatMessage: Joi.object({
    message: Joi.string().trim().min(1).max(200).required(),
    type: Joi.string().valid('public', 'team', 'whisper').optional().default('public'),
    targetPlayerId: Joi.string().uuid().when('type', {
      is: 'whisper',
      then: Joi.required()
    })
  }),

  gameSettings: Joi.object({
    gravity: Joi.number().min(0).max(2).optional(),
    windStrength: Joi.number().min(0).max(10).optional(),
    windDirection: Joi.number().min(0).max(6.28).optional(), // 0 to 2π
    maxBullets: Joi.number().integer().min(10).max(100).optional(),
    respawnTime: Joi.number().integer().min(1000).max(30000).optional()
  })
};

/**
 * Validate player data
 */
export function validatePlayerData(data) {
  const { error, value } = schemas.playerData.validate(data);
  if (error) {
    throw new Error(`Invalid player data: ${error.details[0].message}`);
  }
  return value;
}

/**
 * Validate game action
 */
export function validateGameAction(data) {
  const { error, value } = schemas.gameAction.validate(data);
  if (error) {
    throw new Error(`Invalid game action: ${error.details[0].message}`);
  }

  // Additional validation for specific action types
  if (value.type === 'shoot') {
    // Check if required fields are present for shooting
    if (!value.power) {
      throw new Error('Power is required for shooting');
    }
  }

  return value;
}

/**
 * Validate room creation data
 */
export function validateRoomCreation(data) {
  const { error, value } = schemas.roomCreation.validate(data);
  if (error) {
    throw new Error(`Invalid room data: ${error.details[0].message}`);
  }

  // Check for inappropriate room names
  if (isInappropriateText(value.name)) {
    throw new Error('Inappropriate room name');
  }

  return value;
}

/**
 * Validate room join data
 */
export function validateRoomJoin(data) {
  const { error, value } = schemas.roomJoin.validate(data);
  if (error) {
    throw new Error(`Invalid room join data: ${error.details[0].message}`);
  }
  return value;
}

/**
 * Validate chat message
 */
export function validateChatMessage(data) {
  const { error, value } = schemas.chatMessage.validate(data);
  if (error) {
    throw new Error(`Invalid chat message: ${error.details[0].message}`);
  }

  // Check for inappropriate content
  if (isInappropriateText(value.message)) {
    throw new Error('Inappropriate message content');
  }

  return value;
}

/**
 * Validate game settings
 */
export function validateGameSettings(data) {
  const { error, value } = schemas.gameSettings.validate(data);
  if (error) {
    throw new Error(`Invalid game settings: ${error.details[0].message}`);
  }
  return value;
}

/**
 * Rate limiting validation
 */
export class RateLimiter {
  constructor() {
    this.requests = new Map(); // playerId -> { count, resetTime }
  }

  checkRate(playerId, action, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const key = `${playerId}:${action}`;

    let record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }

    record.count++;
    this.requests.set(key, record);

    if (record.count > limit) {
      throw new Error(`Rate limit exceeded for ${action}. Try again later.`);
    }

    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Input sanitization
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Check for inappropriate text content
 */
export function isInappropriateText(text) {
  const inappropriateWords = [
    // Add inappropriate words/phrases to filter
    'admin', 'moderator', 'system', 'server', 'bot'
  ];

  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
}

/**
 * Validate coordinates
 */
export function validateCoordinates(x, y, mapBounds) {
  const numX = Number(x);
  const numY = Number(y);

  if (isNaN(numX) || isNaN(numY)) {
    throw new Error('Invalid coordinates: must be numbers');
  }

  if (numX < 0 || numX > mapBounds.width || numY < 0 || numY > mapBounds.height) {
    throw new Error('Coordinates out of bounds');
  }

  return { x: numX, y: numY };
}

/**
 * Validate angle (in radians)
 */
export function validateAngle(angle) {
  const numAngle = Number(angle);

  if (isNaN(numAngle)) {
    throw new Error('Invalid angle: must be a number');
  }

  // Normalize angle to 0-2π range
  let normalized = numAngle % (2 * Math.PI);
  if (normalized < 0) normalized += 2 * Math.PI;

  return normalized;
}

/**
 * Validate velocity
 */
export function validateVelocity(velocity, maxSpeed = 20) {
  const { x, y } = velocity;

  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Invalid velocity: x and y must be numbers');
  }

  const speed = Math.sqrt(x * x + y * y);
  if (speed > maxSpeed) {
    throw new Error(`Velocity too high: ${speed} > ${maxSpeed}`);
  }

  return { x, y };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    throw new Error('Invalid UUID format');
  }

  return uuid;
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp, maxAge = 5000) {
  const numTimestamp = Number(timestamp);

  if (isNaN(numTimestamp)) {
    throw new Error('Invalid timestamp: must be a number');
  }

  const now = Date.now();
  const age = Math.abs(now - numTimestamp);

  if (age > maxAge) {
    throw new Error(`Timestamp too old: ${age}ms > ${maxAge}ms`);
  }

  return numTimestamp;
}

// Create global rate limiter instance
export const rateLimiter = new RateLimiter();

// Cleanup rate limiter every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);