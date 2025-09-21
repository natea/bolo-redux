/**
 * Power-up system for Bolo game
 * Handles power-up spawning, effects, and management
 */

import { Vector2D } from '../core/Vector2D';
import { GAME_CONSTANTS } from '../core/GameConstants';
import { PhysicsBody } from '../physics/PhysicsEngine';
import { PowerupType } from '../entities/Tank';

export interface PowerupState {
  id: string;
  type: PowerupType;
  position: Vector2D;
  isActive: boolean;
  spawnTime: number;
  expiryTime: number;
  effectDuration: number;
  multiplier?: number;
  collectible: boolean;
}

export interface PowerupSpawnPoint {
  position: Vector2D;
  lastSpawnTime: number;
  spawnCooldown: number;
  allowedTypes: PowerupType[];
}

export interface PowerupEffect {
  type: PowerupType;
  name: string;
  description: string;
  duration: number;
  icon: string;
  rarity: PowerupRarity;
  effect: PowerupEffectFunction;
}

export enum PowerupRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export type PowerupEffectFunction = (tankId: string, system: PowerupSystem) => void;

export class PowerupSystem {
  private powerups: Map<string, PowerupState> = new Map();
  private spawnPoints: PowerupSpawnPoint[] = [];
  private effects: Map<PowerupType, PowerupEffect> = new Map();
  private nextPowerupId = 0;

  constructor() {
    this.initializePowerupEffects();
  }

  private initializePowerupEffects(): void {
    // Speed Boost
    this.effects.set(PowerupType.SPEED_BOOST, {
      type: PowerupType.SPEED_BOOST,
      name: 'Speed Boost',
      description: 'Increases movement speed by 50%',
      duration: GAME_CONSTANTS.POWERUPS.DURATION,
      icon: '⚡',
      rarity: PowerupRarity.COMMON,
      effect: (tankId, system) => {
        system.applySpeedBoost(tankId, GAME_CONSTANTS.POWERUPS.SPEED_BOOST_MULTIPLIER);
      }
    });

    // Damage Boost
    this.effects.set(PowerupType.DAMAGE_BOOST, {
      type: PowerupType.DAMAGE_BOOST,
      name: 'Damage Boost',
      description: 'Doubles projectile damage',
      duration: GAME_CONSTANTS.POWERUPS.DURATION,
      icon: '💥',
      rarity: PowerupRarity.UNCOMMON,
      effect: (tankId, system) => {
        system.applyDamageBoost(tankId, GAME_CONSTANTS.POWERUPS.DAMAGE_BOOST_MULTIPLIER);
      }
    });

    // Armor Boost
    this.effects.set(PowerupType.ARMOR_BOOST, {
      type: PowerupType.ARMOR_BOOST,
      name: 'Armor Boost',
      description: 'Reduces incoming damage by 50%',
      duration: GAME_CONSTANTS.POWERUPS.DURATION,
      icon: '🛡️',
      rarity: PowerupRarity.UNCOMMON,
      effect: (tankId, system) => {
        system.applyArmorBoost(tankId, GAME_CONSTANTS.POWERUPS.ARMOR_BOOST_REDUCTION);
      }
    });

    // Rapid Fire
    this.effects.set(PowerupType.RAPID_FIRE, {
      type: PowerupType.RAPID_FIRE,
      name: 'Rapid Fire',
      description: 'Increases fire rate by 70%',
      duration: GAME_CONSTANTS.POWERUPS.DURATION,
      icon: '🔫',
      rarity: PowerupRarity.RARE,
      effect: (tankId, system) => {
        system.applyRapidFire(tankId, GAME_CONSTANTS.POWERUPS.RAPID_FIRE_RELOAD_REDUCTION);
      }
    });

    // Shield
    this.effects.set(PowerupType.SHIELD, {
      type: PowerupType.SHIELD,
      name: 'Energy Shield',
      description: 'Blocks all damage for a short time',
      duration: 8000, // 8 seconds
      icon: '⚡',
      rarity: PowerupRarity.EPIC,
      effect: (tankId, system) => {
        system.applyShield(tankId);
      }
    });

    // Invisibility
    this.effects.set(PowerupType.INVISIBILITY, {
      type: PowerupType.INVISIBILITY,
      name: 'Stealth Cloak',
      description: 'Become invisible to enemies',
      duration: 10000, // 10 seconds
      icon: '👻',
      rarity: PowerupRarity.LEGENDARY,
      effect: (tankId, system) => {
        system.applyInvisibility(tankId);
      }
    });
  }

