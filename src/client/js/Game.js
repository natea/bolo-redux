/**
 * Main Game class that orchestrates all game systems
 */
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }

        // Core systems
        this.renderer = new GameRenderer(this.canvas);
        this.inputManager = new InputManager(this.canvas);
        this.networkClient = new NetworkClient();
        this.hud = new HUD();

        // Game state
        this.gameState = {
            tanks: new Map(),
            bullets: [],
            terrain: null,
            gameStarted: false,
            gameEnded: false,
            playerId: null,
            playerTank: null
        };

        // Timing
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;

        // Game settings
        this.settings = {
            enableNetworking: true,
            debugMode: false,
            soundEnabled: true,
            particleEffects: true,
            cameraSmoothing: 0.1
        };

        // Performance tracking
        this.performance = {
            frameCount: 0,
            averageFPS: 0,
            lastFPSUpdate: Date.now()
        };

        this.isRunning = false;
        this.isPaused = false;

        this.initialize();
    }

    async initialize() {
        console.log('Initializing Bolo Tank Game...');

        try {
            // Initialize game systems
            this.setupEventHandlers();
            this.createTerrain();

            // Setup networking if enabled
            if (this.settings.enableNetworking) {
                await this.initializeNetworking();
            } else {
                this.initializeOfflineMode();
            }

            // Setup input handling
            this.setupInputHandlers();

            // Initialize HUD
            this.hud.setLocalPlayerId(this.gameState.playerId);

            console.log('Game initialized successfully');
            this.start();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleInitializationError(error);
        }
    }

    setupEventHandlers() {
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    createTerrain() {
        // Create terrain based on canvas size
        const terrainWidth = Math.max(1200, this.canvas.width);
        const terrainHeight = Math.max(800, this.canvas.height);

        this.gameState.terrain = new Terrain(terrainWidth, terrainHeight);
        console.log('Terrain created:', this.gameState.terrain.toString());
    }

    async initializeNetworking() {
        console.log('Initializing network connection...');

        // Setup network event handlers
        this.networkClient.on('connect', (data) => {
            this.handleNetworkConnect(data);
        });

        this.networkClient.on('disconnect', (data) => {
            this.handleNetworkDisconnect(data);
        });

        this.networkClient.on('gameState', (data) => {
            this.handleGameStateUpdate(data);
        });

        this.networkClient.on('playerJoined', (data) => {
            this.handlePlayerJoined(data);
        });

        this.networkClient.on('playerLeft', (data) => {
            this.handlePlayerLeft(data);
        });

        this.networkClient.on('tankUpdate', (data) => {
            this.handleTankUpdate(data);
        });

        this.networkClient.on('bulletFired', (data) => {
            this.handleBulletFired(data);
        });

        this.networkClient.on('playerHit', (data) => {
            this.handlePlayerHit(data);
        });

        this.networkClient.on('error', (data) => {
            this.handleNetworkError(data);
        });

        // Attempt to connect
        try {
            await this.networkClient.connect();
            this.gameState.playerId = this.networkClient.playerId;
        } catch (error) {
            console.warn('Network connection failed, falling back to offline mode:', error);
            this.initializeOfflineMode();
        }
    }

    initializeOfflineMode() {
        console.log('Starting in offline mode');
        this.settings.enableNetworking = false;
        this.gameState.playerId = 'offline_player';

        // Create local player tank
        this.createPlayerTank();

        // Update HUD status
        this.hud.updateConnectionStatus('disconnected', 'Offline Mode');
    }

    createPlayerTank() {
        const spawnPoint = this.gameState.terrain.getSpawnPoint('red');
        const playerTank = new Tank(
            this.gameState.playerId,
            spawnPoint.x,
            spawnPoint.y,
            'red'
        );

        playerTank.isPlayer = true;
        this.gameState.tanks.set(this.gameState.playerId, playerTank);
        this.gameState.playerTank = playerTank;

        console.log('Player tank created:', playerTank.toString());
    }

    setupInputHandlers() {
        // Movement input
        this.inputManager.on('move', (movement) => {
            if (this.gameState.playerTank) {
                this.gameState.playerTank.setMovement(
                    movement.forward,
                    movement.backward,
                    movement.left,
                    movement.right
                );
            }
        });

        // Aiming input
        this.inputManager.on('aim', (aimData) => {
            if (this.gameState.playerTank && aimData.screenX !== undefined) {
                const worldPos = this.renderer.screenToWorld(aimData.screenX, aimData.screenY);
                this.inputManager.setMouseWorldPosition(worldPos.x, worldPos.y);
                this.gameState.playerTank.aimTurret(worldPos.x, worldPos.y);
            }
        });

        // Shooting input
        this.inputManager.on('shoot', () => {
            this.handlePlayerShoot();
        });

        // Debug inputs
        this.inputManager.on('keyDown', (data) => {
            switch (data.key) {
                case 'F1':
                    this.renderer.toggleDebugMode();
                    break;
                case 'F2':
                    this.renderer.toggleGrid();
                    break;
                case 'F3':
                    this.settings.debugMode = !this.settings.debugMode;
                    break;
                case 'Escape':
                    this.togglePause();
                    break;
            }
        });

        // Zoom input
        this.inputManager.on('wheel', (data) => {
            const currentZoom = this.renderer.camera.targetZoom;
            const newZoom = currentZoom + data.delta;
            this.renderer.setZoom(newZoom);
        });
    }

    // Game loop
    start() {
        if (this.isRunning) return;

        console.log('Starting game loop...');
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();

        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 1/30); // Max 30 FPS worth of time

        if (!this.isPaused) {
            this.update(this.deltaTime);
            this.render();
        }

        // Update performance metrics
        this.updatePerformanceMetrics();

        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Update player tank
        if (this.gameState.playerTank) {
            this.gameState.playerTank.update(deltaTime);

            // Update camera to follow player
            this.renderer.setCameraTarget(
                this.gameState.playerTank.position.x,
                this.gameState.playerTank.position.y
            );

            // Send tank update to network
            if (this.settings.enableNetworking && this.networkClient.isConnected) {
                this.networkClient.sendTankUpdate(this.gameState.playerTank);
            }

            // Update HUD with player stats
            this.hud.updatePlayerStats(
                this.gameState.playerTank.health,
                this.gameState.playerTank.maxHealth,
                this.gameState.playerTank.ammo,
                this.gameState.playerTank.maxAmmo
            );
        }

        // Update all tanks
        this.gameState.tanks.forEach(tank => {
            tank.update(deltaTime);
        });

        // Update bullets
        this.updateBullets(deltaTime);

        // Update terrain effects
        this.gameState.terrain.updatePowerUps();

        // Update renderer effects
        this.renderer.updateEffects(deltaTime);

        // Check collisions
        this.checkCollisions();

        // Handle respawning
        this.handleRespawning(deltaTime);
    }

    updateBullets(deltaTime) {
        // Update existing bullets
        for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameState.bullets[i];
            bullet.update(deltaTime);

            // Remove inactive bullets
            if (!bullet.isActive || bullet.isOutOfBounds(
                this.gameState.terrain.width,
                this.gameState.terrain.height
            )) {
                this.gameState.bullets.splice(i, 1);
                continue;
            }

            // Check terrain collision
            if (bullet.isCollidingWithTerrain(this.gameState.terrain)) {
                this.handleBulletTerrainCollision(bullet);
                this.gameState.bullets.splice(i, 1);
                continue;
            }
        }
    }

    checkCollisions() {
        // Bullet vs Tank collisions
        for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameState.bullets[i];
            let bulletHit = false;

            this.gameState.tanks.forEach(tank => {
                if (bullet.isCollidingWithTank(tank)) {
                    this.handleBulletTankCollision(bullet, tank);
                    bulletHit = true;
                }
            });

            if (bulletHit) {
                this.gameState.bullets.splice(i, 1);
            }
        }

        // Tank vs Terrain collisions
        this.gameState.tanks.forEach(tank => {
            this.checkTankTerrainCollision(tank);
        });

        // Tank vs PowerUp collisions
        this.gameState.tanks.forEach(tank => {
            this.checkTankPowerUpCollision(tank);
        });
    }

    checkTankTerrainCollision(tank) {
        const futurePos = Vector2D.add(tank.position, Vector2D.multiply(tank.velocity, this.deltaTime));

        // Check collision with terrain tiles
        const tiles = this.gameState.terrain.getTilesInRadius(futurePos, tank.size);
        let hasCollision = false;

        tiles.forEach(tile => {
            if (tile.isSolid && tank.isCollidingWithBounds(tile.bounds)) {
                hasCollision = true;
            }
        });

        // Check collision with obstacles
        const obstacles = this.gameState.terrain.getObstaclesInRadius(futurePos, tank.size);
        obstacles.forEach(obstacle => {
            if (tank.isCollidingWithBounds(obstacle)) {
                hasCollision = true;
            }
        });

        // Stop movement if collision detected
        if (hasCollision) {
            tank.velocity.multiply(0.5); // Gradual stop instead of instant
        }
    }

    checkTankPowerUpCollision(tank) {
        this.gameState.terrain.powerUps.forEach(powerUp => {
            const distance = tank.position.distanceTo(new Vector2D(powerUp.x, powerUp.y));
            if (distance < tank.size + powerUp.size) {
                this.handlePowerUpCollection(tank, powerUp);
            }
        });
    }

    handleBulletTankCollision(bullet, tank) {
        const wasTankDestroyed = tank.takeDamage(bullet.damage);

        // Create explosion effect
        this.renderer.addExplosion(bullet.position.x, bullet.position.y, bullet.damage);

        // Screen shake for player hits
        if (tank.isPlayer) {
            this.renderer.screenShake(8, 0.3);
        }

        // Network notification
        if (this.settings.enableNetworking && this.networkClient.isConnected) {
            this.networkClient.sendPlayerHit(tank.id, bullet.damage, bullet.ownerId);
        }

        // Update scores
        if (wasTankDestroyed) {
            this.handleTankDestroyed(tank, bullet.ownerId);
        }

        console.log(`Bullet hit tank ${tank.id} for ${bullet.damage} damage`);
    }

    handleBulletTerrainCollision(bullet) {
        // Create smaller explosion effect
        this.renderer.addExplosion(bullet.position.x, bullet.position.y, bullet.damage * 0.5);

        // Check for destructible obstacles
        const obstacles = this.gameState.terrain.getObstaclesInRadius(bullet.position, bullet.size);
        obstacles.forEach(obstacle => {
            if (obstacle.isDestructible && bullet.isCollidingWithBounds(obstacle)) {
                const wasDestroyed = this.gameState.terrain.damageObstacle(obstacle.id, bullet.damage);
                if (wasDestroyed) {
                    this.renderer.addExplosion(
                        obstacle.x + obstacle.width / 2,
                        obstacle.y + obstacle.height / 2,
                        30
                    );
                }
            }
        });
    }

    handleTankDestroyed(tank, killerId) {
        console.log(`Tank ${tank.id} destroyed by ${killerId}`);

        // Create large explosion
        this.renderer.addExplosion(tank.position.x, tank.position.y, 50);

        // Update scores
        const killerTank = this.gameState.tanks.get(killerId);
        if (killerTank && killerTank !== tank) {
            // Award points to killer
            this.updatePlayerScore(killerId, 100, 1, 0);
        }

        // Penalty for death
        this.updatePlayerScore(tank.id, -25, 0, 1);

        // HUD notification
        if (killerTank) {
            this.hud.onPlayerKill(
                { id: killerId, name: `Player_${killerId.slice(0, 6)}` },
                { id: tank.id, name: `Player_${tank.id.slice(0, 6)}` }
            );
        }

        // Schedule respawn
        this.scheduleRespawn(tank, 3000); // 3 seconds
    }

    handlePowerUpCollection(tank, powerUp) {
        const collectedPowerUp = this.gameState.terrain.collectPowerUp(powerUp.id);
        if (!collectedPowerUp) return;

        // Apply power-up effects
        switch (collectedPowerUp.type) {
            case 'health':
                tank.heal(collectedPowerUp.effect.healthRestore);
                break;
            case 'ammo':
                tank.reloadAmmo(collectedPowerUp.effect.ammoRestore);
                break;
            case 'speed':
                // TODO: Implement temporary speed boost
                break;
            case 'damage':
                // TODO: Implement temporary damage boost
                break;
        }

        // Visual feedback
        this.renderer.addExplosion(powerUp.x, powerUp.y, 15);

        console.log(`Tank ${tank.id} collected power-up: ${collectedPowerUp.type}`);
    }

    scheduleRespawn(tank, delay) {
        setTimeout(() => {
            const spawnPoint = this.gameState.terrain.getSpawnPoint(tank.team);
            tank.respawn(spawnPoint.x, spawnPoint.y);
            console.log(`Tank ${tank.id} respawned at (${spawnPoint.x}, ${spawnPoint.y})`);
        }, delay);
    }

    handleRespawning(deltaTime) {
        // Spawn power-ups randomly
        if (Math.random() < 0.001) { // 0.1% chance per frame
            this.spawnRandomPowerUp();
        }
    }

    spawnRandomPowerUp() {
        const types = ['health', 'ammo', 'speed', 'damage'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Find safe spawn location
        let attempts = 0;
        let spawnX, spawnY;

        do {
            spawnX = Math.random() * this.gameState.terrain.width;
            spawnY = Math.random() * this.gameState.terrain.height;
            attempts++;
        } while (this.gameState.terrain.isPositionSolid(spawnX, spawnY) && attempts < 10);

        if (attempts < 10) {
            this.gameState.terrain.spawnPowerUp(spawnX, spawnY, type);
        }
    }

    handlePlayerShoot() {
        if (!this.gameState.playerTank || !this.gameState.playerTank.isAlive) return;

        const bullet = this.gameState.playerTank.shoot();
        if (bullet) {
            this.gameState.bullets.push(bullet);

            // Screen shake for shooting
            this.renderer.screenShake(2, 0.1);

            // Network notification
            if (this.settings.enableNetworking && this.networkClient.isConnected) {
                this.networkClient.sendBulletFired(bullet);
            }

            console.log('Player fired bullet');
        }
    }

    updatePlayerScore(playerId, scoreChange, killsChange = 0, deathsChange = 0) {
        // Update local score tracking
        const playerName = `Player_${playerId.slice(0, 6)}`;

        // Get current score or initialize
        let currentScore = 0;
        let currentKills = 0;
        let currentDeaths = 0;

        // Update HUD score
        this.hud.updateScore(
            playerId,
            playerName,
            currentScore + scoreChange,
            currentKills + killsChange,
            currentDeaths + deathsChange
        );
    }

    render() {
        this.renderer.render(this.gameState);
    }

    // Network event handlers
    handleNetworkConnect(data) {
        console.log('Connected to game server');
        this.hud.updateConnectionStatus('connected');

        // Create player tank if not exists
        if (!this.gameState.playerTank) {
            this.createPlayerTank();
        }
    }

    handleNetworkDisconnect(data) {
        console.log('Disconnected from game server:', data.reason);
        this.hud.updateConnectionStatus('disconnected', data.reason);
    }

    handleGameStateUpdate(data) {
        // Update game state from server
        if (data.players) {
            data.players.forEach(playerData => {
                if (playerData.id !== this.gameState.playerId) {
                    this.updateRemoteTank(playerData);
                }

                // Update HUD
                this.hud.updatePlayer(playerData.id, playerData);
                this.hud.updateScore(playerData.id, playerData.name, playerData.score || 0);
            });
        }

        if (data.bullets) {
            // Sync bullets (basic implementation)
            // TODO: More sophisticated bullet synchronization
        }

        if (data.terrain) {
            this.gameState.terrain.updateFromNetworkState(data.terrain);
        }
    }

    updateRemoteTank(playerData) {
        let tank = this.gameState.tanks.get(playerData.id);

        if (!tank) {
            // Create new remote tank
            tank = new Tank(playerData.id, playerData.x, playerData.y, playerData.team || 'neutral');
            tank.isPlayer = false;
            this.gameState.tanks.set(playerData.id, tank);
        }

        // Update tank state
        tank.updateFromNetworkState(playerData);
    }

    handlePlayerJoined(data) {
        console.log('Player joined:', data.playerName);
        this.hud.onPlayerJoin(data);
    }

    handlePlayerLeft(data) {
        console.log('Player left:', data.playerName);
        this.gameState.tanks.delete(data.playerId);
        this.hud.onPlayerLeave(data);
    }

    handleTankUpdate(data) {
        this.updateRemoteTank(data);
    }

    handleBulletFired(data) {
        // Create bullet from network data
        const bullet = new Bullet(data.x, data.y, data.direction, data.ownerId);
        bullet.updateFromNetworkState(data);
        this.gameState.bullets.push(bullet);
    }

    handlePlayerHit(data) {
        const tank = this.gameState.tanks.get(data.targetId);
        if (tank) {
            tank.takeDamage(data.damage);
            this.renderer.addExplosion(tank.position.x, tank.position.y, data.damage);
        }
    }

    handleNetworkError(data) {
        console.error('Network error:', data.error);
        this.hud.updateConnectionStatus('error', data.error);
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);

        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: monospace;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>Game Initialization Failed</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Reload Game</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Game control methods
    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }

    resume() {
        this.isPaused = false;
        this.lastFrameTime = performance.now(); // Reset frame time to prevent large delta
        console.log('Game resumed');
    }

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }

    restart() {
        this.stop();
        this.gameState.tanks.clear();
        this.gameState.bullets = [];
        this.createPlayerTank();
        this.start();
        console.log('Game restarted');
    }

    // Utility methods
    updatePerformanceMetrics() {
        this.performance.frameCount++;
        const now = Date.now();

        if (now - this.performance.lastFPSUpdate >= 1000) {
            this.performance.averageFPS = Math.round(
                (this.performance.frameCount * 1000) / (now - this.performance.lastFPSUpdate)
            );
            this.performance.frameCount = 0;
            this.performance.lastFPSUpdate = now;
        }
    }

    handleResize() {
        this.renderer.resizeCanvas();
    }

    // Settings
    setSetting(key, value) {
        this.settings[key] = value;
        console.log(`Setting ${key} = ${value}`);
    }

    getSetting(key) {
        return this.settings[key];
    }

    // Cleanup
    cleanup() {
        console.log('Cleaning up game...');

        this.stop();

        if (this.networkClient) {
            this.networkClient.disconnect();
        }

        if (this.inputManager) {
            this.inputManager.destroy();
        }

        if (this.hud) {
            this.hud.destroy();
        }
    }

    // Debug methods
    getGameInfo() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            tanks: this.gameState.tanks.size,
            bullets: this.gameState.bullets.length,
            fps: this.performance.averageFPS,
            playerId: this.gameState.playerId,
            networkConnected: this.networkClient?.isConnected || false
        };
    }

    toString() {
        return `Game(running: ${this.isRunning}, tanks: ${this.gameState.tanks.size}, bullets: ${this.gameState.bullets.length})`;
    }
}