/**
 * GameRenderer handles all canvas rendering for the Bolo tank game
 */
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1,
            zoom: 1.0,
            targetZoom: 1.0
        };

        // Rendering settings
        this.showDebugInfo = false;
        this.showGrid = false;
        this.showFPS = true;
        this.showMinimap = true;

        // Performance tracking
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = Date.now();

        // Effects system
        this.particles = [];
        this.explosions = [];
        this.effects = [];

        // Render layers
        this.layers = {
            background: [],
            terrain: [],
            entities: [],
            bullets: [],
            effects: [],
            ui: []
        };

        this.initializeRenderer();
    }

    initializeRenderer() {
        // Set up canvas properties
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Resize canvas to fit container
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.width = rect.width - 4; // Account for border
        this.height = rect.height - 124; // Account for HUD height

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Update camera bounds
        this.camera.width = this.width;
        this.camera.height = this.height;
    }

    // Camera methods
    setCameraTarget(x, y) {
        this.camera.targetX = x - this.width / 2;
        this.camera.targetY = y - this.height / 2;
    }

    updateCamera() {
        // Smooth camera movement
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;

        // Smooth zoom
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.camera.smoothing;
    }

    // Transform methods
    applyTransform() {
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }

    resetTransform() {
        this.ctx.restore();
    }

    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.camera.x) * this.camera.zoom,
            y: (worldY - this.camera.y) * this.camera.zoom
        };
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.camera.zoom + this.camera.x,
            y: screenY / this.camera.zoom + this.camera.y
        };
    }

    // Main render method
    render(gameState) {
        this.updateCamera();
        this.updateFPS();

        // Clear canvas
        this.ctx.fillStyle = '#001100';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply camera transform
        this.applyTransform();

        // Render game elements in order
        this.renderTerrain(gameState.terrain);
        this.renderObstacles(gameState.terrain.obstacles);
        this.renderPowerUps(gameState.terrain.powerUps);
        this.renderTanks(gameState.tanks);
        this.renderBullets(gameState.bullets);
        this.renderEffects();

        // Debug rendering
        if (this.showDebugInfo) {
            this.renderDebugInfo(gameState);
        }

        if (this.showGrid) {
            this.renderGrid();
        }

        // Reset transform for UI rendering
        this.resetTransform();

        // Render UI elements
        if (this.showMinimap) {
            this.renderMinimap(gameState);
        }

        if (this.showFPS) {
            this.renderFPS();
        }

        this.renderCrosshair();
    }

    // Terrain rendering
    renderTerrain(terrain) {
        if (!terrain) return;

        const startX = Math.floor(this.camera.x / terrain.tileSize);
        const endX = Math.ceil((this.camera.x + this.width / this.camera.zoom) / terrain.tileSize);
        const startY = Math.floor(this.camera.y / terrain.tileSize);
        const endY = Math.ceil((this.camera.y + this.height / this.camera.zoom) / terrain.tileSize);

        for (let y = Math.max(0, startY); y < Math.min(terrain.tilesY, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(terrain.tilesX, endX); x++) {
                const tile = terrain.tiles[y][x];
                this.renderTile(tile);
            }
        }
    }

    renderTile(tile) {
        this.ctx.fillStyle = tile.color;
        this.ctx.fillRect(tile.worldX, tile.worldY, tile.bounds.width, tile.bounds.height);

        // Add some texture variation
        if (tile.type === 'grass') {
            this.ctx.fillStyle = 'rgba(45, 90, 45, 0.3)';
            this.ctx.fillRect(tile.worldX + 2, tile.worldY + 2, tile.bounds.width - 4, tile.bounds.height - 4);
        } else if (tile.type === 'water') {
            // Animated water effect
            const time = Date.now() * 0.002;
            const wave = Math.sin(time + tile.x * 0.1) * 10;
            this.ctx.fillStyle = `rgba(0, 102, 204, ${0.8 + Math.sin(time) * 0.1})`;
            this.ctx.fillRect(tile.worldX, tile.worldY + wave, tile.bounds.width, tile.bounds.height);
        }
    }

    // Obstacle rendering
    renderObstacles(obstacles) {
        if (!obstacles) return;

        obstacles.forEach(obstacle => {
            this.renderObstacle(obstacle);
        });
    }

    renderObstacle(obstacle) {
        // Main obstacle
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Health indicator for destructible obstacles
        if (obstacle.isDestructible && obstacle.health < obstacle.maxHealth) {
            const healthPercent = obstacle.health / obstacle.maxHealth;
            const barWidth = obstacle.width;
            const barHeight = 4;

            // Background
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth, barHeight);

            // Health bar
            this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' :
                               healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth * healthPercent, barHeight);
        }

        // Add visual details based on type
        this.renderObstacleDetails(obstacle);
    }

    renderObstacleDetails(obstacle) {
        switch (obstacle.type) {
            case 'building':
                // Windows
                this.ctx.fillStyle = '#ffff88';
                for (let i = 10; i < obstacle.width - 10; i += 20) {
                    for (let j = 10; j < obstacle.height - 10; j += 15) {
                        this.ctx.fillRect(obstacle.x + i, obstacle.y + j, 8, 6);
                    }
                }
                break;

            case 'tree':
                // Tree crown
                this.ctx.fillStyle = '#336633';
                this.ctx.beginPath();
                this.ctx.arc(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    obstacle.width / 2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();

                // Tree trunk
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(
                    obstacle.x + obstacle.width / 2 - 2,
                    obstacle.y + obstacle.height - 8,
                    4,
                    8
                );
                break;

            case 'rock':
                // Rock texture
                this.ctx.fillStyle = '#777777';
                this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
                this.ctx.fillStyle = '#999999';
                this.ctx.fillRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, obstacle.height - 8);
                break;
        }
    }

    // Power-up rendering
    renderPowerUps(powerUps) {
        if (!powerUps) return;

        powerUps.forEach(powerUp => {
            this.renderPowerUp(powerUp);
        });
    }

    renderPowerUp(powerUp) {
        const time = Date.now() * 0.005;
        const bob = Math.sin(time) * 3;
        const glow = Math.sin(time * 2) * 0.3 + 0.7;

        // Glow effect
        this.ctx.fillStyle = `${powerUp.color}${Math.floor(glow * 100).toString(16)}`;
        this.ctx.beginPath();
        this.ctx.arc(powerUp.x, powerUp.y + bob, powerUp.size * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Main power-up
        this.ctx.fillStyle = powerUp.color;
        this.ctx.beginPath();
        this.ctx.arc(powerUp.x, powerUp.y + bob, powerUp.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Type indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            powerUp.type.charAt(0).toUpperCase(),
            powerUp.x,
            powerUp.y + bob + 4
        );
    }

    // Tank rendering
    renderTanks(tanks) {
        if (!tanks) return;

        tanks.forEach(tank => {
            if (tank.isAlive) {
                this.renderTank(tank);
            }
        });
    }

    renderTank(tank) {
        this.ctx.save();

        // Apply hit effect
        if (tank.hitEffect > 0) {
            this.ctx.filter = `brightness(${1 + tank.hitEffect})`;
        }

        // Tank body
        this.ctx.translate(tank.position.x, tank.position.y);
        this.ctx.rotate(tank.rotation);

        // Tank shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-tank.size - 2, -tank.size - 2, tank.size * 2 + 4, tank.size * 2 + 4);

        // Tank body
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(-tank.size, -tank.size, tank.size * 2, tank.size * 2);

        // Tank tracks
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(-tank.size, -tank.size - 2, tank.size * 2, 4);
        this.ctx.fillRect(-tank.size, tank.size - 2, tank.size * 2, 4);

        this.ctx.restore();

        // Turret
        this.ctx.save();
        this.ctx.translate(tank.position.x, tank.position.y);
        this.ctx.rotate(tank.turretRotation);

        // Turret base
        this.ctx.fillStyle = tank.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, tank.size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();

        // Turret barrel
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(0, -3, tank.size + 8, 6);

        // Muzzle flash
        if (tank.muzzleFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 0, ${tank.muzzleFlash * 5})`;
            this.ctx.beginPath();
            this.ctx.arc(tank.size + 8, 0, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();

        // Health bar
        this.renderTankHealthBar(tank);

        // Player indicator
        if (tank.isPlayer) {
            this.renderPlayerIndicator(tank);
        }

        // Team indicator
        this.renderTeamIndicator(tank);
    }

    renderTankHealthBar(tank) {
        const healthPercent = tank.getHealthPercentage();
        const barWidth = tank.size * 2;
        const barHeight = 4;
        const barY = tank.position.y - tank.size - 10;

        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(tank.position.x - barWidth / 2, barY, barWidth, barHeight);

        // Health bar
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' :
                           healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        this.ctx.fillRect(
            tank.position.x - barWidth / 2,
            barY,
            barWidth * healthPercent,
            barHeight
        );
    }

    renderPlayerIndicator(tank) {
        // Arrow above player tank
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(tank.position.x, tank.position.y - tank.size - 20);
        this.ctx.lineTo(tank.position.x - 5, tank.position.y - tank.size - 15);
        this.ctx.lineTo(tank.position.x + 5, tank.position.y - tank.size - 15);
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderTeamIndicator(tank) {
        // Small team color circle
        this.ctx.fillStyle = tank.color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(
            tank.position.x + tank.size,
            tank.position.y - tank.size,
            4,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();
    }

    // Bullet rendering
    renderBullets(bullets) {
        if (!bullets) return;

        bullets.forEach(bullet => {
            if (bullet.isActive) {
                this.renderBullet(bullet);
            }
        });
    }

    renderBullet(bullet) {
        // Bullet trail
        this.ctx.strokeStyle = bullet.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.7;

        const trail = bullet.getTrailPositions();
        if (trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) {
                const alpha = (trail.length - i) / trail.length;
                this.ctx.globalAlpha = alpha * 0.7;
                this.ctx.lineTo(trail[i].x, trail[i].y);
            }
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1.0;

        // Bullet
        this.ctx.fillStyle = bullet.color;
        this.ctx.beginPath();
        this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Bullet glow
        this.ctx.fillStyle = `${bullet.color}66`;
        this.ctx.beginPath();
        this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Effects rendering
    renderEffects() {
        this.particles.forEach((particle, index) => {
            this.renderParticle(particle);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        this.explosions.forEach((explosion, index) => {
            this.renderExplosion(explosion);
            if (explosion.life <= 0) {
                this.explosions.splice(index, 1);
            }
        });
    }

    renderParticle(particle) {
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }

    renderExplosion(explosion) {
        const alpha = explosion.life / explosion.maxLife;
        const size = explosion.size * (1 - alpha) * 2;

        this.ctx.globalAlpha = alpha;

        // Outer explosion
        this.ctx.fillStyle = '#ff4400';
        this.ctx.beginPath();
        this.ctx.arc(explosion.position.x, explosion.position.y, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner explosion
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(explosion.position.x, explosion.position.y, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.globalAlpha = 1.0;
    }

    // UI rendering
    renderMinimap(gameState) {
        const minimapSize = 150;
        const minimapX = this.width - minimapSize - 10;
        const minimapY = 10;

        // Minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Scale factor
        const scaleX = minimapSize / (gameState.terrain?.width || 1200);
        const scaleY = minimapSize / (gameState.terrain?.height || 800);

        // Render tanks on minimap
        if (gameState.tanks) {
            gameState.tanks.forEach(tank => {
                if (tank.isAlive) {
                    const x = minimapX + tank.position.x * scaleX;
                    const y = minimapY + tank.position.y * scaleY;

                    this.ctx.fillStyle = tank.isPlayer ? '#ffff00' : tank.color;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }

        // Camera view indicator
        const camX = minimapX + this.camera.x * scaleX;
        const camY = minimapY + this.camera.y * scaleY;
        const camW = (this.width / this.camera.zoom) * scaleX;
        const camH = (this.height / this.camera.zoom) * scaleY;

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(camX, camY, camW, camH);
    }

    renderFPS() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 25);
    }

    renderCrosshair() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.7;

        // Crosshair lines
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1.0;
    }

    renderGrid() {
        const gridSize = 50;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = this.camera.x + this.width / this.camera.zoom;
        const endY = this.camera.y + this.height / this.camera.zoom;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.camera.y);
            this.ctx.lineTo(x, this.camera.y + this.height / this.camera.zoom);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.camera.x, y);
            this.ctx.lineTo(this.camera.x + this.width / this.camera.zoom, y);
            this.ctx.stroke();
        }
    }

    renderDebugInfo(gameState) {
        // Debug text
        const debugInfo = [
            `Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)})`,
            `Zoom: ${this.camera.zoom.toFixed(2)}`,
            `Tanks: ${gameState.tanks?.length || 0}`,
            `Bullets: ${gameState.bullets?.length || 0}`,
            `Particles: ${this.particles.length}`,
            `Explosions: ${this.explosions.length}`
        ];

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 40, 200, debugInfo.length * 20 + 10);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';

        debugInfo.forEach((line, index) => {
            this.ctx.fillText(line, 15, 60 + index * 20);
        });
    }

    // Effects creation
    addExplosion(x, y, size = 20) {
        this.explosions.push({
            position: new Vector2D(x, y),
            size: size,
            life: 0.5,
            maxLife: 0.5
        });

        // Add particles
        for (let i = 0; i < 10; i++) {
            this.addParticle(x, y, {
                velocity: Vector2D.randomInCircle(100),
                color: `hsl(${Math.random() * 60}, 100%, 70%)`,
                size: 2 + Math.random() * 3,
                life: 0.3 + Math.random() * 0.4
            });
        }
    }

    addParticle(x, y, options = {}) {
        this.particles.push({
            position: new Vector2D(x, y),
            velocity: options.velocity || Vector2D.zero(),
            color: options.color || '#ffffff',
            size: options.size || 2,
            life: options.life || 1.0,
            maxLife: options.life || 1.0,
            gravity: options.gravity || 0
        });
    }

    updateEffects(deltaTime) {
        // Update particles
        this.particles.forEach(particle => {
            particle.position.add(Vector2D.multiply(particle.velocity, deltaTime));
            particle.life -= deltaTime;
            if (particle.gravity) {
                particle.velocity.y += particle.gravity * deltaTime;
            }
        });

        // Update explosions
        this.explosions.forEach(explosion => {
            explosion.life -= deltaTime;
        });
    }

    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    // Utility methods
    setZoom(zoom) {
        this.camera.targetZoom = Math.max(0.5, Math.min(3.0, zoom));
    }

    toggleDebugMode() {
        this.showDebugInfo = !this.showDebugInfo;
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }

    screenShake(intensity = 5, duration = 0.2) {
        // Simple screen shake effect
        const originalX = this.camera.targetX;
        const originalY = this.camera.targetY;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed < duration) {
                const factor = (duration - elapsed) / duration;
                this.camera.x = originalX + (Math.random() - 0.5) * intensity * factor;
                this.camera.y = originalY + (Math.random() - 0.5) * intensity * factor;
                requestAnimationFrame(shake);
            } else {
                this.camera.x = originalX;
                this.camera.y = originalY;
            }
        };

        shake();
    }

    toString() {
        return `GameRenderer(${this.width}x${this.height}, ${this.fps} FPS)`;
    }
}