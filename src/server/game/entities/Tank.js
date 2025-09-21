export class Tank {
  constructor(options) {
    this.id = options.id;
    this.playerId = options.playerId;
    this.playerName = options.playerName;
    this.color = options.color;

    // Position and movement
    this.position = { x: options.position.x, y: options.position.y };
    this.rotation = options.rotation || 0;
    this.velocity = { x: 0, y: 0 };
    this.onGround = false;

    // Tank properties
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
    this.lastShootTime = 0;

    // Tank specifications
    this.specs = {
      maxSpeed: 3.0,
      acceleration: 0.5,
      friction: 0.8,
      turretRotationSpeed: 2.0,
      shootCooldown: 1000, // 1 second between shots
      size: { width: 32, height: 24 }
    };

    // Weapon state
    this.turretAngle = 0;
    this.power = 50; // Default shot power
  }

  /**
   * Handle movement input
   */
  handleMovement(action, terrain) {
    if (!this.alive) return { success: false, error: 'Tank is destroyed' };

    try {
      const oldPosition = { ...this.position };

      // Handle different movement actions
      switch (action.type) {
        case 'move_left':
          this.velocity.x = Math.max(this.velocity.x - this.specs.acceleration, -this.specs.maxSpeed);
          break;

        case 'move_right':
          this.velocity.x = Math.min(this.velocity.x + this.specs.acceleration, this.specs.maxSpeed);
          break;

        case 'stop':
          this.velocity.x *= this.specs.friction;
          break;

        case 'rotate_turret':
          this.turretAngle += action.delta * this.specs.turretRotationSpeed;
          this.turretAngle = this.normalizeAngle(this.turretAngle);
          break;

        case 'set_power':
          this.power = Math.max(10, Math.min(100, action.power));
          break;
      }

      // Update position based on velocity (for horizontal movement)
      if (action.type.includes('move')) {
        this.position.x += this.velocity.x;

        // Check terrain collision for new position
        if (this.checkTerrainCollision(terrain)) {
          // Revert position if collision detected
          this.position = oldPosition;
          this.velocity.x = 0;
          return { success: false, error: 'Terrain collision' };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle shooting
   */
  shoot(action) {
    if (!this.alive) return { success: false, error: 'Tank is destroyed' };

    const now = Date.now();
    if (now - this.lastShootTime < this.specs.shootCooldown) {
      return { success: false, error: 'Shot cooldown active' };
    }

    try {
      // Calculate shot angle and power
      const angle = this.rotation + this.turretAngle;
      const power = action.power || this.power;

      // Calculate bullet spawn position (at turret tip)
      const turretLength = 20;
      const spawnX = this.position.x + Math.cos(angle) * turretLength;
      const spawnY = this.position.y + Math.sin(angle) * turretLength;

      // Calculate initial velocity based on angle and power
      const velocityMagnitude = power * 0.2; // Scale power to velocity
      const velocityX = Math.cos(angle) * velocityMagnitude;
      const velocityY = Math.sin(angle) * velocityMagnitude;

      this.lastShootTime = now;

      return {
        success: true,
        position: { x: spawnX, y: spawnY },
        velocity: { x: velocityX, y: velocityY }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Take damage
   */
  takeDamage(amount) {
    if (!this.alive) return;

    this.health = Math.max(0, this.health - amount);

    if (this.health <= 0) {
      this.alive = false;
    }
  }

  /**
   * Respawn the tank
   */
  respawn(position, rotation) {
    this.position = { ...position };
    this.rotation = rotation;
    this.velocity = { x: 0, y: 0 };
    this.health = this.maxHealth;
    this.alive = true;
    this.turretAngle = 0;
    this.lastShootTime = 0;
  }

  /**
   * Check if tank is alive
   */
  isAlive() {
    return this.alive;
  }

  /**
   * Check terrain collision
   */
  checkTerrainCollision(terrain) {
    // Simple bounding box collision with terrain
    const bounds = this.getBounds();
    return terrain.checkCollision(bounds);
  }

  /**
   * Get tank bounding box
   */
  getBounds() {
    return {
      x: this.position.x - this.specs.size.width / 2,
      y: this.position.y - this.specs.size.height / 2,
      width: this.specs.size.width,
      height: this.specs.size.height
    };
  }

  /**
   * Get tank state for client
   */
  getState() {
    return {
      id: this.id,
      playerId: this.playerId,
      playerName: this.playerName,
      position: this.position,
      rotation: this.rotation,
      velocity: this.velocity,
      turretAngle: this.turretAngle,
      health: this.health,
      maxHealth: this.maxHealth,
      alive: this.alive,
      color: this.color,
      power: this.power
    };
  }

  /**
   * Normalize angle to 0-2π range
   */
  normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }
}