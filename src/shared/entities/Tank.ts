/**
 * Tank entity implementation with physics, controls, and combat mechanics
 * Core gameplay entity for the Bolo game
 */

import { Vector2D } from '../core/Vector2D';
import { GAME_CONSTANTS } from '../core/GameConstants';
import { PhysicsBody } from '../physics/PhysicsEngine';

export interface TankState {
  id: string;
  position: Vector2D;
  rotation: number;
  velocity: Vector2D;
  health: number;
  fuel: number;
  ammo: number;
  lastFireTime: number;
  powerups: PowerupEffect[];
  kills: number;
  deaths: number;
  isDestroyed: boolean;
  respawnTime?: number;
}

export interface PowerupEffect {
  type: PowerupType;
  endTime: number;
  multiplier?: number;
}

export enum PowerupType {
  SPEED_BOOST = 'speed_boost',
  DAMAGE_BOOST = 'damage_boost',
  ARMOR_BOOST = 'armor_boost',
  RAPID_FIRE = 'rapid_fire',
  SHIELD = 'shield',
  INVISIBILITY = 'invisibility'
}

export interface TankControls {
  forward: boolean;
  backward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  fire: boolean;
  brake: boolean;
}

export class Tank {
  private state: TankState;
  private physicsBody: PhysicsBody;
  private controls: TankControls = {
    forward: false,
    backward: false,
    turnLeft: false,
    turnRight: false,
    fire: false,
    brake: false
  };

  constructor(id: string, startPosition: Vector2D, startRotation: number = 0) {
    this.state = {
      id,
      position: startPosition.clone(),
      rotation: startRotation,
      velocity: Vector2D.zero(),
      health: GAME_CONSTANTS.TANK.MAX_HEALTH,
      fuel: GAME_CONSTANTS.TANK.FUEL_CAPACITY,
      ammo: 50, // Starting ammo
      lastFireTime: 0,
      powerups: [],
      kills: 0,
      deaths: 0,
      isDestroyed: false
    };

    this.physicsBody = {
      id,
      position: startPosition.clone(),
      velocity: Vector2D.zero(),
      acceleration: Vector2D.zero(),
      rotation: startRotation,
      angularVelocity: 0,
      mass: 100,
      collisionRadius: GAME_CONSTANTS.TANK.COLLISION_RADIUS,
      collisionLayer: GAME_CONSTANTS.COLLISION_LAYERS.TANK,
      collisionMask: GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN |
                    GAME_CONSTANTS.COLLISION_LAYERS.TANK |
                    GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE,
      isStatic: false,
      friction: GAME_CONSTANTS.PHYSICS.FRICTION,
      bounciness: GAME_CONSTANTS.PHYSICS.BOUNCE_DAMPING,
      onCollision: this.handleCollision.bind(this)
    };
  }

  // Update tank physics and state
  update(deltaTime: number, currentTime: number): void {
    if (this.state.isDestroyed) {
      this.handleRespawn(currentTime);
      return;
    }

    this.updatePowerups(currentTime);
    this.processControls(deltaTime);
    this.updateFuel(deltaTime);
    this.syncStateWithPhysics();
  }

  private updatePowerups(currentTime: number): void {
    this.state.powerups = this.state.powerups.filter(
      powerup => powerup.endTime > currentTime
    );
  }

