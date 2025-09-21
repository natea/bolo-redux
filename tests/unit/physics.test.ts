import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsTestUtils, PerformanceTestUtils } from '../utils/test-helpers';

// Game physics engine implementation for testing
class PhysicsEngine {
  gravity: number = 0.5;
  friction: number = 0.98;

  updatePosition(object: any, deltaTime: number) {
    object.position.x += object.velocity.x * deltaTime;
    object.position.y += object.velocity.y * deltaTime;

    // Apply friction
    object.velocity.x *= this.friction;
    object.velocity.y *= this.friction;

    // Apply gravity
    object.velocity.y += this.gravity * deltaTime;
  }

  checkCollision(obj1: any, obj2: any): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (obj1.radius + obj2.radius);
  }

  resolveCollision(obj1: any, obj2: any) {
    if (!this.checkCollision(obj1, obj2)) return;

    // Simple elastic collision
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = obj2.velocity.x - obj1.velocity.x;
    const dvy = obj2.velocity.y - obj1.velocity.y;

    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;

    // Do not resolve if velocities are separating
    if (dvn > 0) return;

    // Collision impulse
    const impulse = (2 * dvn) / (obj1.mass + obj2.mass);

    // Update velocities
    obj1.velocity.x += impulse * obj2.mass * nx;
    obj1.velocity.y += impulse * obj2.mass * ny;
    obj2.velocity.x -= impulse * obj1.mass * nx;
    obj2.velocity.y -= impulse * obj1.mass * ny;
  }

  calculateProjectileTrajectory(startPos: any, velocity: any, time: number) {
    return {
      x: startPos.x + velocity.x * time,
      y: startPos.y + velocity.y * time + 0.5 * this.gravity * time * time
    };
  }

  isWithinBounds(object: any, bounds: any): boolean {
    return object.position.x >= bounds.x &&
           object.position.x <= bounds.x + bounds.width &&
           object.position.y >= bounds.y &&
           object.position.y <= bounds.y + bounds.height;
  }
}

