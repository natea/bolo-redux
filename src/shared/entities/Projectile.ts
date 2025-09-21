/**
 * Projectile system for Bolo game
 * Handles bullet physics, ballistics, and impact mechanics
 */

import { Vector2D } from '../core/Vector2D';
import { GAME_CONSTANTS } from '../core/GameConstants';
import { PhysicsBody } from '../physics/PhysicsEngine';

export interface ProjectileState {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  damage: number;
  ownerId: string;
  creationTime: number;
  isDestroyed: boolean;
  hasExploded: boolean;
  trailPoints: Vector2D[];
}

export enum ProjectileType {
  BULLET = 'bullet',
  SHELL = 'shell',
  ROCKET = 'rocket',
  PLASMA = 'plasma'
}

export interface ProjectileConfig {
  type: ProjectileType;
  speed: number;
  damage: number;
  lifetime: number;
  hasGravity: boolean;
  gravityEffect: number;
  explosionRadius?: number;
  piercing?: boolean;
  homing?: boolean;
  homingTarget?: string;
  trailLength?: number;
}

export class Projectile {
  private state: ProjectileState;
  private physicsBody: PhysicsBody;
  private config: ProjectileConfig;
  private initialVelocity: Vector2D;

  constructor(
    id: string,
    position: Vector2D,
    direction: Vector2D,
    ownerId: string,
    config: Partial<ProjectileConfig> = {}
  ) {
    // Apply default configuration
    this.config = {
      type: ProjectileType.BULLET,
      speed: GAME_CONSTANTS.PROJECTILE.SPEED,
      damage: GAME_CONSTANTS.PROJECTILE.DAMAGE,
      lifetime: GAME_CONSTANTS.PROJECTILE.LIFETIME,
      hasGravity: false,
      gravityEffect: GAME_CONSTANTS.PROJECTILE.GRAVITY_EFFECT,
      trailLength: 10,
      ...config
    };

    this.initialVelocity = direction.normalize().multiply(this.config.speed);

    this.state = {
      id,
      position: position.clone(),
      velocity: this.initialVelocity.clone(),
      rotation: direction.angle(),
      damage: this.config.damage,
      ownerId,
      creationTime: Date.now(),
      isDestroyed: false,
      hasExploded: false,
      trailPoints: [position.clone()]
    };

    this.physicsBody = {
      id,
      position: position.clone(),
      velocity: this.initialVelocity.clone(),
      acceleration: Vector2D.zero(),
      rotation: direction.angle(),
      angularVelocity: 0,
      mass: 1,
      collisionRadius: GAME_CONSTANTS.PROJECTILE.COLLISION_RADIUS,
      collisionLayer: GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE,
      collisionMask: GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN |
                    GAME_CONSTANTS.COLLISION_LAYERS.TANK,
      isStatic: false,
      friction: 1.0, // No friction for projectiles
      bounciness: 0.0, // Projectiles don't bounce by default
      onCollision: this.handleCollision.bind(this)
    };
  }

  update(deltaTime: number, currentTime: number): void {
    if (this.state.isDestroyed) return;

    // Check lifetime
    if (currentTime - this.state.creationTime > this.config.lifetime) {
      this.destroy();
      return;
    }

    this.updatePhysics(deltaTime);
    this.updateHoming(deltaTime);
    this.updateTrail();
    this.syncStateWithPhysics();
  }

  private updatePhysics(deltaTime: number): void {
    // Apply gravity effect if enabled
    if (this.config.hasGravity) {
      const gravityForce = new Vector2D(0, this.config.gravityEffect);
      this.physicsBody.acceleration.addInPlace(gravityForce);
    }

    // Apply air resistance
    const airResistance = this.physicsBody.velocity.multiply(-0.01);
    this.physicsBody.acceleration.addInPlace(airResistance);

    // Update rotation to match velocity direction
    if (this.physicsBody.velocity.magnitude() > 0.1) {
      this.physicsBody.rotation = this.physicsBody.velocity.angle();
    }
  }

  private updateHoming(deltaTime: number): void {
    if (!this.config.homing || !this.config.homingTarget) return;

    // Implement basic homing behavior
    // This would need access to target position from game state
    // For now, just maintain straight trajectory
  }

  private updateTrail(): void {
    if (!this.config.trailLength || this.config.trailLength <= 0) return;

    this.state.trailPoints.push(this.state.position.clone());

    if (this.state.trailPoints.length > this.config.trailLength) {
      this.state.trailPoints.shift();
    }
  }

  private syncStateWithPhysics(): void {
    this.state.position = this.physicsBody.position.clone();
    this.state.velocity = this.physicsBody.velocity.clone();
    this.state.rotation = this.physicsBody.rotation;
  }

  private handleCollision(other: PhysicsBody, point: Vector2D, normal: Vector2D): void {
    if (this.state.isDestroyed) return;

    // Don't collide with owner initially (prevents self-hits)
    if (other.id === this.state.ownerId) {
      const timeSinceCreation = Date.now() - this.state.creationTime;
      if (timeSinceCreation < 100) return; // 100ms grace period
    }

    // Handle terrain collision
    if (other.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN) {
      this.hitTerrain(point, normal);
      return;
    }

    // Handle tank collision
    if (other.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TANK) {
      this.hitTarget(other.id, point);
      return;
    }
  }

  private hitTerrain(point: Vector2D, normal: Vector2D): void {
    if (this.config.type === ProjectileType.ROCKET && this.config.explosionRadius) {
      this.explode(point);
    } else {
      this.destroy();
    }
  }

