export class PhysicsEngine {
  constructor(gameSettings) {
    this.gravity = gameSettings.gravity || 0.5;
    this.friction = 0.8;
    this.bounceThreshold = 2.0;
    this.minVelocity = 0.1;
  }

  /**
   * Update tank physics
   */
  updateTankPhysics(tank, terrain) {
    // Apply gravity to tanks
    if (!tank.onGround) {
      tank.velocity.y += this.gravity;
    }

    // Update vertical position
    const oldY = tank.position.y;
    tank.position.y += tank.velocity.y;

    // Check ground collision
    const groundHeight = terrain.getHeightAt(tank.position.x);
    const tankBottom = tank.position.y + tank.specs.size.height / 2;

    if (tankBottom >= groundHeight) {
      // Tank is on or below ground
      tank.position.y = groundHeight - tank.specs.size.height / 2;
      tank.velocity.y = 0;
      tank.onGround = true;

      // Calculate tank rotation based on terrain slope
      tank.rotation = terrain.getSlopeAt(tank.position.x);
    } else {
      tank.onGround = false;
    }

    // Apply horizontal friction when on ground
    if (tank.onGround) {
      tank.velocity.x *= this.friction;

      // Stop very small movements
      if (Math.abs(tank.velocity.x) < this.minVelocity) {
        tank.velocity.x = 0;
      }
    }

    // Ensure tank stays within map bounds
    const mapBounds = terrain.getBounds();
    tank.position.x = Math.max(
      tank.specs.size.width / 2,
      Math.min(mapBounds.width - tank.specs.size.width / 2, tank.position.x)
    );
  }

  /**
   * Update bullet physics
   */
  updateBulletPhysics(bullet, deltaTime, gameSettings) {
    // Apply gravity
    bullet.velocity.y += this.gravity * deltaTime * 60;

    // Apply wind if present
    if (gameSettings.windStrength > 0) {
      const windEffect = gameSettings.windStrength * deltaTime / bullet.mass;
      bullet.velocity.x += Math.cos(gameSettings.windDirection) * windEffect;
      bullet.velocity.y += Math.sin(gameSettings.windDirection) * windEffect;
    }

    // Apply air resistance
    const airResistance = 0.999; // Very light air resistance
    bullet.velocity.x *= airResistance;
    bullet.velocity.y *= airResistance;

    // Update position
    bullet.position.x += bullet.velocity.x * deltaTime * 60;
    bullet.position.y += bullet.velocity.y * deltaTime * 60;
  }

  /**
   * Calculate trajectory prediction for aiming
   */
  predictTrajectory(startPos, velocity, steps = 50) {
    const trajectory = [];
    const pos = { x: startPos.x, y: startPos.y };
    const vel = { x: velocity.x, y: velocity.y };
    const deltaTime = 1/60; // 60 FPS

    for (let i = 0; i < steps; i++) {
      trajectory.push({ x: pos.x, y: pos.y });

      // Apply physics
      vel.y += this.gravity * deltaTime * 60;
      vel.x *= 0.999; // Air resistance
      vel.y *= 0.999;

      pos.x += vel.x * deltaTime * 60;
      pos.y += vel.y * deltaTime * 60;
    }

    return trajectory;
  }

  /**
   * Calculate impact point with terrain
   */
  calculateImpactPoint(startPos, velocity, terrain) {
    const pos = { x: startPos.x, y: startPos.y };
    const vel = { x: velocity.x, y: velocity.y };
    const deltaTime = 1/60;
    const maxSteps = 300; // Prevent infinite loops

    for (let i = 0; i < maxSteps; i++) {
      // Update position
      pos.x += vel.x * deltaTime * 60;
      pos.y += vel.y * deltaTime * 60;

      // Apply physics
      vel.y += this.gravity * deltaTime * 60;
      vel.x *= 0.999;
      vel.y *= 0.999;

      // Check terrain collision
      const groundHeight = terrain.getHeightAt(pos.x);
      if (pos.y >= groundHeight) {
        return {
          position: { x: pos.x, y: groundHeight },
          time: i * deltaTime,
          velocity: { x: vel.x, y: vel.y }
        };
      }

      // Check bounds
      const bounds = terrain.getBounds();
      if (pos.x < 0 || pos.x > bounds.width || pos.y > bounds.height + 100) {
        return null; // Out of bounds
      }
    }

    return null; // No impact found
  }

  /**
   * Calculate explosion physics effects
   */
  calculateExplosionEffects(explosionPos, explosionRadius, targets) {
    const effects = [];

    for (const target of targets) {
      const distance = this.calculateDistance(explosionPos, target.position);

      if (distance <= explosionRadius * 2) {
        // Calculate force direction
        const direction = {
          x: target.position.x - explosionPos.x,
          y: target.position.y - explosionPos.y
        };

        // Normalize direction
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
          direction.x /= magnitude;
          direction.y /= magnitude;
        }

        // Calculate force magnitude (inverse square falloff)
        const forceMagnitude = explosionRadius * 100 / (distance * distance + 1);

        effects.push({
          target: target,
          force: {
            x: direction.x * forceMagnitude,
            y: direction.y * forceMagnitude
          },
          distance: distance
        });
      }
    }

    return effects;
  }

  /**
   * Apply physics force to object
   */
  applyForce(object, force) {
    if (object.velocity) {
      object.velocity.x += force.x / (object.mass || 1);
      object.velocity.y += force.y / (object.mass || 1);

      // Cap maximum velocity
      const maxVel = 20;
      const currentSpeed = Math.sqrt(
        object.velocity.x * object.velocity.x +
        object.velocity.y * object.velocity.y
      );

      if (currentSpeed > maxVel) {
        const scale = maxVel / currentSpeed;
        object.velocity.x *= scale;
        object.velocity.y *= scale;
      }
    }
  }

  /**
   * Utility: Calculate distance between two points
   */
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Utility: Check if point is within bounds
   */
  isWithinBounds(position, bounds) {
    return position.x >= bounds.x &&
           position.x <= bounds.x + bounds.width &&
           position.y >= bounds.y &&
           position.y <= bounds.y + bounds.height;
  }
}