  private processControls(deltaTime: number): void {
    const { forward, backward, turnLeft, turnRight, brake } = this.controls;

    // Calculate movement multipliers from powerups
    const speedMultiplier = this.getActivePowerupMultiplier(PowerupType.SPEED_BOOST);
    const baseAcceleration = GAME_CONSTANTS.PHYSICS.ACCELERATION * speedMultiplier;

    // Handle rotation
    if (turnLeft && !turnRight) {
      this.physicsBody.angularVelocity = -GAME_CONSTANTS.PHYSICS.ROTATION_SPEED;
    } else if (turnRight && !turnLeft) {
      this.physicsBody.angularVelocity = GAME_CONSTANTS.PHYSICS.ROTATION_SPEED;
    } else {
      this.physicsBody.angularVelocity *= 0.8; // Gradual stop
    }

    // Handle movement
    const forwardDirection = Vector2D.fromAngle(this.physicsBody.rotation);

    if (forward && !backward && this.state.fuel > 0) {
      this.physicsBody.acceleration = forwardDirection.multiply(baseAcceleration);
    } else if (backward && !forward && this.state.fuel > 0) {
      this.physicsBody.acceleration = forwardDirection.multiply(-baseAcceleration * 0.7);
    } else {
      this.physicsBody.acceleration = Vector2D.zero();
    }

    // Apply braking
    if (brake) {
      this.physicsBody.velocity.multiplyInPlace(0.9);
    }
  }

  private updateFuel(deltaTime: number): void {
    const velocityMagnitude = this.physicsBody.velocity.magnitude();
    if (velocityMagnitude > 0.1) {
      const fuelConsumption = GAME_CONSTANTS.TANK.FUEL_CONSUMPTION_RATE *
                             velocityMagnitude * deltaTime;
      this.state.fuel = Math.max(0, this.state.fuel - fuelConsumption);
    }
  }

  private syncStateWithPhysics(): void {
    this.state.position = this.physicsBody.position.clone();
    this.state.rotation = this.physicsBody.rotation;
    this.state.velocity = this.physicsBody.velocity.clone();
  }

  // Controls
  setControls(controls: Partial<TankControls>): void {
    Object.assign(this.controls, controls);
  }

  getControls(): TankControls {
    return { ...this.controls };
  }

  // Combat
  canFire(currentTime: number): boolean {
    if (this.state.isDestroyed || this.state.ammo <= 0) return false;

    const reloadTime = this.getFireRate();
    return currentTime - this.state.lastFireTime >= reloadTime;
  }

  fire(currentTime: number): { position: Vector2D; direction: Vector2D; damage: number } | null {
    if (!this.canFire(currentTime)) return null;

    this.state.lastFireTime = currentTime;
    this.state.ammo--;

    const barrelOffset = GAME_CONSTANTS.TANK.COLLISION_RADIUS + 5;
    const fireDirection = Vector2D.fromAngle(this.state.rotation);
    const firePosition = this.state.position.add(fireDirection.multiply(barrelOffset));

    const damage = GAME_CONSTANTS.PROJECTILE.DAMAGE *
                  this.getActivePowerupMultiplier(PowerupType.DAMAGE_BOOST);

    // Apply recoil
    const recoilForce = fireDirection.multiply(-50);
    this.physicsBody.velocity.addInPlace(recoilForce.divide(this.physicsBody.mass));

    return {
      position: firePosition,
      direction: fireDirection,
      damage
    };
  }

  private getFireRate(): number {
    const baseReloadTime = GAME_CONSTANTS.TANK.RELOAD_TIME;
    const rapidFireMultiplier = this.hasActivePowerup(PowerupType.RAPID_FIRE) ?
      GAME_CONSTANTS.POWERUPS.RAPID_FIRE_RELOAD_REDUCTION : 1.0;

    return baseReloadTime * rapidFireMultiplier;
  }

  // Damage and health
  takeDamage(damage: number, source?: string): boolean {
    if (this.state.isDestroyed) return false;

    // Apply armor boost reduction
    const armorMultiplier = this.getActivePowerupMultiplier(PowerupType.ARMOR_BOOST);
    const effectiveDamage = damage * armorMultiplier;

    this.state.health = Math.max(0, this.state.health - effectiveDamage);

    if (this.state.health <= 0) {
      this.destroy();
      return true; // Tank was destroyed
    }

    return false;
  }

  heal(amount: number): void {
    if (!this.state.isDestroyed) {
      this.state.health = Math.min(GAME_CONSTANTS.TANK.MAX_HEALTH, this.state.health + amount);
    }
  }

