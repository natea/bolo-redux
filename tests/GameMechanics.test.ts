/**
 * Comprehensive test suite for Bolo game mechanics
 * Tests all core systems: physics, tanks, projectiles, terrain, powerups
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Vector2D } from '../src/shared/core/Vector2D';
import { GAME_CONSTANTS } from '../src/shared/core/GameConstants';
import { PhysicsEngine } from '../src/shared/physics/PhysicsEngine';
import { Tank } from '../src/shared/entities/Tank';
import { Projectile, ProjectileFactory } from '../src/shared/entities/Projectile';
import { TerrainGenerator } from '../src/shared/terrain/TerrainGenerator';
import { PowerupSystem, PowerupType } from '../src/shared/powerups/PowerupSystem';
import { GameStateManager } from '../src/shared/core/GameStateManager';
import { CollisionDetection } from '../src/shared/collision/CollisionDetection';

describe('Vector2D', () => {
  it('should perform basic vector operations', () => {
    const v1 = new Vector2D(3, 4);
    const v2 = new Vector2D(1, 2);

    expect(v1.magnitude()).toBe(5);
    expect(v1.add(v2)).toEqual(new Vector2D(4, 6));
    expect(v1.subtract(v2)).toEqual(new Vector2D(2, 2));
    expect(v1.dot(v2)).toBe(11);
    expect(v1.distance(v2)).toBeCloseTo(2.828, 2);
  });

  it('should normalize vectors correctly', () => {
    const v = new Vector2D(3, 4);
    const normalized = v.normalize();

    expect(normalized.magnitude()).toBeCloseTo(1, 5);
    expect(normalized.x).toBeCloseTo(0.6, 5);
    expect(normalized.y).toBeCloseTo(0.8, 5);
  });

  it('should rotate vectors correctly', () => {
    const v = new Vector2D(1, 0);
    const rotated = v.rotate(Math.PI / 2);

    expect(rotated.x).toBeCloseTo(0, 5);
    expect(rotated.y).toBeCloseTo(1, 5);
  });
});

describe('PhysicsEngine', () => {
  let physics: PhysicsEngine;

  beforeEach(() => {
    physics = new PhysicsEngine();
  });

  it('should add and remove bodies', () => {
    const body = {
      id: 'test',
      position: new Vector2D(0, 0),
      velocity: new Vector2D(0, 0),
      acceleration: new Vector2D(0, 0),
      rotation: 0,
      angularVelocity: 0,
      mass: 1,
      collisionRadius: 10,
      collisionLayer: 1,
      collisionMask: 1,
      isStatic: false,
      friction: 0.9,
      bounciness: 0.5
    };

    physics.addBody(body);
    expect(physics.getBody('test')).toBe(body);

    physics.removeBody('test');
    expect(physics.getBody('test')).toBeUndefined();
  });

  it('should detect collisions between bodies', () => {
    const body1 = {
      id: 'body1',
      position: new Vector2D(0, 0),
      velocity: new Vector2D(1, 0),
      acceleration: new Vector2D(0, 0),
      rotation: 0,
      angularVelocity: 0,
      mass: 1,
      collisionRadius: 10,
      collisionLayer: 1,
      collisionMask: 1,
      isStatic: false,
      friction: 0.9,
      bounciness: 0.5
    };

    const body2 = {
      id: 'body2',
      position: new Vector2D(15, 0),
      velocity: new Vector2D(-1, 0),
      acceleration: new Vector2D(0, 0),
      rotation: 0,
      angularVelocity: 0,
      mass: 1,
      collisionRadius: 10,
      collisionLayer: 1,
      collisionMask: 1,
      isStatic: false,
      friction: 0.9,
      bounciness: 0.5
    };

    physics.addBody(body1);
    physics.addBody(body2);

    // Update physics to detect collision
    const collisions = physics.update(1/60);
    expect(collisions.length).toBe(1);
    expect(collisions[0].bodyA.id).toBe('body1');
    expect(collisions[0].bodyB.id).toBe('body2');
  });

  it('should apply forces and update physics', () => {
    const body = {
      id: 'test',
      position: new Vector2D(0, 0),
      velocity: new Vector2D(0, 0),
      acceleration: new Vector2D(0, 0),
      rotation: 0,
      angularVelocity: 0,
      mass: 2,
      collisionRadius: 10,
      collisionLayer: 1,
      collisionMask: 1,
      isStatic: false,
      friction: 1.0,
      bounciness: 0.5
    };

    physics.addBody(body);
    physics.applyForce('test', new Vector2D(10, 0));
    physics.update(1);

    expect(body.velocity.x).toBe(5); // force / mass = 10 / 2 = 5
    expect(body.position.x).toBe(5); // velocity * time = 5 * 1 = 5
  });
});

describe('Tank', () => {
  let tank: Tank;

  beforeEach(() => {
    tank = new Tank('player1', new Vector2D(100, 100));
  });

  it('should initialize with correct defaults', () => {
    const state = tank.getState();

    expect(state.id).toBe('player1');
    expect(state.position).toEqual(new Vector2D(100, 100));
    expect(state.health).toBe(GAME_CONSTANTS.TANK.MAX_HEALTH);
    expect(state.fuel).toBe(GAME_CONSTANTS.TANK.FUEL_CAPACITY);
    expect(state.isDestroyed).toBe(false);
  });

  it('should respond to controls', () => {
    tank.setControls({ forward: true, turnLeft: true });
    const controls = tank.getControls();

    expect(controls.forward).toBe(true);
    expect(controls.turnLeft).toBe(true);
    expect(controls.backward).toBe(false);
  });

  it('should fire projectiles when allowed', () => {
    const currentTime = Date.now();

    // First shot should work
    const shot1 = tank.fire(currentTime);
    expect(shot1).toBeTruthy();
    expect(shot1?.position).toBeDefined();
    expect(shot1?.direction).toBeDefined();
    expect(shot1?.damage).toBe(GAME_CONSTANTS.PROJECTILE.DAMAGE);

    // Immediate second shot should fail (reload time)
    const shot2 = tank.fire(currentTime + 10);
    expect(shot2).toBeNull();

    // Shot after reload time should work
    const shot3 = tank.fire(currentTime + GAME_CONSTANTS.TANK.RELOAD_TIME + 10);
    expect(shot3).toBeTruthy();
  });

  it('should take damage and be destroyed', () => {
    const initialHealth = tank.getHealth();

    // Take some damage
    const destroyed1 = tank.takeDamage(30);
    expect(destroyed1).toBe(false);
    expect(tank.getHealth()).toBe(initialHealth - 30);

    // Take lethal damage
    const destroyed2 = tank.takeDamage(100);
    expect(destroyed2).toBe(true);
    expect(tank.getHealth()).toBe(0);
    expect(tank.isDestroyed()).toBe(true);
  });

  it('should consume fuel when moving', () => {
    const initialFuel = tank.getFuel();

    tank.setControls({ forward: true });
    tank.update(1/60, Date.now());

    // Fuel should decrease when moving
    expect(tank.getFuel()).toBeLessThan(initialFuel);
  });

  it('should apply powerup effects', () => {
    tank.addPowerup(PowerupType.SPEED_BOOST, 5000, 1.5);

    const state = tank.getState();
    expect(state.powerups.length).toBe(1);
    expect(state.powerups[0].type).toBe(PowerupType.SPEED_BOOST);
    expect(state.powerups[0].multiplier).toBe(1.5);
  });
});

describe('Projectile', () => {
  let projectile: Projectile;

  beforeEach(() => {
    projectile = ProjectileFactory.createBullet(
      'bullet1',
      new Vector2D(0, 0),
      new Vector2D(1, 0),
      'player1'
    );
  });

  it('should move in the correct direction', () => {
    const initialPos = projectile.getPosition();
    projectile.update(1/60, Date.now());

    const newPos = projectile.getPosition();
    expect(newPos.x).toBeGreaterThan(initialPos.x);
    expect(newPos.y).toBeCloseTo(initialPos.y, 5);
  });

  it('should expire after lifetime', () => {
    const startTime = Date.now();
    const endTime = startTime + GAME_CONSTANTS.PROJECTILE.LIFETIME + 100;

    projectile.update(1/60, endTime);
    expect(projectile.isDestroyed()).toBe(true);
  });

  it('should calculate damage at different distances for explosives', () => {
    const rocket = ProjectileFactory.createRocket(
      'rocket1',
      new Vector2D(0, 0),
      new Vector2D(1, 0),
      'player1'
    );

    // Direct hit
    const directDamage = rocket.calculateDamageAtPosition(new Vector2D(0, 0));
    expect(directDamage).toBe(rocket.getDamage());

    // Edge of explosion
    const edgeDamage = rocket.calculateDamageAtPosition(
      new Vector2D(rocket.getExplosionRadius(), 0)
    );
    expect(edgeDamage).toBe(0);

    // Halfway
    const halfwayDamage = rocket.calculateDamageAtPosition(
      new Vector2D(rocket.getExplosionRadius() / 2, 0)
    );
    expect(halfwayDamage).toBeCloseTo(rocket.getDamage() * 0.5, 2);
  });
});

describe('TerrainGenerator', () => {
  it('should generate a valid map', () => {
    const map = TerrainGenerator.generateArena(20, 15);

    expect(map.width).toBe(20);
    expect(map.height).toBe(15);
    expect(map.tiles.length).toBe(20);
    expect(map.tiles[0].length).toBe(15);
    expect(map.spawnPoints.length).toBeGreaterThan(0);
    expect(map.physicsWalls.length).toBeGreaterThan(0);
  });

  it('should create boundary walls', () => {
    const map = TerrainGenerator.generateArena(10, 10);

    // Check corners are walls
    expect(map.tiles[0][0].passable).toBe(false);
    expect(map.tiles[9][0].passable).toBe(false);
    expect(map.tiles[0][9].passable).toBe(false);
    expect(map.tiles[9][9].passable).toBe(false);
  });

  it('should place spawn points in valid locations', () => {
    const map = TerrainGenerator.generateArena(20, 15);

    for (const spawnPoint of map.spawnPoints) {
      const tileX = Math.floor(spawnPoint.x / GAME_CONSTANTS.TERRAIN.TILE_SIZE);
      const tileY = Math.floor(spawnPoint.y / GAME_CONSTANTS.TERRAIN.TILE_SIZE);

      expect(tileX).toBeGreaterThanOrEqual(0);
      expect(tileX).toBeLessThan(20);
      expect(tileY).toBeGreaterThanOrEqual(0);
      expect(tileY).toBeLessThan(15);

      const tile = map.tiles[tileX][tileY];
      expect(tile.passable).toBe(true);
    }
  });
});

describe('PowerupSystem', () => {
  let powerupSystem: PowerupSystem;

  beforeEach(() => {
    powerupSystem = new PowerupSystem();
  });

  it('should spawn powerups at spawn points', () => {
    powerupSystem.addSpawnPoint(new Vector2D(100, 100));

    // Fast-forward time to trigger spawn
    const currentTime = Date.now() + GAME_CONSTANTS.POWERUPS.SPAWN_INTERVAL + 1000;
    powerupSystem.update(currentTime);

    const powerups = powerupSystem.getAllPowerups();
    expect(powerups.length).toBeGreaterThan(0);
  });

  it('should collect powerups when tank is nearby', () => {
    const powerupId = powerupSystem.spawnTemporaryPowerup(
      PowerupType.SPEED_BOOST,
      new Vector2D(100, 100)
    );

    let collected = false;
    powerupSystem.onPowerupApplied = () => { collected = true; };

    const result = powerupSystem.tryCollectPowerup(
      new Vector2D(105, 105),
      'player1',
      50
    );

    expect(result).toBeTruthy();
    expect(collected).toBe(true);
  });

  it('should remove expired powerups', () => {
    const powerupId = powerupSystem.spawnTemporaryPowerup(
      PowerupType.SPEED_BOOST,
      new Vector2D(100, 100),
      1000 // 1 second duration
    );

    expect(powerupSystem.getAllPowerups().length).toBe(1);

    // Fast-forward past expiry
    powerupSystem.update(Date.now() + 2000);

    expect(powerupSystem.getAllPowerups().length).toBe(0);
  });
});

describe('CollisionDetection', () => {
  it('should detect circle-circle collisions', () => {
    const circle1 = { position: new Vector2D(0, 0), radius: 10 };
    const circle2 = { position: new Vector2D(15, 0), radius: 10 };

    const result = CollisionDetection.circleCircle(circle1, circle2);

    expect(result.isColliding).toBe(true);
    expect(result.penetration).toBe(5);
    expect(result.normal.x).toBeCloseTo(1, 5);
    expect(result.normal.y).toBeCloseTo(0, 5);
  });

  it('should detect rectangle-rectangle collisions', () => {
    const rect1 = {
      position: new Vector2D(0, 0),
      width: 20,
      height: 20,
      rotation: 0
    };

    const rect2 = {
      position: new Vector2D(15, 0),
      width: 20,
      height: 20,
      rotation: 0
    };

    const result = CollisionDetection.rectangleRectangle(rect1, rect2);

    expect(result.isColliding).toBe(true);
    expect(result.penetration).toBe(5);
  });

  it('should detect circle-rectangle collisions', () => {
    const circle = { position: new Vector2D(15, 0), radius: 8 };
    const rect = {
      position: new Vector2D(0, 0),
      width: 20,
      height: 20,
      rotation: 0
    };

    const result = CollisionDetection.circleRectangle(circle, rect);

    expect(result.isColliding).toBe(true);
  });
});

describe('GameStateManager', () => {
  let gameManager: GameStateManager;

  beforeEach(() => {
    gameManager = new GameStateManager('test-game');
    gameManager.initializeGame();
  });

  it('should initialize with correct default state', () => {
    const state = gameManager.getState();

    expect(state.gameId).toBe('test-game');
    expect(state.mode).toBe('DEATHMATCH');
    expect(state.isRunning).toBe(false);
    expect(state.players.size).toBe(0);
    expect(state.tanks.size).toBe(0);
  });

  it('should add and remove players', () => {
    gameManager.addPlayer('player1', 'Test Player');

    const state = gameManager.getState();
    expect(state.players.size).toBe(1);
    expect(state.tanks.size).toBe(1);
    expect(state.scores.get('player1')).toBe(0);

    gameManager.removePlayer('player1');

    expect(state.players.size).toBe(0);
    expect(state.tanks.size).toBe(0);
  });

  it('should start and manage game lifecycle', () => {
    gameManager.addPlayer('player1', 'Test Player');
    gameManager.startGame();

    const state = gameManager.getState();
    expect(state.isRunning).toBe(true);
    expect(state.startTime).toBeGreaterThan(0);
  });

  it('should handle tank firing', () => {
    gameManager.addPlayer('player1', 'Test Player');
    gameManager.startGame();

    const initialProjectiles = gameManager.getProjectiles().length;
    gameManager.fireTank('player1');

    const newProjectiles = gameManager.getProjectiles().length;
    expect(newProjectiles).toBe(initialProjectiles + 1);
  });

  it('should update all systems', () => {
    gameManager.addPlayer('player1', 'Test Player');
    gameManager.startGame();

    // Set tank controls
    gameManager.setTankControls('player1', { forward: true });

    const tank = gameManager.getTank('player1');
    const initialPosition = tank?.getPosition();

    // Update game
    gameManager.update(1/60);

    const newPosition = tank?.getPosition();
    expect(newPosition?.x).not.toBe(initialPosition?.x);
  });

  it('should handle collisions and damage', () => {
    gameManager.addPlayer('player1', 'Test Player 1');
    gameManager.addPlayer('player2', 'Test Player 2');
    gameManager.startGame();

    const tank1 = gameManager.getTank('player1');
    const tank2 = gameManager.getTank('player2');

    expect(tank1).toBeDefined();
    expect(tank2).toBeDefined();

    const initialHealth = tank2!.getHealth();

    // Damage tank2
    tank2!.takeDamage(30);

    expect(tank2!.getHealth()).toBe(initialHealth - 30);
  });
});

describe('Integration Tests', () => {
  it('should run a complete game simulation', () => {
    const gameManager = new GameStateManager('integration-test');
    gameManager.initializeGame();

    // Add players
    gameManager.addPlayer('player1', 'Player 1');
    gameManager.addPlayer('player2', 'Player 2');

    // Start game
    gameManager.startGame();

    let eventCount = 0;
    gameManager.onGameEvent = () => { eventCount++; };

    // Simulate some game time
    for (let i = 0; i < 100; i++) {
      // Random controls
      gameManager.setTankControls('player1', {
        forward: Math.random() > 0.5,
        turnLeft: Math.random() > 0.7,
        turnRight: Math.random() > 0.7,
        fire: Math.random() > 0.8
      });

      gameManager.setTankControls('player2', {
        forward: Math.random() > 0.5,
        turnLeft: Math.random() > 0.7,
        turnRight: Math.random() > 0.7,
        fire: Math.random() > 0.8
      });

      // Random firing
      if (Math.random() > 0.9) {
        gameManager.fireTank('player1');
      }
      if (Math.random() > 0.9) {
        gameManager.fireTank('player2');
      }

      gameManager.update(1/60);
    }

    const state = gameManager.getState();
    expect(state.isRunning).toBe(true);
    expect(eventCount).toBeGreaterThan(0);

    const debugInfo = gameManager.getDebugInfo();
    expect(debugInfo.playerCount).toBe(2);
    expect(debugInfo.tankCount).toBe(2);
  });
});