  // Spawn point management
  addSpawnPoint(position: Vector2D, allowedTypes?: PowerupType[]): void {
    this.spawnPoints.push({
      position: position.clone(),
      lastSpawnTime: 0,
      spawnCooldown: GAME_CONSTANTS.POWERUPS.SPAWN_INTERVAL,
      allowedTypes: allowedTypes || Object.values(PowerupType)
    });
  }

  removeSpawnPoint(position: Vector2D): void {
    this.spawnPoints = this.spawnPoints.filter(
      point => !point.position.equals(position, 10)
    );
  }

  // Power-up lifecycle
  update(currentTime: number): void {
    this.updateExistingPowerups(currentTime);
    this.spawnNewPowerups(currentTime);
  }

  private updateExistingPowerups(currentTime: number): void {
    for (const [id, powerup] of this.powerups) {
      // Remove expired power-ups
      if (currentTime > powerup.expiryTime) {
        this.removePowerup(id);
      }
    }
  }

  private spawnNewPowerups(currentTime: number): void {
    for (const spawnPoint of this.spawnPoints) {
      if (currentTime - spawnPoint.lastSpawnTime >= spawnPoint.spawnCooldown) {
        // Check if spawn point is clear
        if (!this.isPowerupNearPosition(spawnPoint.position, 50)) {
          this.spawnPowerupAtPoint(spawnPoint, currentTime);
        }
      }
    }
  }

  private spawnPowerupAtPoint(spawnPoint: PowerupSpawnPoint, currentTime: number): void {
    const type = this.selectRandomPowerupType(spawnPoint.allowedTypes);
    const effect = this.effects.get(type);

    if (effect) {
      const powerup: PowerupState = {
        id: `powerup_${this.nextPowerupId++}`,
        type,
        position: spawnPoint.position.clone(),
        isActive: true,
        spawnTime: currentTime,
        expiryTime: currentTime + GAME_CONSTANTS.POWERUPS.DESPAWN_TIME,
        effectDuration: effect.duration,
        collectible: true
      };

      this.powerups.set(powerup.id, powerup);
      spawnPoint.lastSpawnTime = currentTime;
    }
  }

  private selectRandomPowerupType(allowedTypes: PowerupType[]): PowerupType {
    // Weighted selection based on rarity
    const weights: { [key: string]: number } = {
      [PowerupRarity.COMMON]: 50,
      [PowerupRarity.UNCOMMON]: 25,
      [PowerupRarity.RARE]: 15,
      [PowerupRarity.EPIC]: 8,
      [PowerupRarity.LEGENDARY]: 2
    };

    const weightedTypes: { type: PowerupType; weight: number }[] = [];

    for (const type of allowedTypes) {
      const effect = this.effects.get(type);
      if (effect) {
        weightedTypes.push({
          type,
          weight: weights[effect.rarity] || 1
        });
      }
    }

    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedTypes) {
      random -= item.weight;
      if (random <= 0) {
        return item.type;
      }
    }

