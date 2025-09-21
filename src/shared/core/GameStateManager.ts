/**
 * Central game state management for Bolo game
 * Coordinates all game systems and maintains consistent state
 */

import { Vector2D } from './Vector2D';
import { GAME_CONSTANTS, GameMode } from './GameConstants';
import { PhysicsEngine, PhysicsBody, CollisionInfo } from '../physics/PhysicsEngine';
import { Tank, TankControls } from '../entities/Tank';
import { Projectile, ProjectileFactory } from '../entities/Projectile';
import { TerrainGenerator, GeneratedMap, TerrainType } from '../terrain/TerrainGenerator';
import { PowerupSystem, PowerupType } from '../powerups/PowerupSystem';

export interface GameState {
  gameId: string;
  mode: GameMode;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  currentTime: number;
  timeLimit?: number;
  scoreLimit?: number;
  players: Map<string, PlayerData>;
  tanks: Map<string, Tank>;
  projectiles: Map<string, Projectile>;
  map: GeneratedMap | null;
  powerupSystem: PowerupSystem;
  scores: Map<string, number>;
  teamScores: Map<string, number>;
  gameEvents: GameEvent[];
}

export interface PlayerData {
  id: string;
  name: string;
  team?: string;
  isConnected: boolean;
  joinTime: number;
  ping?: number;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: number;
  playerId?: string;
  data: any;
}

export enum GameEventType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  TANK_DESTROYED = 'tank_destroyed',
  TANK_RESPAWNED = 'tank_respawned',
  PROJECTILE_FIRED = 'projectile_fired',
  POWERUP_COLLECTED = 'powerup_collected',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  SCORE_CHANGED = 'score_changed',
  MAP_CHANGED = 'map_changed'
}

export class GameStateManager {
  private state: GameState;
  private physicsEngine: PhysicsEngine;
  private lastUpdateTime: number = 0;
  private nextProjectileId = 0;
  private nextEventId = 0;

  // Event callbacks
  onGameEvent?: (event: GameEvent) => void;
  onStateChanged?: (state: Readonly<GameState>) => void;
  onPlayerAction?: (playerId: string, action: string, data: any) => void;

  constructor(gameId: string, mode: GameMode = 'DEATHMATCH') {
    this.physicsEngine = new PhysicsEngine();

    this.state = {
      gameId,
      mode,
      isRunning: false,
      isPaused: false,
      startTime: 0,
      currentTime: Date.now(),
      timeLimit: GAME_CONSTANTS.GAME_MODES[mode]?.TIME_LIMIT,
      scoreLimit: GAME_CONSTANTS.GAME_MODES[mode]?.SCORE_LIMIT,
      players: new Map(),
      tanks: new Map(),
      projectiles: new Map(),
      map: null,
      powerupSystem: new PowerupSystem(),
      scores: new Map(),
      teamScores: new Map(),
      gameEvents: []
    };

    this.setupPowerupSystem();
  }

  private setupPowerupSystem(): void {
    this.state.powerupSystem.onPowerupApplied = (tankId, type, data) => {
      const tank = this.state.tanks.get(tankId);
      if (tank) {
        const effect = this.state.powerupSystem.getPowerupEffect(type);
        if (effect) {
          tank.addPowerup(type, effect.duration, data.multiplier || data.reduction);
          this.emitEvent(GameEventType.POWERUP_COLLECTED, tankId, { type, data });
        }
      }
    };
  }

  // Game lifecycle
  initializeGame(mapConfig?: any): void {
    this.generateMap(mapConfig);
    this.setupMapPowerupSpawns();
    this.state.currentTime = Date.now();
    this.emitEvent(GameEventType.MAP_CHANGED, undefined, { mapConfig });
  }

  startGame(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.startTime = Date.now();
    this.state.currentTime = this.state.startTime;

    this.respawnAllTanks();
    this.emitEvent(GameEventType.GAME_STARTED);
  }

  pauseGame(): void {
    this.state.isPaused = true;
  }

  resumeGame(): void {
    this.state.isPaused = false;
  }

  endGame(reason?: string): void {
    this.state.isRunning = false;
    this.emitEvent(GameEventType.GAME_ENDED, undefined, { reason });
  }

  // Main update loop
  update(deltaTime: number): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    this.state.currentTime = Date.now();

    // Update all game systems
    this.updateTanks(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updatePhysics(deltaTime);
    this.updatePowerups(deltaTime);
    this.updateGameLogic();

    // Check win conditions
    this.checkWinConditions();

    this.lastUpdateTime = this.state.currentTime;
    this.onStateChanged?.(this.state);
  }

