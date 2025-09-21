import { v4 as uuidv4 } from 'uuid';
import { Tank } from './entities/Tank.js';
import { Bullet } from './entities/Bullet.js';
import { TerrainGenerator } from './terrain/TerrainGenerator.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { CollisionDetector } from './physics/CollisionDetector.js';
import { logger } from '../utils/logger.js';

export class Game {
  constructor(options) {
    this.id = options.id;
    this.roomId = options.roomId;
    this.players = options.players;
    this.gameMode = options.gameMode || 'classic';
    this.mapName = options.mapName || 'default';

    // Game state
    this.status = 'initializing';
    this.tanks = new Map();
    this.bullets = new Map();
    this.terrain = null;
    this.startTime = null;
    this.lastUpdate = Date.now();

    // Game settings
    this.settings = {
      mapWidth: 2000,
      mapHeight: 1500,
      gravity: 0.5,
      windStrength: 0,
      windDirection: 0,
      maxBullets: 50,
      respawnTime: 5000 // 5 seconds
    };

    // Initialize physics systems
    this.physicsEngine = new PhysicsEngine(this.settings);
    this.collisionDetector = new CollisionDetector();
  }

  /**
   * Initialize the game with terrain and tanks
   */
  async initialize() {
    try {
      // Generate terrain
      this.terrain = await TerrainGenerator.generate({
        width: this.settings.mapWidth,
        height: this.settings.mapHeight,
        mapName: this.mapName
      });

      // Create tanks for each player
      const spawnPoints = this.terrain.getSpawnPoints(this.players.length);

      this.players.forEach((player, index) => {
        const spawnPoint = spawnPoints[index];
        const tank = new Tank({
          id: uuidv4(),
          playerId: player.id,
          playerName: player.name,
          position: spawnPoint.position,
          rotation: spawnPoint.rotation,
          color: this.generatePlayerColor(index)
        });

        this.tanks.set(player.id, tank);
      });

      this.status = 'active';
      this.startTime = Date.now();

      logger.info(`Game ${this.id} initialized with ${this.players.length} players`);
    } catch (error) {
      logger.error(`Game initialization failed: ${error.message}`);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Handle tank movement input
   */
  async handleTankMovement(playerId, action) {
    const tank = this.tanks.get(playerId);
    if (!tank || !tank.isAlive()) {
      return { success: false, error: 'Tank not available' };
    }

    try {
      const result = tank.handleMovement(action, this.terrain);

      if (result.success) {
        // Apply physics
        this.physicsEngine.updateTankPhysics(tank, this.terrain);

        return {
          success: true,
          position: tank.position,
          rotation: tank.rotation,
          velocity: tank.velocity
        };
      }

      return result;
    } catch (error) {
      logger.error(`Tank movement error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle tank shooting
   */
  async handleTankShoot(playerId, action) {
    const tank = this.tanks.get(playerId);
    if (!tank || !tank.isAlive()) {
      return { success: false, error: 'Tank not available' };
    }

    if (this.bullets.size >= this.settings.maxBullets) {
      return { success: false, error: 'Maximum bullets reached' };
    }

    try {
      const shootResult = tank.shoot(action);

      if (shootResult.success) {
        const bullet = new Bullet({
          id: uuidv4(),
          playerId: playerId,
          position: { ...shootResult.position },
          velocity: { ...shootResult.velocity },
          power: action.power || 50,
          weaponType: action.weaponType || 'standard'
        });

        this.bullets.set(bullet.id, bullet);

        return {
          success: true,
          bullet: {
            id: bullet.id,
            position: bullet.position,
            velocity: bullet.velocity
          }
        };
      }

      return shootResult;
    } catch (error) {
      logger.error(`Tank shoot error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update game state (called by game loop)
   */
  update() {
    if (this.status !== 'active') return null;

    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    const updates = {
      bullets: [],
      collisions: [],
      destroyed: []
    };

    // Update all bullets
    for (const [bulletId, bullet] of this.bullets) {
      // Apply physics to bullet
      this.physicsEngine.updateBulletPhysics(bullet, deltaTime, this.settings);

      // Check terrain collision
      if (this.collisionDetector.checkBulletTerrain(bullet, this.terrain)) {
        // Handle explosion
        const explosion = this.handleExplosion(bullet);
        updates.collisions.push({
          type: 'terrain',
          position: bullet.position,
          explosion: explosion
        });

        this.bullets.delete(bulletId);
        updates.destroyed.push({ type: 'bullet', id: bulletId });
        continue;
      }

      // Check tank collisions
      for (const [tankPlayerId, tank] of this.tanks) {
        if (tank.playerId !== bullet.playerId && tank.isAlive()) {
          if (this.collisionDetector.checkBulletTank(bullet, tank)) {
            // Handle tank hit
            const damage = this.calculateDamage(bullet, tank);
            tank.takeDamage(damage);

            updates.collisions.push({
              type: 'tank_hit',
              bulletId: bulletId,
              tankId: tankPlayerId,
              damage: damage,
              position: bullet.position
            });

            if (!tank.isAlive()) {
              updates.destroyed.push({ type: 'tank', id: tankPlayerId });
              this.scheduleRespawn(tankPlayerId);
            }

            this.bullets.delete(bulletId);
            updates.destroyed.push({ type: 'bullet', id: bulletId });
            break;
          }
        }
      }

      // Check if bullet is out of bounds
      if (this.isOutOfBounds(bullet.position)) {
        this.bullets.delete(bulletId);
        updates.destroyed.push({ type: 'bullet', id: bulletId });
      } else {
        updates.bullets.push({
          id: bulletId,
          position: bullet.position,
          velocity: bullet.velocity
        });
      }
    }

    // Check win conditions
    this.checkWinConditions();

    return updates;
  }

  /**
   * Handle explosion effects
   */
  handleExplosion(bullet) {
    const explosionRadius = this.getExplosionRadius(bullet.weaponType);

    // Damage terrain
    this.terrain.createCrater(bullet.position, explosionRadius);

    // Damage nearby tanks
    const affectedTanks = [];
    for (const tank of this.tanks.values()) {
      if (tank.isAlive()) {
        const distance = this.calculateDistance(bullet.position, tank.position);
        if (distance <= explosionRadius * 2) {
          const damage = this.calculateExplosionDamage(distance, explosionRadius, bullet.power);
          if (damage > 0) {
            tank.takeDamage(damage);
            affectedTanks.push({
              playerId: tank.playerId,
              damage: damage
            });
          }
        }
      }
    }

    return {
      radius: explosionRadius,
      affectedTanks: affectedTanks
    };
  }

  /**
   * Schedule tank respawn
   */
  scheduleRespawn(playerId) {
    setTimeout(() => {
      const tank = this.tanks.get(playerId);
      if (tank && this.status === 'active') {
        const spawnPoint = this.terrain.getRandomSpawnPoint();
        tank.respawn(spawnPoint.position, spawnPoint.rotation);

        logger.info(`Tank ${playerId} respawned`);
      }
    }, this.settings.respawnTime);
  }

  /**
   * Check win conditions
   */
  checkWinConditions() {
    const aliveTanks = Array.from(this.tanks.values()).filter(tank => tank.isAlive());

    if (aliveTanks.length <= 1 && this.gameMode === 'last_tank_standing') {
      this.endGame(aliveTanks.length === 1 ? aliveTanks[0].playerId : null);
    }
  }

  /**
   * End the game
   */
  endGame(winnerId = null) {
    this.status = 'finished';
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    logger.info(`Game ${this.id} ended. Winner: ${winnerId || 'None'}, Duration: ${duration}ms`);
  }

  /**
   * Get initial game state for clients
   */
  getInitialState() {
    return {
      gameId: this.id,
      gameMode: this.gameMode,
      settings: this.settings,
      startTime: this.startTime,
      terrain: this.terrain.getData(),
      tanks: Array.from(this.tanks.values()).map(tank => tank.getState())
    };
  }

  /**
   * Utility methods
   */
  generatePlayerColor(index) {
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
      '#FF00FF', '#00FFFF', '#FFA500', '#800080'
    ];
    return colors[index % colors.length];
  }

  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateDamage(bullet, tank) {
    // Base damage calculation
    let damage = bullet.power;

    // Apply weapon type modifiers
    switch (bullet.weaponType) {
      case 'heavy':
        damage *= 1.5;
        break;
      case 'light':
        damage *= 0.7;
        break;
      default:
        damage *= 1.0;
    }

    return Math.floor(damage);
  }

  calculateExplosionDamage(distance, explosionRadius, bulletPower) {
    if (distance > explosionRadius * 2) return 0;

    const falloff = Math.max(0, 1 - (distance / (explosionRadius * 2)));
    return Math.floor(bulletPower * falloff * 0.5);
  }

  getExplosionRadius(weaponType) {
    switch (weaponType) {
      case 'heavy': return 60;
      case 'light': return 30;
      default: return 45;
    }
  }

  isOutOfBounds(position) {
    return position.x < 0 || position.x > this.settings.mapWidth ||
           position.y < 0 || position.y > this.settings.mapHeight;
  }
}