export class Bullet {
  constructor(options) {
    this.id = options.id;
    this.playerId = options.playerId;
    this.position = { x: options.position.x, y: options.position.y };
    this.velocity = { x: options.velocity.x, y: options.velocity.y };
    this.power = options.power || 50;
    this.weaponType = options.weaponType || 'standard';

    // Bullet properties
    this.active = true;
    this.createdAt = Date.now();
    this.lifespan = 10000; // 10 seconds max lifetime

    // Physics properties
    this.gravity = 0.5;
    this.airResistance = 0.99; // Air resistance factor
    this.mass = this.getMass();

    // Visual properties
    this.trail = []; // Store recent positions for trail effect
    this.maxTrailLength = 5;
  }

  /**
   * Get bullet mass based on weapon type
   */
  getMass() {
    switch (this.weaponType) {
      case 'heavy': return 2.0;
      case 'light': return 0.5;
      default: return 1.0;
    }
  }

  /**
   * Update bullet physics
   */
  updatePhysics(deltaTime, gravity, windStrength = 0, windDirection = 0) {
    if (!this.active) return;

    // Store position for trail
    this.trail.push({ x: this.position.x, y: this.position.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Apply gravity
    this.velocity.y += gravity * deltaTime;

    // Apply air resistance
    this.velocity.x *= this.airResistance;
    this.velocity.y *= this.airResistance;

    // Apply wind effect (if any)
    if (windStrength > 0) {
      const windEffect = windStrength * deltaTime / this.mass;
      this.velocity.x += Math.cos(windDirection) * windEffect;
      this.velocity.y += Math.sin(windDirection) * windEffect;
    }

    // Update position
    this.position.x += this.velocity.x * deltaTime * 60; // Scale by frame rate
    this.position.y += this.velocity.y * deltaTime * 60;

    // Check if bullet has exceeded its lifespan
    if (Date.now() - this.createdAt > this.lifespan) {
      this.active = false;
    }
  }

  /**
   * Get bullet bounding box for collision detection
   */
  getBounds() {
    const size = this.getSize();
    return {
      x: this.position.x - size.width / 2,
      y: this.position.y - size.height / 2,
      width: size.width,
      height: size.height
    };
  }

  /**
   * Get bullet size based on weapon type
   */
  getSize() {
    switch (this.weaponType) {
      case 'heavy':
        return { width: 8, height: 8 };
      case 'light':
        return { width: 3, height: 3 };
      default:
        return { width: 5, height: 5 };
    }
  }

  /**
   * Get bullet speed
   */
  getSpeed() {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
  }

  /**
   * Get bullet angle of travel
   */
  getAngle() {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }

  /**
   * Check if bullet is still active
   */
  isActive() {
    return this.active;
  }

  /**
   * Deactivate bullet (when it hits something)
   */
  deactivate() {
    this.active = false;
  }

  /**
   * Get bullet state for client
   */
  getState() {
    return {
      id: this.id,
      playerId: this.playerId,
      position: this.position,
      velocity: this.velocity,
      power: this.power,
      weaponType: this.weaponType,
      active: this.active,
      trail: this.trail,
      angle: this.getAngle(),
      speed: this.getSpeed()
    };
  }

  /**
   * Calculate impact damage based on speed and power
   */
  getImpactDamage() {
    const speed = this.getSpeed();
    const speedMultiplier = Math.min(speed / 10, 2.0); // Cap speed multiplier at 2x
    return Math.floor(this.power * speedMultiplier);
  }

  /**
   * Get explosion radius for area damage
   */
  getExplosionRadius() {
    switch (this.weaponType) {
      case 'heavy': return 60;
      case 'light': return 30;
      default: return 45;
    }
  }
}