describe('Physics Engine Tests', () => {
  let physics: PhysicsEngine;

  beforeEach(() => {
    physics = new PhysicsEngine();
    PerformanceTestUtils.reset();
  });

  describe('Collision Detection', () => {
    it('should detect collision between two overlapping objects', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        radius: 15,
        mass: 1
      };

      const obj2 = {
        position: { x: 105, y: 105 },
        radius: 15,
        mass: 1
      };

      expect(physics.checkCollision(obj1, obj2)).toBe(true);
    });

    it('should not detect collision between distant objects', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        radius: 10,
        mass: 1
      };

      const obj2 = {
        position: { x: 150, y: 150 },
        radius: 10,
        mass: 1
      };

      expect(physics.checkCollision(obj1, obj2)).toBe(false);
    });

    it('should detect collision at exact boundary distance', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        radius: 10,
        mass: 1
      };

      const obj2 = {
        position: { x: 120, y: 100 }, // exactly 20 units apart (10 + 10 radius)
        radius: 10,
        mass: 1
      };

      expect(physics.checkCollision(obj1, obj2)).toBe(true);
    });

    it('should handle zero-radius objects', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        radius: 0,
        mass: 1
      };

      const obj2 = {
        position: { x: 100, y: 100 },
        radius: 0,
        mass: 1
      };

      expect(physics.checkCollision(obj1, obj2)).toBe(true);
    });
  });

  describe('Position Updates', () => {
    it('should update object position based on velocity', () => {
      const object = {
        position: { x: 100, y: 100 },
        velocity: { x: 5, y: -3 },
        radius: 10,
        mass: 1
      };

      physics.updatePosition(object, 1.0); // 1 second

      expect(object.position.x).toBeCloseTo(105);
      expect(object.position.y).toBeCloseTo(97.5); // includes gravity
    });

    it('should apply friction to velocity', () => {
      const object = {
        position: { x: 100, y: 100 },
        velocity: { x: 10, y: 10 },
        radius: 10,
        mass: 1
      };

      const initialVelX = object.velocity.x;
      const initialVelY = object.velocity.y;

      physics.updatePosition(object, 1.0);

      expect(object.velocity.x).toBeLessThan(initialVelX);
      expect(object.velocity.y).toBeLessThan(initialVelY + physics.gravity);
    });

    it('should apply gravity to vertical velocity', () => {
      const object = {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
        radius: 10,
        mass: 1
      };

      physics.updatePosition(object, 1.0);

      expect(object.velocity.y).toBeCloseTo(physics.gravity);
    });
  });

  describe('Collision Resolution', () => {
    it('should resolve collision between two moving objects', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        velocity: { x: 5, y: 0 },
        radius: 10,
        mass: 1
      };

      const obj2 = {
        position: { x: 105, y: 100 },
        velocity: { x: -3, y: 0 },
        radius: 10,
        mass: 1
      };

      const initialVel1X = obj1.velocity.x;
      const initialVel2X = obj2.velocity.x;

      physics.resolveCollision(obj1, obj2);

      // Velocities should change after collision
      expect(obj1.velocity.x).not.toEqual(initialVel1X);
      expect(obj2.velocity.x).not.toEqual(initialVel2X);
    });

    it('should conserve momentum in collision', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        velocity: { x: 5, y: 0 },
        radius: 10,
        mass: 2
      };

      const obj2 = {
        position: { x: 105, y: 100 },
        velocity: { x: -3, y: 0 },
        radius: 10,
        mass: 1
      };

      const initialMomentum = obj1.mass * obj1.velocity.x + obj2.mass * obj2.velocity.x;

      physics.resolveCollision(obj1, obj2);

      const finalMomentum = obj1.mass * obj1.velocity.x + obj2.mass * obj2.velocity.x;

      expect(finalMomentum).toBeCloseTo(initialMomentum, 5);
    });

    it('should not resolve collision for separating objects', () => {
      const obj1 = {
        position: { x: 100, y: 100 },
        velocity: { x: -5, y: 0 },
        radius: 10,
        mass: 1
      };

      const obj2 = {
        position: { x: 105, y: 100 },
        velocity: { x: 3, y: 0 },
        radius: 10,
        mass: 1
      };

      const initialVel1X = obj1.velocity.x;
      const initialVel2X = obj2.velocity.x;

      physics.resolveCollision(obj1, obj2);

      // Velocities should remain unchanged for separating objects
      expect(obj1.velocity.x).toEqual(initialVel1X);
      expect(obj2.velocity.x).toEqual(initialVel2X);
    });
  });

  describe('Projectile Trajectories', () => {
    it('should calculate projectile position at given time', () => {
      const startPos = { x: 100, y: 100 };
      const velocity = { x: 10, y: -5 };
      const time = 2.0;

      const position = physics.calculateProjectileTrajectory(startPos, velocity, time);

      expect(position.x).toBeCloseTo(120); // 100 + 10 * 2
      expect(position.y).toBeCloseTo(91);  // 100 + (-5 * 2) + 0.5 * 0.5 * 4
    });

    it('should handle zero initial velocity', () => {
      const startPos = { x: 100, y: 100 };
      const velocity = { x: 0, y: 0 };
      const time = 1.0;

      const position = physics.calculateProjectileTrajectory(startPos, velocity, time);

      expect(position.x).toEqual(100);
      expect(position.y).toBeCloseTo(100.25); // gravity effect
    });

    it('should calculate trajectory for multiple time points', () => {
      const startPos = { x: 0, y: 0 };
      const velocity = { x: 10, y: 10 };

      const positions = [];
      for (let t = 0; t <= 2; t += 0.5) {
        positions.push(physics.calculateProjectileTrajectory(startPos, velocity, t));
      }

      expect(positions).toHaveLength(5);
      expect(positions[0]).toEqual({ x: 0, y: 0 });
      expect(positions[4].x).toBeCloseTo(20);
      expect(positions[4].y).toBeCloseTo(21); // includes gravity
    });
  });

  describe('Boundary Checking', () => {
    it('should detect object within bounds', () => {
      const object = {
        position: { x: 100, y: 100 },
        radius: 10
      };

      const bounds = { x: 0, y: 0, width: 200, height: 200 };

      expect(physics.isWithinBounds(object, bounds)).toBe(true);
    });

    it('should detect object outside bounds', () => {
      const object = {
        position: { x: 250, y: 100 },
        radius: 10
      };

      const bounds = { x: 0, y: 0, width: 200, height: 200 };

      expect(physics.isWithinBounds(object, bounds)).toBe(false);
    });

    it('should handle objects at boundary edges', () => {
      const bounds = { x: 0, y: 0, width: 200, height: 200 };

      const objectAtOrigin = { position: { x: 0, y: 0 }, radius: 10 };
      const objectAtCorner = { position: { x: 200, y: 200 }, radius: 10 };

      expect(physics.isWithinBounds(objectAtOrigin, bounds)).toBe(true);
      expect(physics.isWithinBounds(objectAtCorner, bounds)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle collision detection efficiently for many objects', () => {
      const objects = Array.from({ length: 100 }, (_, i) => ({
        position: { x: i * 10, y: i * 10 },
        radius: 5,
        mass: 1
      }));

      PerformanceTestUtils.startMeasurement('collision-detection');

      let collisionCount = 0;
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          if (physics.checkCollision(objects[i], objects[j])) {
            collisionCount++;
          }
        }
      }

      const duration = PerformanceTestUtils.endMeasurement('collision-detection');

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
      expect(collisionCount).toBeGreaterThanOrEqual(0);
    });

    it('should update many object positions efficiently', () => {
      const objects = Array.from({ length: 1000 }, (_, i) => ({
        position: { x: i, y: i },
        velocity: { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5 },
        radius: 5,
        mass: 1
      }));

      PerformanceTestUtils.startMeasurement('position-updates');

      objects.forEach(obj => {
        physics.updatePosition(obj, 0.016); // 60 FPS frame time
      });

      const duration = PerformanceTestUtils.endMeasurement('position-updates');

      expect(duration).toBeLessThan(20); // Should complete in under 20ms for 60 FPS
    });

    it('should maintain consistent performance across multiple frames', () => {
      const objects = Array.from({ length: 50 }, (_, i) => ({
        position: { x: i * 10, y: i * 10 },
        velocity: { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5 },
        radius: 5,
        mass: 1
      }));

      const frameTimes: number[] = [];

      for (let frame = 0; frame < 60; frame++) {
        PerformanceTestUtils.startMeasurement(`frame-${frame}`);

        // Update all objects
        objects.forEach(obj => {
          physics.updatePosition(obj, 0.016);
        });

        // Check all collisions
        for (let i = 0; i < objects.length; i++) {
          for (let j = i + 1; j < objects.length; j++) {
            if (physics.checkCollision(objects[i], objects[j])) {
              physics.resolveCollision(objects[i], objects[j]);
            }
          }
        }

        frameTimes.push(PerformanceTestUtils.endMeasurement(`frame-${frame}`));
      }

      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      expect(averageFrameTime).toBeLessThan(16); // Should maintain 60 FPS
      expect(maxFrameTime).toBeLessThan(25); // No frame should take longer than 25ms
    });
  });
});