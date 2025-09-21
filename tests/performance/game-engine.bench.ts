import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceTestUtils } from '../utils/test-helpers';

// Enhanced game engine for performance testing
class PerformanceGameEngine {
  private players: Map<string, any> = new Map();
  private projectiles: any[] = [];
  private powerups: any[] = [];
  private gameWorld: any;
  private physics: any;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];

  constructor() {
    this.gameWorld = {
      width: 800,
      height: 600,
      bounds: { x: 0, y: 0, width: 800, height: 600 }
    };

    this.physics = {
      gravity: 0.5,
      friction: 0.98,
      collisionDamping: 0.8
    };
  }

  // Player management
  addPlayer(id: string, data: any = {}) {
    this.players.set(id, {
      id,
      position: data.position || { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      health: 100,
      score: 0,
      radius: 12,
      mass: 1,
      color: data.color || '#00ff00',
      lastUpdate: performance.now(),
      ...data
    });
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  // Projectile management
  fireProjectile(ownerId: string, target: { x: number, y: number }) {
    const owner = this.players.get(ownerId);
    if (!owner) return;

    const dx = target.x - owner.position.x;
    const dy = target.y - owner.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const direction = { x: dx / distance, y: dy / distance };

    this.projectiles.push({
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x: owner.position.x, y: owner.position.y },
      velocity: { x: direction.x * 15, y: direction.y * 15 },
      damage: 10,
      radius: 3,
      ownerId,
      createdAt: performance.now(),
      lifetime: 5000
    });
  }

  // Physics simulation
  updatePhysics(deltaTime: number) {
    // Update players
    this.players.forEach(player => {
      // Apply acceleration
      player.velocity.x += player.acceleration.x * deltaTime;
      player.velocity.y += player.acceleration.y * deltaTime;

      // Apply gravity
      player.velocity.y += this.physics.gravity * deltaTime;

      // Apply friction
      player.velocity.x *= this.physics.friction;
      player.velocity.y *= this.physics.friction;

      // Update position
      player.position.x += player.velocity.x * deltaTime;
      player.position.y += player.velocity.y * deltaTime;

      // Boundary collision
      this.handleBoundaryCollision(player);

      // Reset acceleration
      player.acceleration.x = 0;
      player.acceleration.y = 0;
    });

    // Update projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Remove expired projectiles
      const age = performance.now() - projectile.createdAt;
      if (age > projectile.lifetime) return false;

      // Remove out-of-bounds projectiles
      return this.isInBounds(projectile.position);
    });
  }

  // Collision detection and resolution
  detectCollisions() {
    const collisions: any[] = [];

    // Player-player collisions
    const playerArray = Array.from(this.players.values());
    for (let i = 0; i < playerArray.length; i++) {
      for (let j = i + 1; j < playerArray.length; j++) {
        if (this.areColliding(playerArray[i], playerArray[j])) {
          collisions.push({
            type: 'player-player',
            object1: playerArray[i],
            object2: playerArray[j]
          });
        }
      }
    }

    // Projectile-player collisions
    this.projectiles.forEach(projectile => {
      this.players.forEach(player => {
        if (player.id !== projectile.ownerId && this.areColliding(projectile, player)) {
          collisions.push({
            type: 'projectile-player',
            projectile,
            player
          });
        }
      });
    });

    return collisions;
  }

  resolveCollisions(collisions: any[]) {
    collisions.forEach(collision => {
      switch (collision.type) {
        case 'player-player':
          this.resolvePlayerPlayerCollision(collision.object1, collision.object2);
          break;
        case 'projectile-player':
          this.resolveProjectilePlayerCollision(collision.projectile, collision.player);
          break;
      }
    });
  }

  // Game loop
  update(currentTime: number) {
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Convert to seconds and cap at reasonable value
    const dt = Math.min(deltaTime / 1000, 0.033); // Cap at ~30 FPS

    this.updatePhysics(dt);
    const collisions = this.detectCollisions();
    this.resolveCollisions(collisions);
    this.updatePowerups(dt);
    this.updateStatistics(currentTime);

    this.frameCount++;
  }

  // Utility methods
  private areColliding(obj1: any, obj2: any): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (obj1.radius + obj2.radius);
  }

  private handleBoundaryCollision(player: any) {
    if (player.position.x - player.radius < this.gameWorld.bounds.x) {
      player.position.x = this.gameWorld.bounds.x + player.radius;
      player.velocity.x *= -this.physics.collisionDamping;
    }
    if (player.position.x + player.radius > this.gameWorld.bounds.width) {
      player.position.x = this.gameWorld.bounds.width - player.radius;
      player.velocity.x *= -this.physics.collisionDamping;
    }
    if (player.position.y - player.radius < this.gameWorld.bounds.y) {
      player.position.y = this.gameWorld.bounds.y + player.radius;
      player.velocity.y *= -this.physics.collisionDamping;
    }
    if (player.position.y + player.radius > this.gameWorld.bounds.height) {
      player.position.y = this.gameWorld.bounds.height - player.radius;
      player.velocity.y *= -this.physics.collisionDamping;
    }
  }

  private resolvePlayerPlayerCollision(player1: any, player2: any) {
    const dx = player2.position.x - player1.position.x;
    const dy = player2.position.y - player1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Avoid division by zero

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate overlapping objects
    const overlap = (player1.radius + player2.radius) - distance;
    const separation = overlap / 2;

    player1.position.x -= nx * separation;
    player1.position.y -= ny * separation;
    player2.position.x += nx * separation;
    player2.position.y += ny * separation;

    // Calculate relative velocity
    const dvx = player2.velocity.x - player1.velocity.x;
    const dvy = player2.velocity.y - player1.velocity.y;
    const dvn = dvx * nx + dvy * ny;

    // Do not resolve if velocities are separating
    if (dvn > 0) return;

    // Collision impulse
    const impulse = (2 * dvn) / (player1.mass + player2.mass);

    // Update velocities
    player1.velocity.x += impulse * player2.mass * nx;
    player1.velocity.y += impulse * player2.mass * ny;
    player2.velocity.x -= impulse * player1.mass * nx;
    player2.velocity.y -= impulse * player1.mass * ny;
  }

  private resolveProjectilePlayerCollision(projectile: any, player: any) {
    // Apply damage
    player.health -= projectile.damage;

    // Remove projectile
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);
    }

    // Apply knockback
    const dx = player.position.x - projectile.position.x;
    const dy = player.position.y - projectile.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const knockback = 5;
      player.velocity.x += (dx / distance) * knockback;
      player.velocity.y += (dy / distance) * knockback;
    }
  }

  private isInBounds(position: { x: number, y: number }): boolean {
    return position.x >= 0 && position.x <= this.gameWorld.width &&
           position.y >= 0 && position.y <= this.gameWorld.height;
  }

  private updatePowerups(deltaTime: number) {
    // Update powerup logic here if needed
    this.powerups = this.powerups.filter(powerup => {
      // Simple powerup aging logic
      powerup.age = (powerup.age || 0) + deltaTime;
      return powerup.age < 30; // 30 second lifetime
    });
  }

  private updateStatistics(currentTime: number) {
    // Calculate FPS
    if (this.frameCount % 60 === 0) {
      const fps = 1000 / (currentTime - this.lastFrameTime);
      this.fpsHistory.push(fps);

      // Keep only recent FPS values
      if (this.fpsHistory.length > 100) {
        this.fpsHistory.shift();
      }
    }
  }

  // Performance metrics
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getProjectileCount(): number {
    return this.projectiles.length;
  }

  getFrameCount(): number {
    return this.frameCount;
  }

  // Stress test methods
  generateStressScenario(playerCount: number, projectileCount: number) {
    // Add many players
    for (let i = 0; i < playerCount; i++) {
      this.addPlayer(`stress-player-${i}`, {
        position: {
          x: Math.random() * this.gameWorld.width,
          y: Math.random() * this.gameWorld.height
        },
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        }
      });
    }

    // Add many projectiles
    for (let i = 0; i < projectileCount; i++) {
      this.projectiles.push({
        id: `stress-proj-${i}`,
        position: {
          x: Math.random() * this.gameWorld.width,
          y: Math.random() * this.gameWorld.height
        },
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20
        },
        damage: 10,
        radius: 3,
        ownerId: 'stress-test',
        createdAt: performance.now(),
        lifetime: 10000
      });
    }
  }

  simulateNetworkLatency(): Promise<void> {
    const latency = 50 + Math.random() * 100; // 50-150ms
    return new Promise(resolve => setTimeout(resolve, latency));
  }

  reset() {
    this.players.clear();
    this.projectiles = [];
    this.powerups = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fpsHistory = [];
  }
}

