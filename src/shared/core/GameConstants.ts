/**
 * Core game constants for Bolo game mechanics
 * Defines physics parameters, game rules, and configuration values
 */

export const GAME_CONSTANTS = {
  // Physics Constants
  PHYSICS: {
    GRAVITY: 0.0, // No gravity in top-down tank game
    FRICTION: 0.85, // Movement friction coefficient
    AIR_RESISTANCE: 0.98, // Air resistance for projectiles
    MAX_VELOCITY: 5.0, // Maximum tank velocity
    ACCELERATION: 0.8, // Tank acceleration rate
    ROTATION_SPEED: 0.1, // Tank rotation speed (radians per frame)
    BOUNCE_DAMPING: 0.7, // Collision bounce damping
  },

  // Tank Configuration
  TANK: {
    WIDTH: 32,
    HEIGHT: 32,
    COLLISION_RADIUS: 16,
    MAX_HEALTH: 100,
    RELOAD_TIME: 500, // Milliseconds between shots
    FUEL_CAPACITY: 1000,
    FUEL_CONSUMPTION_RATE: 0.5, // Fuel per movement unit
  },

  // Projectile Configuration
  PROJECTILE: {
    SPEED: 8.0,
    DAMAGE: 25,
    LIFETIME: 3000, // Milliseconds before projectile expires
    WIDTH: 4,
    HEIGHT: 4,
    COLLISION_RADIUS: 2,
    GRAVITY_EFFECT: 0.1, // Slight ballistic arc
  },

  // Terrain Configuration
  TERRAIN: {
    TILE_SIZE: 32,
    WALL_THICKNESS: 4,
    DESTRUCTIBLE_HEALTH: 50,
    WATER_SLOW_FACTOR: 0.5,
    MUD_SLOW_FACTOR: 0.7,
  },

  // Power-ups Configuration
  POWERUPS: {
    SPAWN_INTERVAL: 30000, // 30 seconds
    DURATION: 15000, // 15 seconds active time
    DESPAWN_TIME: 60000, // 1 minute before cleanup
    SPEED_BOOST_MULTIPLIER: 1.5,
    DAMAGE_BOOST_MULTIPLIER: 2.0,
    ARMOR_BOOST_REDUCTION: 0.5,
    RAPID_FIRE_RELOAD_REDUCTION: 0.3,
  },

  // Game World
  WORLD: {
    DEFAULT_WIDTH: 1024,
    DEFAULT_HEIGHT: 768,
    VIEWPORT_PADDING: 64,
    MINIMAP_SCALE: 0.1,
  },

  // Collision Layers
  COLLISION_LAYERS: {
    TERRAIN: 1 << 0,    // 1
    TANK: 1 << 1,       // 2
    PROJECTILE: 1 << 2, // 4
    POWERUP: 1 << 3,    // 8
    PICKUP: 1 << 4,     // 16
  },

  // Game Modes
  GAME_MODES: {
    DEATHMATCH: {
      SCORE_LIMIT: 10,
      TIME_LIMIT: 300000, // 5 minutes
      RESPAWN_TIME: 3000,
    },
    CAPTURE_FLAG: {
      CAPTURE_TIME: 5000, // 5 seconds to capture
      FLAG_RETURN_TIME: 30000, // 30 seconds before auto-return
    },
    KING_OF_HILL: {
      CONTROL_TIME: 60000, // 1 minute to win
      CONTESTED_MULTIPLIER: 0.5,
    },
  },

  // Audio/Visual
  EFFECTS: {
    EXPLOSION_RADIUS: 64,
    MUZZLE_FLASH_DURATION: 100,
    SCREEN_SHAKE_INTENSITY: 0.5,
    PARTICLE_COUNT: 20,
  },
} as const;

export type GameMode = keyof typeof GAME_CONSTANTS.GAME_MODES;
export type CollisionLayer = keyof typeof GAME_CONSTANTS.COLLISION_LAYERS;