  destroy(): void {
    this.state.isDestroyed = true;
    this.state.health = 0;
    this.state.deaths++;
    this.state.respawnTime = Date.now() + GAME_CONSTANTS.GAME_MODES.DEATHMATCH.RESPAWN_TIME;

    // Remove from physics simulation
    this.physicsBody.velocity = Vector2D.zero();
    this.physicsBody.acceleration = Vector2D.zero();
    this.physicsBody.angularVelocity = 0;
  }

  private handleRespawn(currentTime: number): void {
    if (this.state.respawnTime && currentTime >= this.state.respawnTime) {
      this.respawn();
    }
  }

  respawn(position?: Vector2D): void {
    this.state.isDestroyed = false;
    this.state.health = GAME_CONSTANTS.TANK.MAX_HEALTH;
    this.state.fuel = GAME_CONSTANTS.TANK.FUEL_CAPACITY;
    this.state.ammo = 50;
    this.state.respawnTime = undefined;
    this.state.powerups = [];

    if (position) {
      this.state.position = position.clone();
      this.physicsBody.position = position.clone();
    }

    this.physicsBody.velocity = Vector2D.zero();
    this.physicsBody.acceleration = Vector2D.zero();
    this.physicsBody.angularVelocity = 0;
  }

  // Powerups
  addPowerup(type: PowerupType, duration: number, multiplier?: number): void {
    const endTime = Date.now() + duration;

    // Remove existing powerup of same type
    this.state.powerups = this.state.powerups.filter(p => p.type !== type);

    this.state.powerups.push({
      type,
      endTime,
      multiplier
    });
  }

  private hasActivePowerup(type: PowerupType): boolean {
    return this.state.powerups.some(p => p.type === type);
  }

  private getActivePowerupMultiplier(type: PowerupType): number {
    const powerup = this.state.powerups.find(p => p.type === type);
    return powerup?.multiplier ?? 1.0;
  }

  // Collision handling
  private handleCollision(other: PhysicsBody, point: Vector2D, normal: Vector2D): void {
    // Handle terrain collisions
    if (other.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN) {
      // Tank bounces off terrain
      const bounceForce = normal.multiply(100);
      this.physicsBody.velocity.addInPlace(bounceForce.divide(this.physicsBody.mass));
    }

    // Handle tank-tank collisions
    if (other.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TANK) {
      // Small damage from collision
      this.takeDamage(5);
    }
  }

  // Resource management
  addFuel(amount: number): void {
    this.state.fuel = Math.min(GAME_CONSTANTS.TANK.FUEL_CAPACITY, this.state.fuel + amount);
  }

  addAmmo(amount: number): void {
    this.state.ammo += amount;
  }

  // Getters
  getState(): Readonly<TankState> {
    return this.state;
  }

  getPhysicsBody(): PhysicsBody {
    return this.physicsBody;
  }

  getPosition(): Vector2D {
    return this.state.position.clone();
  }

  getRotation(): number {
    return this.state.rotation;
  }

  getVelocity(): Vector2D {
    return this.state.velocity.clone();
  }

  getHealth(): number {
    return this.state.health;
  }

  getFuel(): number {
    return this.state.fuel;
  }

  getAmmo(): number {
    return this.state.ammo;
  }

  isDestroyed(): boolean {
    return this.state.isDestroyed;
  }

  // Serialization for network sync
  serialize(): any {
    return {
      ...this.state,
      position: this.state.position.toObject(),
      velocity: this.state.velocity.toObject()
    };
  }

  static deserialize(data: any): Tank {
    const tank = new Tank(data.id, Vector2D.fromObject(data.position), data.rotation);
    tank.state = {
      ...data,
      position: Vector2D.fromObject(data.position),
      velocity: Vector2D.fromObject(data.velocity)
    };
    return tank;
  }
}