    return allowedTypes[0]; // Fallback
  }

  // Power-up collection
  tryCollectPowerup(position: Vector2D, tankId: string, collectionRadius: number = 30): PowerupState | null {
    for (const [id, powerup] of this.powerups) {
      if (powerup.collectible && powerup.position.distance(position) <= collectionRadius) {
        this.collectPowerup(id, tankId);
        return powerup;
      }
    }
    return null;
  }

  private collectPowerup(powerupId: string, tankId: string): void {
    const powerup = this.powerups.get(powerupId);
    if (!powerup) return;

    // Apply the power-up effect
    const effect = this.effects.get(powerup.type);
    if (effect) {
      effect.effect(tankId, this);
    }

    this.removePowerup(powerupId);
  }

  private removePowerup(powerupId: string): void {
    this.powerups.delete(powerupId);
  }

  // Effect application methods
  private applySpeedBoost(tankId: string, multiplier: number): void {
    // This would typically interface with the tank system
    this.onPowerupApplied?.(tankId, PowerupType.SPEED_BOOST, { multiplier });
  }

  private applyDamageBoost(tankId: string, multiplier: number): void {
    this.onPowerupApplied?.(tankId, PowerupType.DAMAGE_BOOST, { multiplier });
  }

  private applyArmorBoost(tankId: string, reduction: number): void {
    this.onPowerupApplied?.(tankId, PowerupType.ARMOR_BOOST, { reduction });
  }

  private applyRapidFire(tankId: string, reloadReduction: number): void {
    this.onPowerupApplied?.(tankId, PowerupType.RAPID_FIRE, { reloadReduction });
  }

  private applyShield(tankId: string): void {
    this.onPowerupApplied?.(tankId, PowerupType.SHIELD, {});
  }

  private applyInvisibility(tankId: string): void {
    this.onPowerupApplied?.(tankId, PowerupType.INVISIBILITY, {});
  }

  // Event callbacks
  onPowerupApplied?: (tankId: string, type: PowerupType, data: any) => void;
  onPowerupSpawned?: (powerup: PowerupState) => void;
  onPowerupExpired?: (powerupId: string) => void;

  // Query methods
  getAllPowerups(): PowerupState[] {
    return Array.from(this.powerups.values());
  }

  getPowerupsInArea(center: Vector2D, radius: number): PowerupState[] {
    return this.getAllPowerups().filter(
      powerup => powerup.position.distance(center) <= radius
    );
  }

  private isPowerupNearPosition(position: Vector2D, radius: number): boolean {
    return this.getPowerupsInArea(position, radius).length > 0;
  }

  getPowerupEffect(type: PowerupType): PowerupEffect | undefined {
    return this.effects.get(type);
  }

  // Physics integration
  createPhysicsBodies(): PhysicsBody[] {
    const bodies: PhysicsBody[] = [];

    for (const powerup of this.powerups.values()) {
      if (powerup.collectible) {
        bodies.push({
          id: powerup.id,
          position: powerup.position.clone(),
          velocity: Vector2D.zero(),
          acceleration: Vector2D.zero(),
          rotation: 0,
          angularVelocity: 0.1, // Slow rotation for visual effect
          mass: 0, // Massless for collection
          collisionRadius: 15,
          collisionLayer: GAME_CONSTANTS.COLLISION_LAYERS.POWERUP,
          collisionMask: GAME_CONSTANTS.COLLISION_LAYERS.TANK,
          isStatic: true,
          friction: 0,
          bounciness: 0,
          onCollision: (other) => {
            if (other.collisionLayer & GAME_CONSTANTS.COLLISION_LAYERS.TANK) {
              this.tryCollectPowerup(powerup.position, other.id);
            }
          }
        });
      }
    }

    return bodies;
  }

  // Special power-up behaviors
  spawnTemporaryPowerup(type: PowerupType, position: Vector2D, duration: number = 30000): string {
    const powerup: PowerupState = {
      id: `temp_powerup_${this.nextPowerupId++}`,
      type,
      position: position.clone(),
      isActive: true,
      spawnTime: Date.now(),
      expiryTime: Date.now() + duration,
      effectDuration: this.effects.get(type)?.duration || GAME_CONSTANTS.POWERUPS.DURATION,
      collectible: true
    };

    this.powerups.set(powerup.id, powerup);
    return powerup.id;
  }

  spawnRandomPowerup(position: Vector2D): string {
    const types = Object.values(PowerupType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.spawnTemporaryPowerup(randomType, position);
  }

  // Utility methods
  getSpawnPoints(): Vector2D[] {
    return this.spawnPoints.map(point => point.position.clone());
  }

  getPowerupCount(): number {
    return this.powerups.size;
  }

  getPowerupCountByType(type: PowerupType): number {
    return Array.from(this.powerups.values()).filter(p => p.type === type).length;
  }

  clearAllPowerups(): void {
    this.powerups.clear();
  }

  // Debug information
  getDebugInfo(): any {
    return {
      totalPowerups: this.powerups.size,
      spawnPoints: this.spawnPoints.length,
      powerupsByType: Object.values(PowerupType).reduce((acc, type) => {
        acc[type] = this.getPowerupCountByType(type);
        return acc;
      }, {} as Record<PowerupType, number>)
    };
  }

  // Serialization
  serialize(): any {
    return {
      powerups: Array.from(this.powerups.entries()).map(([id, powerup]) => ({
        id,
        ...powerup,
        position: powerup.position.toObject()
      })),
      spawnPoints: this.spawnPoints.map(point => ({
        ...point,
        position: point.position.toObject()
      }))
    };
  }

  deserialize(data: any): void {
    this.powerups.clear();
    this.spawnPoints = [];

    for (const powerupData of data.powerups || []) {
      const powerup: PowerupState = {
        ...powerupData,
        position: Vector2D.fromObject(powerupData.position)
      };
      this.powerups.set(powerup.id, powerup);
    }

    for (const spawnPointData of data.spawnPoints || []) {
      this.spawnPoints.push({
        ...spawnPointData,
        position: Vector2D.fromObject(spawnPointData.position)
      });
    }
  }
}