  private updateTanks(deltaTime: number): void {
    for (const tank of this.state.tanks.values()) {
      tank.update(deltaTime, this.state.currentTime);

      // Apply terrain effects
      if (this.state.map) {
        const terrainTile = this.state.map.tiles[
          Math.floor(tank.getPosition().x / GAME_CONSTANTS.TERRAIN.TILE_SIZE)
        ]?.[Math.floor(tank.getPosition().y / GAME_CONSTANTS.TERRAIN.TILE_SIZE)];

        if (terrainTile && terrainTile.slowFactor < 1.0) {
          const body = tank.getPhysicsBody();
          body.velocity.multiplyInPlace(terrainTile.slowFactor);
        }
      }
    }
  }

  private updateProjectiles(deltaTime: number): void {
    const toRemove: string[] = [];

    for (const [id, projectile] of this.state.projectiles) {
      projectile.update(deltaTime, this.state.currentTime);

      if (projectile.isDestroyed()) {
        toRemove.push(id);
        this.physicsEngine.removeBody(id);
      }
    }

    // Remove destroyed projectiles
    for (const id of toRemove) {
      this.state.projectiles.delete(id);
    }
  }

  private updatePhysics(deltaTime: number): void {
    const collisions = this.physicsEngine.update(deltaTime);
    this.handleCollisions(collisions);
  }

  private updatePowerups(deltaTime: number): void {
    this.state.powerupSystem.update(this.state.currentTime);

    // Update physics bodies for powerups
    const powerupBodies = this.state.powerupSystem.createPhysicsBodies();
    for (const body of powerupBodies) {
      if (!this.physicsEngine.getBody(body.id)) {
        this.physicsEngine.addBody(body);
      }
    }
  }

  private updateGameLogic(): void {
    // Check for powerup collections
    for (const tank of this.state.tanks.values()) {
      if (!tank.isDestroyed()) {
        const collected = this.state.powerupSystem.tryCollectPowerup(
          tank.getPosition(),
          tank.getState().id
        );

        if (collected) {
          this.emitEvent(GameEventType.POWERUP_COLLECTED, tank.getState().id, {
            powerupType: collected.type,
            position: collected.position.toObject()
          });
        }
      }
    }
  }

  private handleCollisions(collisions: CollisionInfo[]): void {
    for (const collision of collisions) {
      // Handle projectile-tank collisions
      if (this.isProjectileCollision(collision)) {
        this.handleProjectileCollision(collision);
      }

      // Handle projectile-terrain collisions
      if (this.isProjectileTerrainCollision(collision)) {
        this.handleProjectileTerrainCollision(collision);
      }
    }
  }

  private isProjectileCollision(collision: CollisionInfo): boolean {
    return (collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE) &&
           (collision.bodyB.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TANK) ||
           (collision.bodyB.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE) &&
           (collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TANK);
  }

  private isProjectileTerrainCollision(collision: CollisionInfo): boolean {
    return (collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE) &&
           (collision.bodyB.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN) ||
           (collision.bodyB.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE) &&
           (collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN);
  }

  private handleProjectileCollision(collision: CollisionInfo): void {
    const projectileBody = collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE ?
      collision.bodyA : collision.bodyB;
    const tankBody = projectileBody === collision.bodyA ? collision.bodyB : collision.bodyA;

    const projectile = this.state.projectiles.get(projectileBody.id);
    const tank = this.state.tanks.get(tankBody.id);

    if (projectile && tank && !projectile.isDestroyed()) {
      // Prevent self-damage
      if (projectile.getOwnerId() === tank.getState().id) return;

      const damage = projectile.getDamage();
      const wasDestroyed = tank.takeDamage(damage, projectile.getOwnerId());

      if (wasDestroyed) {
        this.handleTankDestroyed(tank.getState().id, projectile.getOwnerId());
      }

      // Handle area damage if explosive
      if (projectile.getExplosionRadius() > 0) {
        this.handleExplosiveDamage(projectile.getPosition(), projectile.getExplosionRadius(),
                                  projectile.getDamage(), projectile.getOwnerId());
      }

      // Mark projectile as destroyed
      projectile.destroy();
    }
  }

  private handleProjectileTerrainCollision(collision: CollisionInfo): void {
    const projectileBody = collision.bodyA.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE ?
      collision.bodyA : collision.bodyB;

    const projectile = this.state.projectiles.get(projectileBody.id);

    if (projectile && !projectile.isDestroyed() && this.state.map) {
      // Damage destructible terrain
      const terrainGenerator = new TerrainGenerator();
      const destroyed = terrainGenerator.damageTile(
        this.state.map.tiles,
        projectile.getPosition(),
        projectile.getDamage()
      );

      if (destroyed) {
        // Update physics walls
        this.updatePhysicsWalls();
      }

      // Handle explosive damage to terrain
      if (projectile.getExplosionRadius() > 0) {
        this.handleExplosiveTerrainDamage(projectile.getPosition(),
                                         projectile.getExplosionRadius(),
                                         projectile.getDamage());
      }

      projectile.destroy();
    }
  }

