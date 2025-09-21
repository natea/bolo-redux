/**
 * Core physics engine for Bolo game mechanics
 * Handles movement, collision detection, and physics simulation
 */

import { Vector2D } from '../core/Vector2D';
import { GAME_CONSTANTS } from '../core/GameConstants';

export interface PhysicsBody {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  angularVelocity: number;
  mass: number;
  collisionRadius: number;
  collisionLayer: number;
  collisionMask: number;
  isStatic: boolean;
  friction: number;
  bounciness: number;
  onCollision?: (other: PhysicsBody, point: Vector2D, normal: Vector2D) => void;
}

export interface CollisionInfo {
  bodyA: PhysicsBody;
  bodyB: PhysicsBody;
  point: Vector2D;
  normal: Vector2D;
  penetration: number;
  relativeVelocity: Vector2D;
}

export class PhysicsEngine {
  private bodies: Map<string, PhysicsBody> = new Map();
  private spatialGrid: Map<string, Set<string>> = new Map();
  private gridSize: number = 64;
  private collisions: CollisionInfo[] = [];

  // Add/Remove bodies
  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
    this.updateSpatialGrid(body);
  }

  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.removeFromSpatialGrid(body);
      this.bodies.delete(id);
    }
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  // Main physics update
  update(deltaTime: number): CollisionInfo[] {
    this.collisions = [];

    // Update all body physics
    for (const body of this.bodies.values()) {
      if (!body.isStatic) {
        this.updateBodyPhysics(body, deltaTime);
        this.updateSpatialGrid(body);
      }
    }

    // Detect and resolve collisions
    this.detectCollisions();
    this.resolveCollisions();

    return [...this.collisions];
  }

  private updateBodyPhysics(body: PhysicsBody, deltaTime: number): void {
    // Apply physics forces
    body.velocity.addInPlace(body.acceleration.multiply(deltaTime));

    // Apply friction
    body.velocity.multiplyInPlace(Math.pow(body.friction, deltaTime));

    // Clamp velocity to maximum
    const maxVel = body.mass > 0 ? GAME_CONSTANTS.PHYSICS.MAX_VELOCITY : Infinity;
    body.velocity = body.velocity.clampMagnitude(maxVel);

    // Update position
    body.position.addInPlace(body.velocity.multiply(deltaTime));

    // Update rotation
    body.rotation += body.angularVelocity * deltaTime;

    // Apply angular friction
    body.angularVelocity *= Math.pow(GAME_CONSTANTS.PHYSICS.FRICTION, deltaTime);

    // Reset acceleration (forces need to be applied each frame)
    body.acceleration.set(0, 0);
  }

  // Spatial grid for efficient collision detection
  private updateSpatialGrid(body: PhysicsBody): void {
    this.removeFromSpatialGrid(body);

    const minX = Math.floor((body.position.x - body.collisionRadius) / this.gridSize);
    const maxX = Math.floor((body.position.x + body.collisionRadius) / this.gridSize);
    const minY = Math.floor((body.position.y - body.collisionRadius) / this.gridSize);
    const maxY = Math.floor((body.position.y + body.collisionRadius) / this.gridSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const cellKey = `${x},${y}`;
        if (!this.spatialGrid.has(cellKey)) {
          this.spatialGrid.set(cellKey, new Set());
        }
        this.spatialGrid.get(cellKey)!.add(body.id);
      }
    }
  }

  private removeFromSpatialGrid(body: PhysicsBody): void {
    for (const cell of this.spatialGrid.values()) {
      cell.delete(body.id);
    }
  }

  private detectCollisions(): void {
    const checkedPairs = new Set<string>();

    for (const cell of this.spatialGrid.values()) {
      const bodyIds = Array.from(cell);

      for (let i = 0; i < bodyIds.length; i++) {
        for (let j = i + 1; j < bodyIds.length; j++) {
          const bodyA = this.bodies.get(bodyIds[i])!;
          const bodyB = this.bodies.get(bodyIds[j])!;

          const pairKey = bodyA.id < bodyB.id ?
            `${bodyA.id}-${bodyB.id}` : `${bodyB.id}-${bodyA.id}`;

          if (checkedPairs.has(pairKey)) continue;
          checkedPairs.add(pairKey);

          // Check collision layers
          if ((bodyA.collisionMask & bodyB.collisionLayer) === 0 &&
              (bodyB.collisionMask & bodyA.collisionLayer) === 0) {
            continue;
          }

          const collision = this.checkCollision(bodyA, bodyB);
          if (collision) {
            this.collisions.push(collision);
          }
        }
      }
    }
  }

  private checkCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): CollisionInfo | null {
    const distance = bodyA.position.distance(bodyB.position);
    const combinedRadius = bodyA.collisionRadius + bodyB.collisionRadius;

    if (distance < combinedRadius) {
      const direction = bodyB.position.subtract(bodyA.position);
      const normal = distance > 0 ? direction.normalize() : Vector2D.right();
      const point = bodyA.position.add(normal.multiply(bodyA.collisionRadius));
      const penetration = combinedRadius - distance;

      const relativeVelocity = bodyB.velocity.subtract(bodyA.velocity);

      return {
        bodyA,
        bodyB,
        point,
        normal,
        penetration,
        relativeVelocity
      };
    }

    return null;
  }

  private resolveCollisions(): void {
    for (const collision of this.collisions) {
      this.resolveCollision(collision);
    }
  }

  private resolveCollision(collision: CollisionInfo): void {
    const { bodyA, bodyB, normal, penetration, relativeVelocity } = collision;

    // Separate bodies
    if (!bodyA.isStatic && !bodyB.isStatic) {
      const totalMass = bodyA.mass + bodyB.mass;
      const separationA = normal.multiply(-penetration * bodyB.mass / totalMass);
      const separationB = normal.multiply(penetration * bodyA.mass / totalMass);

      bodyA.position.addInPlace(separationA);
      bodyB.position.addInPlace(separationB);
    } else if (!bodyA.isStatic) {
      bodyA.position.addInPlace(normal.multiply(-penetration));
    } else if (!bodyB.isStatic) {
      bodyB.position.addInPlace(normal.multiply(penetration));
    }

    // Calculate collision response
    const relativeSpeed = relativeVelocity.dot(normal);
    if (relativeSpeed > 0) return; // Bodies separating

    const restitution = Math.min(bodyA.bounciness, bodyB.bounciness);
    const impulseScalar = -(1 + restitution) * relativeSpeed;

    if (!bodyA.isStatic && !bodyB.isStatic) {
      const totalMass = bodyA.mass + bodyB.mass;
      const impulseA = normal.multiply(-impulseScalar * bodyB.mass / totalMass);
      const impulseB = normal.multiply(impulseScalar * bodyA.mass / totalMass);

      bodyA.velocity.addInPlace(impulseA);
      bodyB.velocity.addInPlace(impulseB);
    } else if (!bodyA.isStatic) {
      const impulse = normal.multiply(-impulseScalar);
      bodyA.velocity.addInPlace(impulse);
    } else if (!bodyB.isStatic) {
      const impulse = normal.multiply(impulseScalar);
      bodyB.velocity.addInPlace(impulse);
    }

    // Apply collision callbacks
    if (bodyA.onCollision) {
      bodyA.onCollision(bodyB, collision.point, normal);
    }
    if (bodyB.onCollision) {
      bodyB.onCollision(bodyA, collision.point, normal.multiply(-1));
    }
  }

  // Utility methods
  applyForce(bodyId: string, force: Vector2D): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      body.acceleration.addInPlace(force.divide(body.mass));
    }
  }

  applyImpulse(bodyId: string, impulse: Vector2D): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      body.velocity.addInPlace(impulse.divide(body.mass));
    }
  }

  applyTorque(bodyId: string, torque: number): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      // Simplified torque application (assuming moment of inertia = mass)
      body.angularVelocity += torque / body.mass;
    }
  }

  // Query methods
  queryPoint(point: Vector2D, layer?: number): PhysicsBody[] {
    const results: PhysicsBody[] = [];

    for (const body of this.bodies.values()) {
      if (layer !== undefined && (body.collisionLayer & layer) === 0) continue;

      if (body.position.distance(point) <= body.collisionRadius) {
        results.push(body);
      }
    }

    return results;
  }

  queryCircle(center: Vector2D, radius: number, layer?: number): PhysicsBody[] {
    const results: PhysicsBody[] = [];

    for (const body of this.bodies.values()) {
      if (layer !== undefined && (body.collisionLayer & layer) === 0) continue;

      if (body.position.distance(center) <= radius + body.collisionRadius) {
        results.push(body);
      }
    }

    return results;
  }

  raycast(origin: Vector2D, direction: Vector2D, maxDistance: number, layer?: number): PhysicsBody | null {
    let closestBody: PhysicsBody | null = null;
    let closestDistance = maxDistance;

    const normalizedDirection = direction.normalize();

    for (const body of this.bodies.values()) {
      if (layer !== undefined && (body.collisionLayer & layer) === 0) continue;

      // Simple ray-circle intersection
      const toBody = body.position.subtract(origin);
      const projection = toBody.dot(normalizedDirection);

      if (projection < 0 || projection > maxDistance) continue;

      const closestPoint = origin.add(normalizedDirection.multiply(projection));
      const distance = body.position.distance(closestPoint);

      if (distance <= body.collisionRadius && projection < closestDistance) {
        closestBody = body;
        closestDistance = projection;
      }
    }

    return closestBody;
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      bodyCount: this.bodies.size,
      collisionCount: this.collisions.length,
      gridCells: this.spatialGrid.size,
    };
  }
}