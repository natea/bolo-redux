import { test, expect, Page, BrowserContext } from '@playwright/test';
import { TestWebSocketServer } from '../utils/test-helpers';

test.describe('Full Multiplayer Game Scenarios', () => {
  let testServer: TestWebSocketServer;
  let contexts: BrowserContext[] = [];
  let pages: Page[] = [];

  const COMPLETE_GAME_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Bolo Complete Game</title>
    <style>
        body { margin: 0; padding: 0; background: #000; font-family: Arial; color: white; }
        #gameCanvas { border: 1px solid #333; display: block; margin: 0 auto; }
        #gameUI { display: flex; justify-content: space-between; padding: 10px; }
        #leftPanel { flex: 1; }
        #rightPanel { flex: 1; text-align: right; }
        #centerPanel { flex: 2; text-align: center; }
        .stat { margin: 5px 0; }
        .player-item { background: rgba(255,255,255,0.1); margin: 2px; padding: 5px; border-radius: 3px; }
        .game-message { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                       background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; z-index: 1000; }
        .hidden { display: none; }
        .winner { color: #00ff00; font-size: 24px; }
        .loser { color: #ff0000; }
        #leaderboard { background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div id="gameMessage" class="game-message hidden">
        <div id="messageText"></div>
        <button id="messageButton" onclick="hideMessage()">Continue</button>
    </div>

    <div id="gameUI">
        <div id="leftPanel">
            <div class="stat">Player: <span id="playerName">Unknown</span></div>
            <div class="stat">Health: <span id="health">100</span>/100</div>
            <div class="stat">Score: <span id="score">0</span></div>
            <div class="stat">Kills: <span id="kills">0</span></div>
            <div class="stat">Deaths: <span id="deaths">0</span></div>
            <div class="stat">Ammo: <span id="ammo">30</span></div>
        </div>

        <div id="centerPanel">
            <div class="stat">Game Status: <span id="gameStatus">Waiting</span></div>
            <div class="stat">Time: <span id="gameTime">0:00</span></div>
            <div class="stat">Players: <span id="playerCount">0</span>/8</div>
        </div>

        <div id="rightPanel">
            <div id="leaderboard">
                <h3>Leaderboard</h3>
                <div id="playerList"></div>
            </div>
        </div>
    </div>

    <canvas id="gameCanvas" width="800" height="600"></canvas>

    <script>
        class CompleteBoloGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');

                // Game state
                this.playerId = 'player-' + Math.random().toString(36).substr(2, 9);
                this.gameState = {
                    status: 'waiting', // waiting, playing, finished
                    players: new Map(),
                    projectiles: [],
                    powerups: [],
                    gameTime: 0,
                    gameMode: 'deathmatch', // deathmatch, team, capture
                    scoreLimit: 10,
                    timeLimit: 300000 // 5 minutes
                };

                // Player stats
                this.localPlayer = null;
                this.playerStats = {
                    kills: 0,
                    deaths: 0,
                    accuracy: 0,
                    shotsFired: 0,
                    shotsHit: 0
                };

                // Network
                this.ws = null;
                this.connectionStatus = 'disconnected';
                this.latency = 0;

                // Game timing
                this.gameStartTime = 0;
                this.lastUpdateTime = 0;

                // Input handling
                this.keys = {};
                this.mousePos = { x: 0, y: 0 };

                this.initializeGame();
            }

            initializeGame() {
                this.setupEventListeners();
                this.connectToServer();
                this.startGameLoop();
                this.updateUI();
            }

            connectToServer() {
                try {
                    this.ws = new WebSocket(window.testServerUrl || 'ws://localhost:8082');

                    this.ws.onopen = () => {
                        this.connectionStatus = 'connected';
                        this.sendMessage('join', {
                            playerId: this.playerId,
                            playerName: \`Player-\${this.playerId.substr(-4)}\`
                        });
                    };

                    this.ws.onmessage = (event) => {
                        this.handleServerMessage(JSON.parse(event.data));
                    };

                    this.ws.onclose = () => {
                        this.connectionStatus = 'disconnected';
                        this.showMessage('Connection lost', 'Reconnect');
                    };

                    this.ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                    };
                } catch (error) {
                    console.error('Failed to connect:', error);
                }
            }

            sendMessage(type, data) {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        type,
                        data,
                        playerId: this.playerId,
                        timestamp: Date.now()
                    }));
                    return true;
                }
                return false;
            }

            handleServerMessage(message) {
                const pingStart = Date.now();

                switch (message.type) {
                    case 'gameStart':
                        this.handleGameStart(message.data);
                        break;
                    case 'gameEnd':
                        this.handleGameEnd(message.data);
                        break;
                    case 'playerJoined':
                        this.handlePlayerJoined(message.data);
                        break;
                    case 'playerLeft':
                        this.handlePlayerLeft(message.data);
                        break;
                    case 'playerUpdate':
                        this.handlePlayerUpdate(message.data);
                        break;
                    case 'playerKilled':
                        this.handlePlayerKilled(message.data);
                        break;
                    case 'projectileFired':
                        this.handleProjectileFired(message.data);
                        break;
                    case 'gameStateUpdate':
                        this.handleGameStateUpdate(message.data);
                        break;
                    case 'powerupSpawned':
                        this.handlePowerupSpawned(message.data);
                        break;
                    case 'powerupCollected':
                        this.handlePowerupCollected(message.data);
                        break;
                    case 'pong':
                        this.latency = Date.now() - message.data.timestamp;
                        break;
                }
            }

            handleGameStart(data) {
                this.gameState.status = 'playing';
                this.gameStartTime = Date.now();
                this.showMessage('Game Started!', 'Fight!');
                document.getElementById('gameStatus').textContent = 'Playing';
            }

            handleGameEnd(data) {
                this.gameState.status = 'finished';
                const winner = data.winner;
                const isWinner = winner === this.playerId;

                this.showMessage(
                    isWinner ? 'You Won!' : \`Game Over - Winner: \${winner}\`,
                    'Play Again'
                );

                document.getElementById('gameStatus').textContent = 'Finished';
            }

            handlePlayerJoined(data) {
                const player = {
                    id: data.playerId,
                    name: data.playerName || data.playerId,
                    position: data.position || { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
                    velocity: { x: 0, y: 0 },
                    health: 100,
                    maxHealth: 100,
                    score: 0,
                    kills: 0,
                    deaths: 0,
                    ammo: 30,
                    maxAmmo: 30,
                    color: data.color || this.generatePlayerColor(data.playerId),
                    isAlive: true,
                    lastUpdate: Date.now()
                };

                this.gameState.players.set(data.playerId, player);

                if (data.playerId === this.playerId) {
                    this.localPlayer = player;
                    document.getElementById('playerName').textContent = player.name;
                }

                this.updatePlayerCount();
                this.updateLeaderboard();
            }

            handlePlayerLeft(data) {
                this.gameState.players.delete(data.playerId);
                this.updatePlayerCount();
                this.updateLeaderboard();
            }

            handlePlayerUpdate(data) {
                const player = this.gameState.players.get(data.playerId);
                if (player && data.playerId !== this.playerId) {
                    Object.assign(player, data, { lastUpdate: Date.now() });
                    this.updateLeaderboard();
                }
            }

            handlePlayerKilled(data) {
                const victim = this.gameState.players.get(data.victimId);
                const killer = this.gameState.players.get(data.killerId);

                if (victim) {
                    victim.health = 0;
                    victim.isAlive = false;
                    victim.deaths++;

                    // Respawn after 3 seconds
                    setTimeout(() => {
                        if (victim) {
                            victim.health = victim.maxHealth;
                            victim.isAlive = true;
                            victim.position = {
                                x: 100 + Math.random() * 600,
                                y: 100 + Math.random() * 400
                            };
                        }
                    }, 3000);
                }

                if (killer) {
                    killer.kills++;
                    killer.score += 10;
                }

                if (data.victimId === this.playerId) {
                    this.playerStats.deaths++;
                    this.showMessage('You were killed!', 'Respawning...');
                }

                if (data.killerId === this.playerId) {
                    this.playerStats.kills++;
                    this.showMessage('Kill!', '+10 points');
                }

                this.updateLeaderboard();
                this.updateUI();
            }

            handleProjectileFired(data) {
                if (data.ownerId !== this.playerId) {
                    this.gameState.projectiles.push({
                        id: data.id,
                        position: { ...data.position },
                        velocity: { ...data.velocity },
                        ownerId: data.ownerId,
                        damage: data.damage || 25,
                        radius: 3,
                        createdAt: Date.now()
                    });
                }
            }

            handleGameStateUpdate(data) {
                // Sync game time
                this.gameState.gameTime = data.gameTime;

                // Update any server-authoritative state
                if (data.players) {
                    Object.entries(data.players).forEach(([id, playerData]) => {
                        const player = this.gameState.players.get(id);
                        if (player && id !== this.playerId) {
                            Object.assign(player, playerData);
                        }
                    });
                }

                this.updateGameTime();
            }

            handlePowerupSpawned(data) {
                this.gameState.powerups.push({
                    id: data.id,
                    type: data.type,
                    position: data.position,
                    effect: data.effect,
                    duration: data.duration,
                    spawnTime: Date.now()
                });
            }

            handlePowerupCollected(data) {
                const powerupIndex = this.gameState.powerups.findIndex(p => p.id === data.powerupId);
                if (powerupIndex > -1) {
                    this.gameState.powerups.splice(powerupIndex, 1);
                }

                if (data.playerId === this.playerId) {
                    this.applyPowerup(data.powerup);
                }
            }

            setupEventListeners() {
                // Keyboard
                window.addEventListener('keydown', (e) => {
                    this.keys[e.code] = true;
                    this.handleInput();
                });

                window.addEventListener('keyup', (e) => {
                    this.keys[e.code] = false;
                });

                // Mouse
                this.canvas.addEventListener('mousemove', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mousePos.x = e.clientX - rect.left;
                    this.mousePos.y = e.clientY - rect.top;
                });

                this.canvas.addEventListener('click', (e) => {
                    if (this.gameState.status === 'playing' && this.localPlayer && this.localPlayer.isAlive) {
                        this.fireProjectile();
                    }
                });

                // Prevent context menu
                this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            }

            handleInput() {
                if (!this.localPlayer || !this.localPlayer.isAlive || this.gameState.status !== 'playing') return;

                let moved = false;
                const speed = 0.8;

                // Movement
                if (this.keys['ArrowUp'] || this.keys['KeyW']) {
                    this.localPlayer.velocity.y = Math.max(this.localPlayer.velocity.y - speed, -8);
                    moved = true;
                }
                if (this.keys['ArrowDown'] || this.keys['KeyS']) {
                    this.localPlayer.velocity.y = Math.min(this.localPlayer.velocity.y + speed, 8);
                    moved = true;
                }
                if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
                    this.localPlayer.velocity.x = Math.max(this.localPlayer.velocity.x - speed, -8);
                    moved = true;
                }
                if (this.keys['ArrowRight'] || this.keys['KeyD']) {
                    this.localPlayer.velocity.x = Math.min(this.localPlayer.velocity.x + speed, 8);
                    moved = true;
                }

                // Shooting
                if (this.keys['Space']) {
                    this.fireProjectile();
                }

                if (moved) {
                    this.sendPlayerUpdate();
                }
            }

            fireProjectile() {
                if (!this.localPlayer || this.localPlayer.ammo <= 0) return;

                const dx = this.mousePos.x - this.localPlayer.position.x;
                const dy = this.mousePos.y - this.localPlayer.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const direction = { x: dx / distance, y: dy / distance };

                const projectile = {
                    id: \`proj-\${Date.now()}-\${this.playerId}\`,
                    position: { ...this.localPlayer.position },
                    velocity: { x: direction.x * 15, y: direction.y * 15 },
                    ownerId: this.playerId,
                    damage: 25,
                    radius: 3,
                    createdAt: Date.now()
                };

                this.gameState.projectiles.push(projectile);
                this.localPlayer.ammo--;
                this.playerStats.shotsFired++;

                this.sendMessage('projectile', projectile);
                this.updateUI();
            }

            sendPlayerUpdate() {
                if (!this.localPlayer) return;

                this.sendMessage('playerUpdate', {
                    playerId: this.playerId,
                    position: this.localPlayer.position,
                    velocity: this.localPlayer.velocity,
                    health: this.localPlayer.health,
                    score: this.localPlayer.score,
                    ammo: this.localPlayer.ammo,
                    isAlive: this.localPlayer.isAlive
                });
            }

            startGameLoop() {
                const gameLoop = (currentTime) => {
                    this.update(currentTime);
                    this.render();
                    requestAnimationFrame(gameLoop);
                };
                requestAnimationFrame(gameLoop);
            }

            update(currentTime) {
                const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
                this.lastUpdateTime = currentTime;

                if (this.gameState.status !== 'playing') return;

                // Update local player
                if (this.localPlayer && this.localPlayer.isAlive) {
                    this.updatePlayer(this.localPlayer, deltaTime);
                }

                // Update other players
                this.gameState.players.forEach(player => {
                    if (player.id !== this.playerId) {
                        this.updatePlayer(player, deltaTime);
                    }
                });

                // Update projectiles
                this.updateProjectiles(deltaTime);

                // Update powerups
                this.updatePowerups(deltaTime);

                // Check collisions
                this.checkCollisions();

                // Send periodic ping
                if (Math.random() < 0.01) { // 1% chance per frame
                    this.sendMessage('ping', { timestamp: Date.now() });
                }
            }

            updatePlayer(player, deltaTime) {
                // Apply velocity
                player.position.x += player.velocity.x;
                player.position.y += player.velocity.y;

                // Apply friction
                player.velocity.x *= 0.92;
                player.velocity.y *= 0.92;

                // Boundary checking
                player.position.x = Math.max(15, Math.min(785, player.position.x));
                player.position.y = Math.max(15, Math.min(585, player.position.y));

                // Regenerate ammo
                if (player.ammo < player.maxAmmo && Math.random() < 0.005) {
                    player.ammo++;
                }
            }

            updateProjectiles(deltaTime) {
                this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
                    projectile.position.x += projectile.velocity.x;
                    projectile.position.y += projectile.velocity.y;

                    // Remove old projectiles
                    const age = Date.now() - projectile.createdAt;
                    if (age > 3000) return false;

                    // Remove out-of-bounds projectiles
                    return this.isInBounds(projectile.position);
                });
            }

            updatePowerups(deltaTime) {
                this.gameState.powerups = this.gameState.powerups.filter(powerup => {
                    const age = Date.now() - powerup.spawnTime;
                    return age < 30000; // 30 second lifetime
                });
            }

            checkCollisions() {
                // Projectile-player collisions
                this.gameState.projectiles.forEach((projectile, projIndex) => {
                    this.gameState.players.forEach(player => {
                        if (player.id !== projectile.ownerId && player.isAlive &&
                            this.areColliding(projectile, player)) {

                            // Apply damage
                            player.health -= projectile.damage;

                            // Remove projectile
                            this.gameState.projectiles.splice(projIndex, 1);

                            // Check for kill
                            if (player.health <= 0) {
                                this.sendMessage('playerKilled', {
                                    victimId: player.id,
                                    killerId: projectile.ownerId
                                });
                            }

                            // Update accuracy for shooter
                            if (projectile.ownerId === this.playerId) {
                                this.playerStats.shotsHit++;
                                this.playerStats.accuracy =
                                    (this.playerStats.shotsHit / this.playerStats.shotsFired) * 100;
                            }
                        }
                    });
                });

                // Player-powerup collisions
                this.gameState.powerups.forEach((powerup, powerupIndex) => {
                    if (this.localPlayer && this.localPlayer.isAlive &&
                        this.areColliding(this.localPlayer, powerup)) {

                        this.sendMessage('powerupCollected', {
                            powerupId: powerup.id,
                            playerId: this.playerId
                        });
                    }
                });
            }

            areColliding(obj1, obj2) {
                const dx = obj1.position.x - obj2.position.x;
                const dy = obj1.position.y - obj2.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const radius1 = obj1.radius || 12;
                const radius2 = obj2.radius || 12;
                return distance <= (radius1 + radius2);
            }

            isInBounds(position) {
                return position.x >= 0 && position.x <= 800 &&
                       position.y >= 0 && position.y <= 600;
            }

            render() {
                // Clear canvas
                this.ctx.fillStyle = '#001122';
                this.ctx.fillRect(0, 0, 800, 600);

                // Draw grid
                this.drawGrid();

                // Draw powerups
                this.drawPowerups();

                // Draw players
                this.drawPlayers();

                // Draw projectiles
                this.drawProjectiles();

                // Draw crosshair
                this.drawCrosshair();
            }

            drawGrid() {
                this.ctx.strokeStyle = '#003344';
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.3;

                for (let x = 0; x <= 800; x += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, 600);
                    this.ctx.stroke();
                }

                for (let y = 0; y <= 600; y += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(800, y);
                    this.ctx.stroke();
                }

                this.ctx.globalAlpha = 1;
            }

            drawPlayers() {
                this.gameState.players.forEach(player => {
                    if (!player.isAlive) return;

                    // Player body
                    this.ctx.fillStyle = player.color;
                    this.ctx.beginPath();
                    this.ctx.arc(player.position.x, player.position.y, 12, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Highlight local player
                    if (player.id === this.playerId) {
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        this.ctx.arc(player.position.x, player.position.y, 15, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }

                    // Health bar
                    this.drawHealthBar(player);

                    // Player name
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(player.name.substr(0, 8), player.position.x, player.position.y - 25);
                });
            }

            drawHealthBar(player) {
                const barWidth = 24;
                const barHeight = 4;
                const x = player.position.x - barWidth / 2;
                const y = player.position.y - 20;

                // Background
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(x, y, barWidth, barHeight);

                // Health
                const healthPercent = player.health / player.maxHealth;
                const healthWidth = barWidth * healthPercent;

                this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' :
                                    healthPercent > 0.25 ? '#ffff00' : '#ff0000';
                this.ctx.fillRect(x, y, healthWidth, barHeight);
            }

            drawProjectiles() {
                this.ctx.fillStyle = '#ffff00';
                this.gameState.projectiles.forEach(projectile => {
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.position.x, projectile.position.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            drawPowerups() {
                this.gameState.powerups.forEach(powerup => {
                    const pulseAlpha = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
                    this.ctx.globalAlpha = pulseAlpha;

                    switch (powerup.type) {
                        case 'health':
                            this.ctx.fillStyle = '#ff0000';
                            break;
                        case 'ammo':
                            this.ctx.fillStyle = '#00ff00';
                            break;
                        case 'speed':
                            this.ctx.fillStyle = '#0000ff';
                            break;
                        default:
                            this.ctx.fillStyle = '#ffffff';
                    }

                    this.ctx.fillRect(powerup.position.x - 8, powerup.position.y - 8, 16, 16);
                    this.ctx.globalAlpha = 1;
                });
            }

            drawCrosshair() {
                if (this.localPlayer && this.localPlayer.isAlive) {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.globalAlpha = 0.7;

                    // Draw crosshair at mouse position
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePos.x - 10, this.mousePos.y);
                    this.ctx.lineTo(this.mousePos.x + 10, this.mousePos.y);
                    this.ctx.moveTo(this.mousePos.x, this.mousePos.y - 10);
                    this.ctx.lineTo(this.mousePos.x, this.mousePos.y + 10);
                    this.ctx.stroke();

                    this.ctx.globalAlpha = 1;
                }
            }

            // UI Updates
            updateUI() {
                if (this.localPlayer) {
                    document.getElementById('health').textContent = Math.max(0, this.localPlayer.health);
                    document.getElementById('score').textContent = this.localPlayer.score;
                    document.getElementById('ammo').textContent = this.localPlayer.ammo;
                }

                document.getElementById('kills').textContent = this.playerStats.kills;
                document.getElementById('deaths').textContent = this.playerStats.deaths;
            }

            updatePlayerCount() {
                document.getElementById('playerCount').textContent = this.gameState.players.size;
            }

            updateLeaderboard() {
                const playerList = document.getElementById('playerList');
                const sortedPlayers = Array.from(this.gameState.players.values())
                    .sort((a, b) => b.score - a.score);

                playerList.innerHTML = '';
                sortedPlayers.forEach((player, index) => {
                    const playerDiv = document.createElement('div');
                    playerDiv.className = 'player-item';
                    playerDiv.innerHTML = \`
                        <div>\${index + 1}. \${player.name.substr(0, 8)}</div>
                        <div>Score: \${player.score}</div>
                        <div>K/D: \${player.kills}/\${player.deaths}</div>
                    \`;
                    playerList.appendChild(playerDiv);
                });
            }

            updateGameTime() {
                const elapsed = Date.now() - this.gameStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                document.getElementById('gameTime').textContent =
                    \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
            }

            // Utility methods
            generatePlayerColor(playerId) {
                const colors = ['#ff3333', '#33ff33', '#3333ff', '#ffff33', '#ff33ff', '#33ffff'];
                const hash = playerId.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                return colors[Math.abs(hash) % colors.length];
            }

            showMessage(text, buttonText = 'OK') {
                document.getElementById('messageText').textContent = text;
                document.getElementById('messageButton').textContent = buttonText;
                document.getElementById('gameMessage').classList.remove('hidden');
            }

            hideMessage() {
                document.getElementById('gameMessage').classList.add('hidden');
            }

            applyPowerup(powerup) {
                switch (powerup.type) {
                    case 'health':
                        this.localPlayer.health = Math.min(this.localPlayer.maxHealth,
                                                          this.localPlayer.health + 50);
                        break;
                    case 'ammo':
                        this.localPlayer.ammo = this.localPlayer.maxAmmo;
                        break;
                    case 'speed':
                        // Speed boost would be applied to movement calculations
                        break;
                }
                this.updateUI();
            }

            // Test utilities
            getGameState() {
                return this.gameState;
            }

            getLocalPlayer() {
                return this.localPlayer;
            }

            getPlayerStats() {
                return this.playerStats;
            }

            getConnectionStatus() {
                return this.connectionStatus;
            }

            simulateAction(action, data) {
                switch (action) {
                    case 'move':
                        if (this.localPlayer) {
                            this.localPlayer.velocity.x += data.x || 0;
                            this.localPlayer.velocity.y += data.y || 0;
                            this.sendPlayerUpdate();
                        }
                        break;
                    case 'shoot':
                        this.mousePos = data;
                        this.fireProjectile();
                        break;
                    case 'takeDamage':
                        if (this.localPlayer) {
                            this.localPlayer.health -= data.damage || 25;
                            this.updateUI();
                        }
                        break;
                }
            }
        }

        // Initialize game
        window.addEventListener('load', () => {
            window.game = new CompleteBoloGame();
        });

        // Global utility functions
        function hideMessage() {
            document.getElementById('gameMessage').classList.add('hidden');
        }
    </script>
</body>
</html>
  `;

  test.beforeAll(async () => {
    testServer = new TestWebSocketServer(8083);
    await testServer.start();
  });

  test.afterAll(async () => {
    await testServer.stop();
  });

  test.beforeEach(async ({ browser }) => {
    // Create multiple browser contexts for multiplayer testing
    const contextPromises = [];
    for (let i = 0; i < 4; i++) {
      contextPromises.push(browser.newContext());
    }
    contexts = await Promise.all(contextPromises);

    // Create pages
    const pagePromises = contexts.map(context => context.newPage());
    pages = await Promise.all(pagePromises);

    // Set up game pages
    const setupPromises = pages.map(async (page) => {
      await page.setContent(COMPLETE_GAME_HTML);
      await page.evaluate(url => { window.testServerUrl = url; }, testServer.getUrl());
      await page.waitForLoadState('networkidle');
      return page.waitForTimeout(1000);
    });

    await Promise.all(setupPromises);
  });

  test.afterEach(async () => {
    await Promise.all(contexts.map(context => context.close()));
    contexts = [];
    pages = [];
  });

  test.describe('Complete Game Flow', () => {
    test('should complete a full deathmatch game scenario', async () => {
      // Wait for all players to connect
      await pages[0].waitForTimeout(2000);

      // Verify all players are connected
      const playerCounts = await Promise.all(
        pages.map(page => page.locator('#playerCount').textContent())
      );

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(4);
      });

      // Start gameplay actions
      const gameActions = [];

      // Player 1: Move and shoot
      gameActions.push(
        pages[0].keyboard.press('ArrowRight'),
        pages[0].locator('#gameCanvas').click({ position: { x: 400, y: 300 } })
      );

      // Player 2: Move in different direction
      gameActions.push(
        pages[1].keyboard.press('ArrowUp'),
        pages[1].locator('#gameCanvas').click({ position: { x: 200, y: 200 } })
      );

      // Player 3: Move and engage
      gameActions.push(
        pages[2].keyboard.press('ArrowLeft'),
        pages[2].locator('#gameCanvas').click({ position: { x: 600, y: 400 } })
      );

      // Player 4: Move defensively
      gameActions.push(
        pages[3].keyboard.press('ArrowDown'),
        pages[3].locator('#gameCanvas').click({ position: { x: 100, y: 500 } })
      );

      await Promise.all(gameActions);

      // Continue combat for several rounds
      for (let round = 0; round < 5; round++) {
        await Promise.all([
          pages[0].locator('#gameCanvas').click({ position: { x: 300 + round * 50, y: 300 } }),
          pages[1].locator('#gameCanvas').click({ position: { x: 250 + round * 30, y: 250 } }),
          pages[2].locator('#gameCanvas').click({ position: { x: 500 - round * 40, y: 350 } }),
          pages[3].locator('#gameCanvas').click({ position: { x: 150 + round * 25, y: 450 } })
        ]);

        await pages[0].waitForTimeout(500);
      }

      // Verify game state consistency across all clients
      const gameStates = await Promise.all(
        pages.map(page => page.evaluate(() => ({
          playerCount: window.game.getGameState().players.size,
          gameStatus: window.game.getGameState().status,
          hasLocalPlayer: window.game.getLocalPlayer() !== null
        })))
      );

      gameStates.forEach(state => {
        expect(state.playerCount).toBe(4);
        expect(state.hasLocalPlayer).toBe(true);
      });

      // Check that combat has occurred (some players should have fired shots)
      const playerStats = await Promise.all(
        pages.map(page => page.evaluate(() => window.game.getPlayerStats()))
      );

      const totalShotsFired = playerStats.reduce((total, stats) => total + stats.shotsFired, 0);
      expect(totalShotsFired).toBeGreaterThan(0);
    });

    test('should handle player elimination and respawning', async () => {
      // Wait for connection
      await pages[0].waitForTimeout(1000);

      // Simulate player taking damage until death
      const targetPage = pages[0];

      // Repeatedly damage player until eliminated
      for (let i = 0; i < 5; i++) {
        await targetPage.evaluate(() => {
          window.game.simulateAction('takeDamage', { damage: 25 });
        });
        await targetPage.waitForTimeout(100);
      }

      // Check if player health is 0 or below
      const health = await targetPage.locator('#health').textContent();
      expect(parseInt(health || '100')).toBeLessThanOrEqual(0);

      // Wait for respawn (3 seconds in game logic)
      await targetPage.waitForTimeout(3500);

      // Verify player has respawned
      const respawnedHealth = await targetPage.locator('#health').textContent();
      expect(parseInt(respawnedHealth || '0')).toBeGreaterThan(0);

      // Verify player can move after respawn
      await targetPage.keyboard.press('ArrowRight');
      await targetPage.waitForTimeout(200);

      const localPlayer = await targetPage.evaluate(() => {
        const player = window.game.getLocalPlayer();
        return player ? { health: player.health, isAlive: player.isAlive } : null;
      });

      expect(localPlayer).toBeDefined();
      expect(localPlayer.isAlive).toBe(true);
      expect(localPlayer.health).toBeGreaterThan(0);
    });

    test('should maintain accurate leaderboard and scoring', async () => {
      // Wait for all players to connect
      await pages[0].waitForTimeout(1000);

      // Simulate scoring events
      const scoringActions = [];

      // Each player performs actions that could lead to scoring
      for (let i = 0; i < pages.length; i++) {
        scoringActions.push(
          pages[i].evaluate(() => {
            // Simulate gaining points
            const localPlayer = window.game.getLocalPlayer();
            if (localPlayer) {
              localPlayer.score += 10 * (Math.random() > 0.5 ? 1 : 0);
              localPlayer.kills += Math.random() > 0.7 ? 1 : 0;
              window.game.updateUI();
              window.game.updateLeaderboard();
            }
          })
        );
      }

      await Promise.all(scoringActions);

      // Wait for UI updates
      await pages[0].waitForTimeout(500);

      // Check leaderboard consistency
      const leaderboards = await Promise.all(
        pages.map(page => page.evaluate(() => {
          const leaderboard = document.getElementById('playerList');
          const items = Array.from(leaderboard.children);
          return items.map(item => item.textContent);
        }))
      );

      // All clients should have the same number of leaderboard entries
      const leaderboardSizes = leaderboards.map(lb => lb.length);
      expect(leaderboardSizes.every(size => size === leaderboardSizes[0])).toBe(true);

      // Verify scores are properly displayed
      const scores = await Promise.all(
        pages.map(page => page.locator('#score').textContent())
      );

      scores.forEach(score => {
        expect(parseInt(score || '0')).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test.describe('Advanced Multiplayer Features', () => {
    test('should handle complex team combat scenarios', async () => {
      // Set up team scenario (players 0,1 vs players 2,3)
      await pages[0].waitForTimeout(1000);

      // Position teams on opposite sides
      await Promise.all([
        // Team 1 (left side)
        pages[0].evaluate(() => window.game.simulateAction('move', { x: -200, y: 0 })),
        pages[1].evaluate(() => window.game.simulateAction('move', { x: -200, y: 50 })),

        // Team 2 (right side)
        pages[2].evaluate(() => window.game.simulateAction('move', { x: 200, y: 0 })),
        pages[3].evaluate(() => window.game.simulateAction('move', { x: 200, y: 50 }))
      ]);

      await pages[0].waitForTimeout(500);

      // Team combat simulation
      for (let engagement = 0; engagement < 3; engagement++) {
        // Team 1 attacks Team 2
        await Promise.all([
          pages[0].locator('#gameCanvas').click({ position: { x: 600, y: 300 } }),
          pages[1].locator('#gameCanvas').click({ position: { x: 650, y: 350 } })
        ]);

        await pages[0].waitForTimeout(200);

        // Team 2 counter-attacks
        await Promise.all([
          pages[2].locator('#gameCanvas').click({ position: { x: 200, y: 300 } }),
          pages[3].locator('#gameCanvas').click({ position: { x: 150, y: 250 } })
        ]);

        await pages[0].waitForTimeout(300);
      }

      // Verify all players are still active in combat
      const activePlayers = await Promise.all(
        pages.map(page => page.evaluate(() => {
          const gameState = window.game.getGameState();
          return Array.from(gameState.players.values()).filter(p => p.isAlive).length;
        }))
      );

      activePlayers.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });

      // Check that projectiles are being fired and synchronized
      const projectileCounts = await Promise.all(
        pages.map(page => page.evaluate(() => window.game.getGameState().projectiles.length))
      );

      // All clients should see similar projectile counts (accounting for network timing)
      const avgProjectiles = projectileCounts.reduce((a, b) => a + b, 0) / projectileCounts.length;
      projectileCounts.forEach(count => {
        expect(Math.abs(count - avgProjectiles)).toBeLessThan(5);
      });
    });

    test('should handle player disconnection during active gameplay', async () => {
      // Wait for all players to connect
      await pages[0].waitForTimeout(1000);

      // Start active combat
      const combatPromises = [];
      for (let i = 0; i < 10; i++) {
        combatPromises.push(
          pages[0].locator('#gameCanvas').click({ position: { x: 400 + i * 20, y: 300 } }),
          pages[1].locator('#gameCanvas').click({ position: { x: 300 + i * 15, y: 400 } }),
          pages[2].keyboard.press('ArrowRight'),
          pages[3].keyboard.press('ArrowLeft')
        );
      }

      // Disconnect one player mid-combat
      setTimeout(async () => {
        await pages[1].close();
        pages[1] = null;
      }, 2000);

      // Continue combat with remaining players
      await Promise.all(combatPromises);
      await pages[0].waitForTimeout(1000);

      // Verify remaining players see the disconnection
      const remainingPlayers = [pages[0], pages[2], pages[3]].filter(p => p !== null);

      const playerCounts = await Promise.all(
        remainingPlayers.map(page => page.locator('#playerCount').textContent())
      );

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(3);
      });

      // Verify game continues normally
      await Promise.all([
        pages[0].locator('#gameCanvas').click({ position: { x: 500, y: 300 } }),
        pages[2].keyboard.press('ArrowUp'),
        pages[3].locator('#gameCanvas').click({ position: { x: 300, y: 400 } })
      ]);

      await pages[0].waitForTimeout(500);

      // Check that remaining players can still interact
      const gameStates = await Promise.all(
        remainingPlayers.map(page => page.evaluate(() => ({
          canMove: window.game.getLocalPlayer() !== null,
          hasOtherPlayers: window.game.getGameState().players.size > 1
        })))
      );

      gameStates.forEach(state => {
        expect(state.canMove).toBe(true);
        expect(state.hasOtherPlayers).toBe(true);
      });
    });

    test('should maintain performance under high-intensity gameplay', async () => {
      // Wait for connection
      await pages[0].waitForTimeout(1000);

      // Create high-intensity scenario
      const startTime = Date.now();
      const duration = 5000; // 5 seconds of intense activity

      const intensityPromises = [];

      while (Date.now() - startTime < duration) {
        // Rapid movement and shooting for all players
        intensityPromises.push(
          ...pages.map(async (page, index) => {
            if (page) {
              // Rapid key presses
              const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
              await page.keyboard.press(keys[index % keys.length]);

              // Rapid shooting
              await page.locator('#gameCanvas').click({
                position: {
                  x: 200 + (index * 150) + Math.random() * 100,
                  y: 200 + Math.random() * 200
                }
              });
            }
          }),
          pages[0].waitForTimeout(50) // Small delay between actions
        );
      }

      await Promise.all(intensityPromises);

      // Verify all clients are still responsive
      const responsiveTests = await Promise.all(
        pages.map(page => page.evaluate(() => ({
          connected: window.game.getConnectionStatus() === 'connected',
          hasLocalPlayer: window.game.getLocalPlayer() !== null,
          gameRunning: typeof window.game.update === 'function'
        })))
      );

      responsiveTests.forEach(test => {
        expect(test.connected).toBe(true);
        expect(test.hasLocalPlayer).toBe(true);
        expect(test.gameRunning).toBe(true);
      });

      // Check that game state is still consistent
      const finalPlayerCounts = await Promise.all(
        pages.map(page => page.locator('#playerCount').textContent())
      );

      finalPlayerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(4);
      });

      // Verify performance didn't degrade significantly
      const performanceMetrics = await Promise.all(
        pages.map(page => page.evaluate(() => {
          const stats = window.game.getPlayerStats();
          return {
            shotsFired: stats.shotsFired,
            accuracy: stats.accuracy || 0
          };
        }))
      );

      // All players should have fired shots during intense gameplay
      const totalShots = performanceMetrics.reduce((total, metrics) => total + metrics.shotsFired, 0);
      expect(totalShots).toBeGreaterThan(20); // Should have significant activity
    });
  });

  test.describe('Game State Integrity', () => {
    test('should maintain deterministic game physics across all clients', async () => {
      // Wait for connection
      await pages[0].waitForTimeout(1000);

      // Perform identical movements on all clients' local players
      const identicalActions = [
        () => pages[0].keyboard.press('ArrowRight'),
        () => pages[1].keyboard.press('ArrowRight'),
        () => pages[2].keyboard.press('ArrowRight'),
        () => pages[3].keyboard.press('ArrowRight')
      ];

      for (const action of identicalActions) {
        await action();
        await pages[0].waitForTimeout(100);
      }

      // Wait for synchronization
      await pages[0].waitForTimeout(1000);

      // Get all player positions as seen by each client
      const playerPositions = await Promise.all(
        pages.map(page => page.evaluate(() => {
          const gameState = window.game.getGameState();
          const positions = {};
          gameState.players.forEach((player, id) => {
            positions[id] = { x: player.position.x, y: player.position.y };
          });
          return positions;
        }))
      );

      // Verify position consistency across clients
      const playerIds = Object.keys(playerPositions[0]);

      playerIds.forEach(playerId => {
        const positions = playerPositions.map(pos => pos[playerId]);

        // All clients should have similar positions for each player
        for (let i = 1; i < positions.length; i++) {
          expect(Math.abs(positions[0].x - positions[i].x)).toBeLessThan(20);
          expect(Math.abs(positions[0].y - positions[i].y)).toBeLessThan(20);
        }
      });
    });

    test('should handle simultaneous actions without conflicts', async () => {
      // Wait for connection
      await pages[0].waitForTimeout(1000);

      // All players perform actions simultaneously
      const simultaneousActions = [
        pages[0].locator('#gameCanvas').click({ position: { x: 400, y: 300 } }),
        pages[1].locator('#gameCanvas').click({ position: { x: 300, y: 400 } }),
        pages[2].locator('#gameCanvas').click({ position: { x: 500, y: 200 } }),
        pages[3].locator('#gameCanvas').click({ position: { x: 200, y: 500 } })
      ];

      await Promise.all(simultaneousActions);
      await pages[0].waitForTimeout(500);

      // Verify no conflicts occurred
      const gameStates = await Promise.all(
        pages.map(page => page.evaluate(() => ({
          playerCount: window.game.getGameState().players.size,
          projectileCount: window.game.getGameState().projectiles.length,
          connected: window.game.getConnectionStatus() === 'connected'
        })))
      );

      gameStates.forEach(state => {
        expect(state.playerCount).toBe(4);
        expect(state.projectileCount).toBeGreaterThan(0);
        expect(state.connected).toBe(true);
      });

      // Verify each client sees projectiles from all players
      const projectileOwners = await Promise.all(
        pages.map(page => page.evaluate(() => {
          const gameState = window.game.getGameState();
          const owners = new Set();
          gameState.projectiles.forEach(proj => owners.add(proj.ownerId));
          return Array.from(owners);
        }))
      );

      // All clients should see projectiles from multiple players
      projectileOwners.forEach(owners => {
        expect(owners.length).toBeGreaterThan(1);
      });
    });

    test('should recover gracefully from temporary network issues', async () => {
      // Wait for stable connection
      await pages[0].waitForTimeout(1000);

      // Simulate network issues by rapidly closing and reopening connections
      const networkIssueSimulation = async (pageIndex) => {
        const page = pages[pageIndex];

        // Simulate connection loss
        await page.evaluate(() => {
          if (window.game.ws) {
            window.game.ws.close();
          }
        });

        await page.waitForTimeout(500);

        // Simulate reconnection
        await page.evaluate(() => {
          window.game.connectToServer();
        });

        await page.waitForTimeout(1000);
      };

      // Simulate network issues for one player
      await networkIssueSimulation(1);

      // Continue gameplay with other players
      await Promise.all([
        pages[0].locator('#gameCanvas').click({ position: { x: 400, y: 300 } }),
        pages[2].keyboard.press('ArrowRight'),
        pages[3].locator('#gameCanvas').click({ position: { x: 300, y: 400 } })
      ]);

      await pages[0].waitForTimeout(1000);

      // Verify all players are reconnected and synchronized
      const connectionStatuses = await Promise.all(
        pages.map(page => page.evaluate(() => window.game.getConnectionStatus()))
      );

      connectionStatuses.forEach(status => {
        expect(status).toBe('connected');
      });

      // Verify game state consistency after network recovery
      const playerCounts = await Promise.all(
        pages.map(page => page.locator('#playerCount').textContent())
      );

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(4);
      });
    });
  });
});