  private handleExplosiveDamage(center: Vector2D, radius: number, baseDamage: number, ownerId: string): void {
    for (const tank of this.state.tanks.values()) {
      if (tank.getState().id === ownerId || tank.isDestroyed()) continue;

      const distance = tank.getPosition().distance(center);
      if (distance <= radius) {
        const damage = baseDamage * (1 - distance / radius);
        const wasDestroyed = tank.takeDamage(damage, ownerId);

        if (wasDestroyed) {
          this.handleTankDestroyed(tank.getState().id, ownerId);
        }
      }
    }
  }

  private handleExplosiveTerrainDamage(center: Vector2D, radius: number, damage: number): void {
    if (!this.state.map) return;

    const terrainGenerator = new TerrainGenerator();
    const tileSize = GAME_CONSTANTS.TERRAIN.TILE_SIZE;
    const tilesInRadius = Math.ceil(radius / tileSize);

    for (let dx = -tilesInRadius; dx <= tilesInRadius; dx++) {
      for (let dy = -tilesInRadius; dy <= tilesInRadius; dy++) {
        const tilePos = center.add(new Vector2D(dx * tileSize, dy * tileSize));
        const distance = center.distance(tilePos);

        if (distance <= radius) {
          const tileDamage = damage * (1 - distance / radius);
          const destroyed = terrainGenerator.damageTile(this.state.map.tiles, tilePos, tileDamage);

          if (destroyed) {
            this.updatePhysicsWalls();
          }
        }
      }
    }
  }

  private handleTankDestroyed(tankId: string, killerId?: string): void {
    this.emitEvent(GameEventType.TANK_DESTROYED, tankId, { killerId });

    // Update scores
    if (killerId && killerId !== tankId) {
      const currentScore = this.state.scores.get(killerId) || 0;
      this.state.scores.set(killerId, currentScore + 1);
      this.emitEvent(GameEventType.SCORE_CHANGED, killerId, { score: currentScore + 1 });

      // Update killer's tank kill count
      const killerTank = this.state.tanks.get(killerId);
      if (killerTank) {
        const killerState = killerTank.getState();
        killerState.kills++;
      }
    }
  }

  private updatePhysicsWalls(): void {
    if (!this.state.map) return;

    // Remove all existing wall bodies
    const allBodies = this.physicsEngine.getAllBodies();
    for (const body of allBodies) {
      if (body.id.startsWith('wall_')) {
        this.physicsEngine.removeBody(body.id);
      }
    }

    // Re-add current walls
    for (const wall of this.state.map.physicsWalls) {
      this.physicsEngine.addBody(wall);
    }
  }

  // Player management
  addPlayer(playerId: string, playerName: string, team?: string): void {
    const player: PlayerData = {
      id: playerId,
      name: playerName,
      team,
      isConnected: true,
      joinTime: this.state.currentTime
    };

    this.state.players.set(playerId, player);
    this.state.scores.set(playerId, 0);
    this.spawnTank(playerId);

    this.emitEvent(GameEventType.PLAYER_JOINED, playerId, { playerName, team });
  }

  removePlayer(playerId: string): void {
    this.state.players.delete(playerId);
    this.state.scores.delete(playerId);
    this.removeTank(playerId);

    this.emitEvent(GameEventType.PLAYER_LEFT, playerId);
  }

  // Tank management
  spawnTank(playerId: string): void {
    if (!this.state.map || this.state.map.spawnPoints.length === 0) return;

    // Find an available spawn point
    const spawnPoint = this.findAvailableSpawnPoint();
    const tank = new Tank(playerId, spawnPoint);

    this.state.tanks.set(playerId, tank);
    this.physicsEngine.addBody(tank.getPhysicsBody());

    this.emitEvent(GameEventType.TANK_RESPAWNED, playerId, { position: spawnPoint.toObject() });
  }

  private findAvailableSpawnPoint(): Vector2D {
    if (!this.state.map) return Vector2D.zero();

    const spawnPoints = this.state.map.spawnPoints;
    const minDistance = GAME_CONSTANTS.TANK.COLLISION_RADIUS * 3;

    // Try to find a spawn point not occupied by other tanks
    for (const spawnPoint of spawnPoints) {
      let occupied = false;

      for (const tank of this.state.tanks.values()) {
        if (!tank.isDestroyed() && tank.getPosition().distance(spawnPoint) < minDistance) {
          occupied = true;
          break;
        }
      }

      if (!occupied) {
        return spawnPoint;
      }
    }

    // If all are occupied, return a random one
    return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  }

