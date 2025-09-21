/**
 * Tank class representing a player's tank in the game
 */
class Tank {
    constructor(id, x, y, team = 'neutral') {
        this.id = id;
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.rotation = 0; // Body rotation
        this.turretRotation = 0; // Turret rotation
        this.team = team;

        // Tank properties
        this.maxSpeed = 100; // pixels per second
        this.acceleration = 200;
        this.friction = 0.9;
        this.rotationSpeed = 3; // radians per second
        this.turretRotationSpeed = 5;

        // Combat properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxAmmo = 30;
        this.ammo = this.maxAmmo;
        this.isAlive = true;
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownMax = 0.5; // seconds

        // Visual properties
        this.size = 20;
        this.color = this.getTeamColor();
        this.isPlayer = false;

        // Movement state
        this.isMovingForward = false;
        this.isMovingBackward = false;
        this.isRotatingLeft = false;
        this.isRotatingRight = false;

        // Network properties
        this.lastNetworkUpdate = 0;
        this.networkPosition = this.position.clone();
        this.networkRotation = this.rotation;
        this.networkTurretRotation = this.turretRotation;

        // Effects
        this.hitEffect = 0; // For hit flash animation
        this.muzzleFlash = 0; // For muzzle flash effect
    }

    getTeamColor() {
        const teamColors = {
            'red': '#ff4444',
            'blue': '#4444ff',
            'green': '#44ff44',
            'yellow': '#ffff44',
            'neutral': '#888888'
        };
        return teamColors[this.team] || teamColors.neutral;
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        this.updateMovement(deltaTime);
        this.updateShooting(deltaTime);
        this.updateEffects(deltaTime);
        this.updateNetworkSmoothing(deltaTime);
    }

    updateMovement(deltaTime) {
        // Handle rotation
        if (this.isRotatingLeft) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }
        if (this.isRotatingRight) {
            this.rotation += this.rotationSpeed * deltaTime;
        }

        // Handle forward/backward movement
        const acceleration = new Vector2D(0, 0);

        if (this.isMovingForward) {
            acceleration.x = Math.cos(this.rotation) * this.acceleration;
            acceleration.y = Math.sin(this.rotation) * this.acceleration;
        }
        if (this.isMovingBackward) {
            acceleration.x = -Math.cos(this.rotation) * this.acceleration * 0.5; // Slower reverse
            acceleration.y = -Math.sin(this.rotation) * this.acceleration * 0.5;
        }

        // Apply acceleration
        this.velocity.add(Vector2D.multiply(acceleration, deltaTime));

        // Apply friction
        this.velocity.multiply(Math.pow(this.friction, deltaTime));

        // Limit speed
        this.velocity.limit(this.maxSpeed);

        // Update position
        this.position.add(Vector2D.multiply(this.velocity, deltaTime));
    }

    updateShooting(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
    }

    updateEffects(deltaTime) {
        if (this.hitEffect > 0) {
            this.hitEffect -= deltaTime * 5; // Fade out over 0.2 seconds
        }

        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= deltaTime * 10; // Quick fade
        }
    }

    updateNetworkSmoothing(deltaTime) {
        // Smooth interpolation for network updates
        if (!this.isPlayer) {
            const smoothingFactor = 10 * deltaTime;

            // Smooth position
            this.position.lerp(this.networkPosition, smoothingFactor);

            // Smooth rotation
            const angleDiff = this.normalizeAngle(this.networkRotation - this.rotation);
            this.rotation += angleDiff * smoothingFactor;

            // Smooth turret rotation
            const turretAngleDiff = this.normalizeAngle(this.networkTurretRotation - this.turretRotation);
            this.turretRotation += turretAngleDiff * smoothingFactor;
        }
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    // Input handling
    setMovement(forward, backward, left, right) {
        this.isMovingForward = forward;
        this.isMovingBackward = backward;
        this.isRotatingLeft = left;
        this.isRotatingRight = right;
    }

    aimTurret(targetX, targetY) {
        this.turretRotation = this.position.angleTo(new Vector2D(targetX, targetY));
    }

    shoot() {
        if (!this.canShoot || this.ammo <= 0 || !this.isAlive) {
            return null;
        }

        // Calculate bullet spawn position (at turret end)
        const turretLength = this.size + 5;
        const bulletX = this.position.x + Math.cos(this.turretRotation) * turretLength;
        const bulletY = this.position.y + Math.sin(this.turretRotation) * turretLength;

        // Create bullet
        const bullet = new Bullet(
            bulletX,
            bulletY,
            this.turretRotation,
            this.id
        );

        // Update tank state
        this.ammo--;
        this.canShoot = false;
        this.shootCooldown = this.shootCooldownMax;
        this.muzzleFlash = 0.1; // Duration of muzzle flash

        return bullet;
    }

    takeDamage(damage) {
        if (!this.isAlive) return false;

        this.health -= damage;
        this.hitEffect = 1.0; // Full hit effect

        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            return true; // Tank destroyed
        }

        return false; // Tank damaged but alive
    }

    heal(amount) {
        if (!this.isAlive) return;

        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    reloadAmmo(amount = null) {
        if (amount === null) {
            this.ammo = this.maxAmmo; // Full reload
        } else {
            this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
        }
    }

    respawn(x, y) {
        this.position.set(x, y);
        this.velocity.zero();
        this.health = this.maxHealth;
        this.ammo = this.maxAmmo;
        this.isAlive = true;
        this.canShoot = true;
        this.shootCooldown = 0;
        this.hitEffect = 0;
        this.muzzleFlash = 0;
    }

    // Collision detection
    getBounds() {
        return {
            x: this.position.x - this.size,
            y: this.position.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }

    isCollidingWith(other) {
        const distance = this.position.distanceTo(other.position);
        return distance < (this.size + other.size);
    }

    isCollidingWithBounds(bounds) {
        const tankBounds = this.getBounds();
        return !(tankBounds.x + tankBounds.width < bounds.x ||
                bounds.x + bounds.width < tankBounds.x ||
                tankBounds.y + tankBounds.height < bounds.y ||
                bounds.y + bounds.height < tankBounds.y);
    }

    // Network state
    getNetworkState() {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y,
            rotation: this.rotation,
            turretRotation: this.turretRotation,
            health: this.health,
            ammo: this.ammo,
            isAlive: this.isAlive,
            team: this.team,
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        };
    }

    updateFromNetworkState(state) {
        if (this.isPlayer) return; // Don't update player tank from network

        this.networkPosition.set(state.x, state.y);
        this.networkRotation = state.rotation;
        this.networkTurretRotation = state.turretRotation;
        this.health = state.health;
        this.ammo = state.ammo;
        this.isAlive = state.isAlive;
        this.team = state.team;

        // Update color if team changed
        this.color = this.getTeamColor();
    }

    // Rendering helper
    getTurretEndPosition() {
        const turretLength = this.size + 5;
        return new Vector2D(
            this.position.x + Math.cos(this.turretRotation) * turretLength,
            this.position.y + Math.sin(this.turretRotation) * turretLength
        );
    }

    getHealthPercentage() {
        return this.health / this.maxHealth;
    }

    getAmmoPercentage() {
        return this.ammo / this.maxAmmo;
    }

    // Utility methods
    toString() {
        return `Tank(${this.id}, pos: ${this.position.toString()}, health: ${this.health}/${this.maxHealth})`;
    }
}