describe('Game Engine Performance Benchmarks', () => {
  let engine: PerformanceGameEngine;

  beforeEach(() => {
    engine = new PerformanceGameEngine();
    PerformanceTestUtils.reset();
  });

  describe('Basic Performance Metrics', () => {
    it('should maintain 60 FPS with normal player count', async () => {
      // Add 4 players (typical multiplayer scenario)
      for (let i = 0; i < 4; i++) {
        engine.addPlayer(`player-${i}`);
      }

      // Run simulation for 60 frames
      PerformanceTestUtils.startMeasurement('normal-gameplay');

      for (let frame = 0; frame < 60; frame++) {
        const frameStart = performance.now();
        engine.update(frameStart);

        // Each frame should complete quickly enough for 60 FPS
        const frameTime = performance.now() - frameStart;
        expect(frameTime).toBeLessThan(16.67); // 60 FPS = 16.67ms per frame
      }

      const totalTime = PerformanceTestUtils.endMeasurement('normal-gameplay');
      const avgFrameTime = totalTime / 60;

      expect(avgFrameTime).toBeLessThan(10); // Should be well under 16.67ms
    });

    it('should handle collision detection efficiently', () => {
      // Add many players for collision testing
      for (let i = 0; i < 20; i++) {
        engine.addPlayer(`collision-player-${i}`, {
          position: {
            x: 400 + (Math.random() - 0.5) * 100,
            y: 300 + (Math.random() - 0.5) * 100
          }
        });
      }

      PerformanceTestUtils.startMeasurement('collision-detection');

      // Run collision detection multiple times
      for (let i = 0; i < 100; i++) {
        const collisions = engine.detectCollisions();
        engine.resolveCollisions(collisions);
      }

      const duration = PerformanceTestUtils.endMeasurement('collision-detection');

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should update many projectiles efficiently', () => {
      // Create stress scenario with projectiles
      for (let i = 0; i < 100; i++) {
        engine.fireProjectile('test-player', {
          x: Math.random() * 800,
          y: Math.random() * 600
        });
      }

      PerformanceTestUtils.startMeasurement('projectile-updates');

      // Update projectiles multiple times
      for (let frame = 0; frame < 60; frame++) {
        engine.updatePhysics(0.016); // 60 FPS frame time
      }

      const duration = PerformanceTestUtils.endMeasurement('projectile-updates');

      expect(duration).toBeLessThan(100); // Should handle 100 projectiles efficiently
    });
  });

  describe('Stress Testing', () => {
    it('should handle maximum recommended player count', () => {
      const maxPlayers = 16; // Typical maximum for real-time games

      PerformanceTestUtils.startMeasurement('max-players-stress');

      engine.generateStressScenario(maxPlayers, 0);

      // Run simulation for multiple frames
      for (let frame = 0; frame < 60; frame++) {
        engine.update(performance.now());
      }

      const duration = PerformanceTestUtils.endMeasurement('max-players-stress');
      const avgFrameTime = duration / 60;

      expect(avgFrameTime).toBeLessThan(16.67); // Should maintain 60 FPS
      expect(engine.getPlayerCount()).toBe(maxPlayers);
    });

    it('should handle heavy projectile load', () => {
      engine.addPlayer('shooter-1');
      engine.addPlayer('shooter-2');

      PerformanceTestUtils.startMeasurement('heavy-projectile-load');

      // Fire many projectiles rapidly
      for (let i = 0; i < 200; i++) {
        engine.fireProjectile('shooter-1', {
          x: Math.random() * 800,
          y: Math.random() * 600
        });

        if (i % 2 === 0) {
          engine.fireProjectile('shooter-2', {
            x: Math.random() * 800,
            y: Math.random() * 600
          });
        }
      }

      // Update simulation
      for (let frame = 0; frame < 60; frame++) {
        engine.update(performance.now());
      }

      const duration = PerformanceTestUtils.endMeasurement('heavy-projectile-load');

      expect(duration).toBeLessThan(500); // Should handle heavy load
      expect(engine.getProjectileCount()).toBeGreaterThan(0);
    });

    it('should maintain performance under combined stress', () => {
      PerformanceTestUtils.startMeasurement('combined-stress');

      // Create worst-case scenario
      engine.generateStressScenario(12, 50); // 12 players, 50 projectiles

      // Simulate intense gameplay for 120 frames (2 seconds at 60 FPS)
      const frameResults: number[] = [];

      for (let frame = 0; frame < 120; frame++) {
        const frameStart = performance.now();
        engine.update(frameStart);

        // Add more projectiles during simulation
        if (frame % 10 === 0) {
          engine.fireProjectile(`stress-player-${frame % 12}`, {
            x: Math.random() * 800,
            y: Math.random() * 600
          });
        }

        const frameTime = performance.now() - frameStart;
        frameResults.push(frameTime);
      }

      const totalDuration = PerformanceTestUtils.endMeasurement('combined-stress');
      const avgFrameTime = frameResults.reduce((a, b) => a + b, 0) / frameResults.length;
      const maxFrameTime = Math.max(...frameResults);

      expect(avgFrameTime).toBeLessThan(12); // Average should be well under 16.67ms
      expect(maxFrameTime).toBeLessThan(25); // No single frame should be too slow
      expect(totalDuration).toBeLessThan(2500); // Total should be reasonable
    });
  });

  describe('Memory Performance', () => {
    it('should manage memory efficiently with many objects', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Create and destroy many objects
      for (let cycle = 0; cycle < 10; cycle++) {
        // Add objects
        engine.generateStressScenario(20, 100);

        // Run simulation
        for (let frame = 0; frame < 60; frame++) {
          engine.update(performance.now());
        }

        // Reset (cleanup)
        engine.reset();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('should handle object lifecycle efficiently', () => {
      PerformanceTestUtils.startMeasurement('object-lifecycle');

      // Rapidly create and destroy objects
      for (let i = 0; i < 1000; i++) {
        engine.addPlayer(`temp-player-${i}`);

        if (i % 10 === 0) {
          // Remove some players
          for (let j = Math.max(0, i - 10); j < i; j++) {
            engine.removePlayer(`temp-player-${j}`);
          }
        }
      }

      const duration = PerformanceTestUtils.endMeasurement('object-lifecycle');

      expect(duration).toBeLessThan(100); // Should handle rapid creation/destruction
    });
  });

  describe('Network Simulation Performance', () => {
    it('should maintain performance with simulated network latency', async () => {
      engine.addPlayer('local-player');
      engine.addPlayer('remote-player-1');
      engine.addPlayer('remote-player-2');

      PerformanceTestUtils.startMeasurement('network-simulation');

      // Simulate networked gameplay with latency
      for (let frame = 0; frame < 60; frame++) {
        engine.update(performance.now());

        // Simulate network updates every few frames
        if (frame % 5 === 0) {
          await engine.simulateNetworkLatency();
        }

        // Add some actions
        if (frame % 10 === 0) {
          engine.fireProjectile('local-player', {
            x: Math.random() * 800,
            y: Math.random() * 600
          });
        }
      }

      const duration = PerformanceTestUtils.endMeasurement('network-simulation');

      // Should complete in reasonable time despite latency simulation
      expect(duration).toBeLessThan(5000); // 5 seconds max for 60 frames with latency
    });

    it('should handle state synchronization efficiently', () => {
      // Add multiple players
      for (let i = 0; i < 8; i++) {
        engine.addPlayer(`sync-player-${i}`);
      }

      PerformanceTestUtils.startMeasurement('state-sync');

      // Simulate state synchronization overhead
      for (let sync = 0; sync < 100; sync++) {
        // Simulate receiving state updates
        const gameState = {
          players: Array.from(engine['players'].values()),
          projectiles: [...engine['projectiles']],
          timestamp: performance.now()
        };

        // Simulate processing state update
        const serialized = JSON.stringify(gameState);
        const deserialized = JSON.parse(serialized);

        // Simulate applying state update
        engine.update(performance.now());
      }

      const duration = PerformanceTestUtils.endMeasurement('state-sync');

      expect(duration).toBeLessThan(200); // State sync should be fast
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical 4-player battle scenario', () => {
      // Setup typical multiplayer scenario
      for (let i = 0; i < 4; i++) {
        engine.addPlayer(`battle-player-${i}`, {
          position: {
            x: 200 + i * 150,
            y: 200 + i * 100
          }
        });
      }

      PerformanceTestUtils.startMeasurement('battle-scenario');

      // Simulate 30 seconds of intense battle (1800 frames at 60 FPS)
      for (let frame = 0; frame < 1800; frame++) {
        engine.update(performance.now());

        // Players shoot frequently
        if (frame % 15 === 0) { // 4 shots per second
          const shooterId = `battle-player-${frame % 4}`;
          engine.fireProjectile(shooterId, {
            x: 200 + Math.random() * 400,
            y: 200 + Math.random() * 200
          });
        }
      }

      const duration = PerformanceTestUtils.endMeasurement('battle-scenario');
      const avgFrameTime = duration / 1800;

      expect(avgFrameTime).toBeLessThan(10); // Should maintain performance
      expect(engine.getFrameCount()).toBe(1800);
    });

    it('should handle player joining/leaving during gameplay', () => {
      engine.addPlayer('persistent-player');

      PerformanceTestUtils.startMeasurement('dynamic-players');

      // Simulate players joining and leaving
      for (let frame = 0; frame < 600; frame++) {
        engine.update(performance.now());

        // Add player every 30 frames
        if (frame % 30 === 0 && engine.getPlayerCount() < 8) {
          engine.addPlayer(`dynamic-player-${frame}`);
        }

        // Remove player every 45 frames
        if (frame % 45 === 0 && engine.getPlayerCount() > 2) {
          const playerToRemove = `dynamic-player-${frame - 90}`;
          engine.removePlayer(playerToRemove);
        }

        // Continue shooting
        if (frame % 20 === 0) {
          engine.fireProjectile('persistent-player', {
            x: Math.random() * 800,
            y: Math.random() * 600
          });
        }
      }

      const duration = PerformanceTestUtils.endMeasurement('dynamic-players');

      expect(duration).toBeLessThan(2000); // Should handle dynamic changes efficiently
      expect(engine.getPlayerCount()).toBeGreaterThan(0);
    });
  });

  describe('Performance Regression Tests', () => {
    it('should not degrade performance over time', () => {
      engine.addPlayer('regression-player-1');
      engine.addPlayer('regression-player-2');

      const performanceSnapshots: number[] = [];

      // Take performance snapshots over time
      for (let segment = 0; segment < 10; segment++) {
        PerformanceTestUtils.startMeasurement(`segment-${segment}`);

        // Run 60 frames
        for (let frame = 0; frame < 60; frame++) {
          engine.update(performance.now());

          if (frame % 10 === 0) {
            engine.fireProjectile('regression-player-1', {
              x: Math.random() * 800,
              y: Math.random() * 600
            });
          }
        }

        const segmentTime = PerformanceTestUtils.endMeasurement(`segment-${segment}`);
        performanceSnapshots.push(segmentTime);
      }

      // Performance should remain consistent
      const firstThird = performanceSnapshots.slice(0, 3);
      const lastThird = performanceSnapshots.slice(-3);

      const avgFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
      const avgLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

      // Last third should not be significantly slower than first third
      expect(avgLast).toBeLessThan(avgFirst * 1.2); // Allow 20% variance
    });

    it('should maintain consistent frame timing', () => {
      engine.generateStressScenario(6, 30);

      const frameTimes: number[] = [];

      // Measure individual frame times
      for (let frame = 0; frame < 300; frame++) {
        const frameStart = performance.now();
        engine.update(frameStart);
        const frameTime = performance.now() - frameStart;
        frameTimes.push(frameTime);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      const minFrameTime = Math.min(...frameTimes);

      expect(avgFrameTime).toBeLessThan(12); // Good average performance
      expect(maxFrameTime).toBeLessThan(25); // No frame should be too slow
      expect(maxFrameTime - minFrameTime).toBeLessThan(20); // Consistent timing
    });
  });
});