  private removeTank(playerId: string): void {
    this.state.tanks.delete(playerId);
    this.physicsEngine.removeBody(playerId);
  }

  private respawnAllTanks(): void {
    for (const playerId of this.state.players.keys()) {
      this.spawnTank(playerId);
    }
  }

  // Tank controls
  setTankControls(playerId: string, controls: Partial<TankControls>): void {
    const tank = this.state.tanks.get(playerId);
    if (tank) {
      tank.setControls(controls);
      this.onPlayerAction?.(playerId, 'controls', controls);
    }
  }

  fireTank(playerId: string): void {
    const tank = this.state.tanks.get(playerId);
    if (!tank) return;

    const fireResult = tank.fire(this.state.currentTime);
    if (fireResult) {
      const projectileId = `projectile_${this.nextProjectileId++}`;
      const projectile = ProjectileFactory.createBullet(
        projectileId,
        fireResult.position,
        fireResult.direction,
        playerId
      );

      this.state.projectiles.set(projectileId, projectile);
      this.physicsEngine.addBody(projectile.getPhysicsBody());

      this.emitEvent(GameEventType.PROJECTILE_FIRED, playerId, {
        projectileId,
        position: fireResult.position.toObject(),
        direction: fireResult.direction.toObject(),
        damage: fireResult.damage
      });
    }
  }

  // Map management
  generateMap(config?: any): void {
    this.state.map = config ?
      TerrainGenerator.generateArena(config.width, config.height) :
      TerrainGenerator.generateArena();

    // Add terrain walls to physics engine
    for (const wall of this.state.map.physicsWalls) {
      this.physicsEngine.addBody(wall);
    }
  }

  private setupMapPowerupSpawns(): void {
    if (!this.state.map) return;

    for (const spawnPoint of this.state.map.powerupSpots) {
      this.state.powerupSystem.addSpawnPoint(spawnPoint);
    }
  }

  // Win condition checking
  private checkWinConditions(): void {
    if (!this.state.isRunning) return;

    // Check time limit
    if (this.state.timeLimit) {
      const elapsed = this.state.currentTime - this.state.startTime;
      if (elapsed >= this.state.timeLimit) {
        this.endGame('Time limit reached');
        return;
      }
    }

    // Check score limit
    if (this.state.scoreLimit) {
      for (const [playerId, score] of this.state.scores) {
        if (score >= this.state.scoreLimit) {
          this.endGame(`Player ${playerId} reached score limit`);
          return;
        }
      }
    }
  }

  // Event system
  private emitEvent(type: GameEventType, playerId?: string, data?: any): void {
    const event: GameEvent = {
      id: `event_${this.nextEventId++}`,
      type,
      timestamp: this.state.currentTime,
      playerId,
      data: data || {}
    };

    this.state.gameEvents.push(event);

    // Keep only recent events (last 1000)
    if (this.state.gameEvents.length > 1000) {
      this.state.gameEvents = this.state.gameEvents.slice(-1000);
    }

    this.onGameEvent?.(event);
  }

  // Getters
  getState(): Readonly<GameState> {
    return this.state;
  }

  getPlayer(playerId: string): PlayerData | undefined {
    return this.state.players.get(playerId);
  }

  getTank(playerId: string): Tank | undefined {
    return this.state.tanks.get(playerId);
  }

  getProjectiles(): Projectile[] {
    return Array.from(this.state.projectiles.values());
  }

  getPhysicsEngine(): PhysicsEngine {
    return this.physicsEngine;
  }

  // Debug and utilities
  getDebugInfo(): any {
    return {
      gameId: this.state.gameId,
      mode: this.state.mode,
      isRunning: this.state.isRunning,
      playerCount: this.state.players.size,
      tankCount: this.state.tanks.size,
      projectileCount: this.state.projectiles.size,
      eventCount: this.state.gameEvents.length,
      physics: this.physicsEngine.getDebugInfo(),
      powerups: this.state.powerupSystem.getDebugInfo()
    };
  }

  // Serialization for network sync
  serialize(): any {
    return {
      gameId: this.state.gameId,
      mode: this.state.mode,
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      startTime: this.state.startTime,
      currentTime: this.state.currentTime,
      timeLimit: this.state.timeLimit,
      scoreLimit: this.state.scoreLimit,
      players: Array.from(this.state.players.entries()),
      tanks: Array.from(this.state.tanks.entries()).map(([id, tank]) => [id, tank.serialize()]),
      projectiles: Array.from(this.state.projectiles.entries()).map(([id, proj]) => [id, proj.serialize()]),
      scores: Array.from(this.state.scores.entries()),
      teamScores: Array.from(this.state.teamScores.entries()),
      powerupSystem: this.state.powerupSystem.serialize(),
      recentEvents: this.state.gameEvents.slice(-10) // Only send recent events
    };
  }
}