  private hitTarget(targetId: string, point: Vector2D): void {
    // Mark for damage application by game system
    this.state.hasExploded = true;

    if (this.config.explosionRadius) {
      this.explode(point);
    } else if (!this.config.piercing) {
      this.destroy();
    }
  }

  private explode(point: Vector2D): void {
    this.state.hasExploded = true;
    this.state.position = point.clone();
    this.destroy();
  }

  destroy(): void {
    this.state.isDestroyed = true;
    this.physicsBody.velocity = Vector2D.zero();
    this.physicsBody.acceleration = Vector2D.zero();
  }

  // Damage calculation for area effects
  calculateDamageAtPosition(position: Vector2D): number {
    if (!this.config.explosionRadius) {
      return this.state.damage;
    }

    const distance = this.state.position.distance(position);
    if (distance > this.config.explosionRadius) {
      return 0;
    }

    // Linear damage falloff
    const falloff = 1 - (distance / this.config.explosionRadius);
    return this.state.damage * falloff;
  }

  // Getters
  getState(): Readonly<ProjectileState> {
    return this.state;
  }

  getPhysicsBody(): PhysicsBody {
    return this.physicsBody;
  }

  getConfig(): Readonly<ProjectileConfig> {
    return this.config;
  }

  getPosition(): Vector2D {
    return this.state.position.clone();
  }

  getVelocity(): Vector2D {
    return this.state.velocity.clone();
  }

  getRotation(): number {
    return this.state.rotation;
  }

  getDamage(): number {
    return this.state.damage;
  }

  getOwnerId(): string {
    return this.state.ownerId;
  }

  isDestroyed(): boolean {
    return this.state.isDestroyed;
  }

  hasExploded(): boolean {
    return this.state.hasExploded;
  }

  getTrailPoints(): Vector2D[] {
    return [...this.state.trailPoints];
  }

  getExplosionRadius(): number {
    return this.config.explosionRadius || 0;
  }

  // Utility methods
  getRemainingLifetime(): number {
    const elapsed = Date.now() - this.state.creationTime;
    return Math.max(0, this.config.lifetime - elapsed);
  }

  getLifetimePercentage(): number {
    const elapsed = Date.now() - this.state.creationTime;
    return Math.min(1, elapsed / this.config.lifetime);
  }

  // Serialization
  serialize(): any {
    return {
      ...this.state,
      position: this.state.position.toObject(),
      velocity: this.state.velocity.toObject(),
      trailPoints: this.state.trailPoints.map(p => p.toObject()),
      config: this.config
    };
  }

  static deserialize(data: any): Projectile {
    const projectile = new Projectile(
      data.id,
      Vector2D.fromObject(data.position),
      Vector2D.fromObject(data.velocity).normalize(),
      data.ownerId,
      data.config
    );

    projectile.state = {
      ...data,
      position: Vector2D.fromObject(data.position),
      velocity: Vector2D.fromObject(data.velocity),
      trailPoints: data.trailPoints.map((p: any) => Vector2D.fromObject(p))
    };

    return projectile;
  }
}

// Factory functions for common projectile types
export class ProjectileFactory {
  static createBullet(id: string, position: Vector2D, direction: Vector2D, ownerId: string): Projectile {
    return new Projectile(id, position, direction, ownerId, {
      type: ProjectileType.BULLET,
      speed: GAME_CONSTANTS.PROJECTILE.SPEED,
      damage: GAME_CONSTANTS.PROJECTILE.DAMAGE,
      lifetime: GAME_CONSTANTS.PROJECTILE.LIFETIME,
      hasGravity: false,
      trailLength: 5
    });
  }

  static createShell(id: string, position: Vector2D, direction: Vector2D, ownerId: string): Projectile {
    return new Projectile(id, position, direction, ownerId, {
      type: ProjectileType.SHELL,
      speed: GAME_CONSTANTS.PROJECTILE.SPEED * 0.8,
      damage: GAME_CONSTANTS.PROJECTILE.DAMAGE * 1.5,
      lifetime: GAME_CONSTANTS.PROJECTILE.LIFETIME * 1.2,
      hasGravity: true,
      gravityEffect: GAME_CONSTANTS.PROJECTILE.GRAVITY_EFFECT,
      trailLength: 8
    });
  }

  static createRocket(id: string, position: Vector2D, direction: Vector2D, ownerId: string): Projectile {
    return new Projectile(id, position, direction, ownerId, {
      type: ProjectileType.ROCKET,
      speed: GAME_CONSTANTS.PROJECTILE.SPEED * 1.2,
      damage: GAME_CONSTANTS.PROJECTILE.DAMAGE * 2,
      lifetime: GAME_CONSTANTS.PROJECTILE.LIFETIME * 1.5,
      hasGravity: false,
      explosionRadius: GAME_CONSTANTS.EFFECTS.EXPLOSION_RADIUS,
      trailLength: 15
    });
  }

  static createPlasma(id: string, position: Vector2D, direction: Vector2D, ownerId: string): Projectile {
    return new Projectile(id, position, direction, ownerId, {
      type: ProjectileType.PLASMA,
      speed: GAME_CONSTANTS.PROJECTILE.SPEED * 1.5,
      damage: GAME_CONSTANTS.PROJECTILE.DAMAGE * 1.8,
      lifetime: GAME_CONSTANTS.PROJECTILE.LIFETIME * 0.8,
      hasGravity: false,
      piercing: true,
      trailLength: 20
    });
  }
}