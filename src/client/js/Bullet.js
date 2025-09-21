/**
 * Bullet class for projectiles fired by tanks
 */
class Bullet {
    constructor(x, y, direction, ownerId) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(
            Math.cos(direction) * Bullet.SPEED,
            Math.sin(direction) * Bullet.SPEED
        );
        this.ownerId = ownerId;
        this.direction = direction;

        // Bullet properties
        this.damage = 25;
        this.size = 3;
        this.maxDistance = 600; // Maximum travel distance
        this.distanceTraveled = 0;
        this.isActive = true;

        // Visual properties
        this.color = '#ffff00';
        this.trailLength = 15;
        this.trail = []; // Array of previous positions for trail effect

        // Create initial trail
        for (let i = 0; i < this.trailLength; i++) {
            this.trail.push(this.position.clone());
        }
    }

    static get SPEED() {
        return 400; // pixels per second
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // Store previous position for trail
        this.trail.unshift(this.position.clone());
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }

        // Calculate movement distance
        const moveDistance = this.velocity.magnitude() * deltaTime;
        this.distanceTraveled += moveDistance;

        // Update position
        this.position.add(Vector2D.multiply(this.velocity, deltaTime));

        // Check if bullet has traveled too far
        if (this.distanceTraveled >= this.maxDistance) {
            this.isActive = false;
        }
    }

    // Check collision with rectangular bounds
    isCollidingWithBounds(bounds) {
        return (
            this.position.x >= bounds.x &&
            this.position.x <= bounds.x + bounds.width &&
            this.position.y >= bounds.y &&
            this.position.y <= bounds.y + bounds.height
        );
    }

    // Check collision with circular object
    isCollidingWithCircle(position, radius) {
        const distance = this.position.distanceTo(position);
        return distance <= (radius + this.size);
    }

    // Check collision with tank
    isCollidingWithTank(tank) {
        if (tank.id === this.ownerId || !tank.isAlive) {
            return false; // Can't hit owner or dead tanks
        }

        return this.isCollidingWithCircle(tank.position, tank.size);
    }

    // Check collision with terrain/obstacles
    isCollidingWithTerrain(terrain) {
        // Check each terrain tile
        for (const tile of terrain.getTilesInRadius(this.position, this.size)) {
            if (tile.isSolid && this.isCollidingWithBounds(tile.bounds)) {
                return true;
            }
        }
        return false;
    }

    // Check if bullet is outside game bounds
    isOutOfBounds(gameWidth, gameHeight) {
        return (
            this.position.x < 0 ||
            this.position.x > gameWidth ||
            this.position.y < 0 ||
            this.position.y > gameHeight
        );
    }

    // Destroy the bullet
    destroy() {
        this.isActive = false;
    }

    // Get bullet bounds for collision detection
    getBounds() {
        return {
            x: this.position.x - this.size,
            y: this.position.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }

    // Calculate impact force for physics
    getImpactForce() {
        return Vector2D.multiply(this.velocity.normalized(), this.damage);
    }

    // Get trail positions for rendering
    getTrailPositions() {
        return this.trail.slice(); // Return copy of trail array
    }

    // Network state for multiplayer
    getNetworkState() {
        return {
            id: this.id || `${this.ownerId}_${Date.now()}`,
            x: this.position.x,
            y: this.position.y,
            direction: this.direction,
            ownerId: this.ownerId,
            isActive: this.isActive,
            distanceTraveled: this.distanceTraveled
        };
    }

    updateFromNetworkState(state) {
        this.position.set(state.x, state.y);
        this.direction = state.direction;
        this.isActive = state.isActive;
        this.distanceTraveled = state.distanceTraveled;

        // Recalculate velocity from direction
        this.velocity.set(
            Math.cos(this.direction) * Bullet.SPEED,
            Math.sin(this.direction) * Bullet.SPEED
        );
    }

    // Bullet ricochet (for advanced gameplay)
    ricochet(normal) {
        // Reflect velocity off surface normal
        const dot = this.velocity.dot(normal);
        this.velocity.subtract(Vector2D.multiply(normal, 2 * dot));

        // Reduce speed on ricochet
        this.velocity.multiply(0.7);

        // Update direction
        this.direction = this.velocity.angle();

        // Reduce damage
        this.damage *= 0.8;

        return this; // Allow chaining
    }

    // Create explosion effect data
    createExplosion() {
        return {
            position: this.position.clone(),
            size: this.damage * 0.5,
            color: this.color,
            particles: this.createExplosionParticles()
        };
    }

    createExplosionParticles() {
        const particles = [];
        const particleCount = Math.floor(this.damage * 0.3);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const particle = {
                position: this.position.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 0.3 + Math.random() * 0.2,
                size: 1 + Math.random() * 2,
                color: `hsl(${45 + Math.random() * 30}, 100%, 70%)`
            };
            particles.push(particle);
        }

        return particles;
    }

    // Utility methods
    getSpeed() {
        return this.velocity.magnitude();
    }

    getAge() {
        return this.distanceTraveled / Bullet.SPEED;
    }

    getRemainingDistance() {
        return Math.max(0, this.maxDistance - this.distanceTraveled);
    }

    toString() {
        return `Bullet(owner: ${this.ownerId}, pos: ${this.position.toString()}, active: ${this.isActive})`;
    }
}

// Bullet factory for different bullet types
class BulletFactory {
    static createStandardBullet(x, y, direction, ownerId) {
        return new Bullet(x, y, direction, ownerId);
    }

    static createHighExplosiveBullet(x, y, direction, ownerId) {
        const bullet = new Bullet(x, y, direction, ownerId);
        bullet.damage = 40;
        bullet.size = 4;
        bullet.color = '#ff4400';
        bullet.maxDistance = 500;
        return bullet;
    }

    static createArmorPiercingBullet(x, y, direction, ownerId) {
        const bullet = new Bullet(x, y, direction, ownerId);
        bullet.damage = 35;
        bullet.size = 2;
        bullet.color = '#00ffff';
        bullet.velocity.multiply(1.5); // Faster
        bullet.maxDistance = 800;
        return bullet;
    }

    static createCannonBall(x, y, direction, ownerId) {
        const bullet = new Bullet(x, y, direction, ownerId);
        bullet.damage = 50;
        bullet.size = 6;
        bullet.color = '#444444';
        bullet.velocity.multiply(0.7); // Slower but more damage
        bullet.maxDistance = 400;
        return bullet;
    }
}