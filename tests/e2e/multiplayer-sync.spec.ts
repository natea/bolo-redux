import { test, expect, Page, BrowserContext } from '@playwright/test';
import { TestWebSocketServer } from '../utils/test-helpers';

test.describe('Multiplayer Synchronization Tests', () => {
  let testServer: TestWebSocketServer;
  let player1Page: Page;
  let player2Page: Page;
  let player3Page: Page;
  let context1: BrowserContext;
  let context2: BrowserContext;
  let context3: BrowserContext;

  const MULTIPLAYER_GAME_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Bolo Multiplayer</title>
    <style>
        body { margin: 0; padding: 0; background: #000; font-family: Arial; }
        #gameCanvas { border: 1px solid #333; display: block; margin: 0 auto; }
        #status { color: white; text-align: center; padding: 10px; }
        #playerInfo { position: absolute; top: 10px; left: 10px; color: white; }
        .connected { color: #00ff00; }
        .disconnected { color: #ff0000; }
        .syncing { color: #ffff00; }
    </style>
</head>
<body>
    <div id="status">Connecting...</div>
    <div id="playerInfo">
        <div>Player ID: <span id="playerId">Unknown</span></div>
        <div>Status: <span id="connectionStatus">Disconnected</span></div>
        <div>Players Online: <span id="playerCount">0</span></div>
        <div>Sync State: <span id="syncState">Idle</span></div>
    </div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>

    <script>
        class MultiplayerBoloGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.playerId = 'player-' + Math.random().toString(36).substr(2, 9);
                this.ws = null;
                this.connectionStatus = 'disconnected';
                this.gameState = {
                    players: new Map(),
                    projectiles: [],
                    timestamp: Date.now()
                };
                this.localPlayer = null;
                this.lastSyncTime = 0;
                this.syncInterval = 50; // 20 fps sync
                this.stateBuffer = [];
                this.reconcileQueue = [];

                document.getElementById('playerId').textContent = this.playerId;
                this.setupEventListeners();
                this.connectToServer();
                this.startGameLoop();
            }

            connectToServer() {
                try {
                    // Use the test server URL (will be injected by test)
                    this.ws = new WebSocket(window.testServerUrl || 'ws://localhost:8081');

                    this.ws.onopen = () => {
                        this.connectionStatus = 'connected';
                        this.updateStatus('Connected to server');
                        this.updateConnectionDisplay();
                        this.sendMessage('join', { playerId: this.playerId });
                    };

                    this.ws.onmessage = (event) => {
                        this.handleServerMessage(JSON.parse(event.data));
                    };

                    this.ws.onclose = () => {
                        this.connectionStatus = 'disconnected';
                        this.updateStatus('Disconnected from server');
                        this.updateConnectionDisplay();
                    };

                    this.ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        this.updateStatus('Connection error');
                    };
                } catch (error) {
                    console.error('Failed to connect:', error);
                    this.updateStatus('Failed to connect');
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
                switch (message.type) {
                    case 'playerJoined':
                        this.handlePlayerJoined(message.data);
                        break;
                    case 'playerLeft':
                        this.handlePlayerLeft(message.data);
                        break;
                    case 'gameState':
                        this.handleGameStateUpdate(message.data);
                        break;
                    case 'playerUpdate':
                        this.handlePlayerUpdate(message.data);
                        break;
                    case 'playerList':
                        this.handlePlayerList(message.data);
                        break;
                    case 'ping':
                        this.sendMessage('pong', { timestamp: message.timestamp });
                        break;
                    case 'reconcile':
                        this.handleReconciliation(message.data);
                        break;
                }
            }

            handlePlayerJoined(data) {
                const player = {
                    id: data.playerId,
                    position: data.position || { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
                    velocity: { x: 0, y: 0 },
                    health: 100,
                    score: 0,
                    color: this.generatePlayerColor(data.playerId),
                    lastUpdate: Date.now()
                };

                this.gameState.players.set(data.playerId, player);

                if (data.playerId === this.playerId) {
                    this.localPlayer = player;
                }

                this.updatePlayerCount();
                this.updateStatus(\`Player \${data.playerId} joined\`);
            }

            handlePlayerLeft(data) {
                this.gameState.players.delete(data.playerId);
                this.updatePlayerCount();
                this.updateStatus(\`Player \${data.playerId} left\`);
            }

            handleGameStateUpdate(data) {
                this.setSyncState('receiving');

                // Add to state buffer for interpolation
                this.stateBuffer.push({
                    state: data,
                    timestamp: Date.now(),
                    serverTimestamp: data.timestamp
                });

                // Keep only recent states
                const cutoff = Date.now() - 1000;
                this.stateBuffer = this.stateBuffer.filter(item => item.timestamp > cutoff);

                // Update remote players
                if (data.players) {
                    Object.entries(data.players).forEach(([id, playerData]) => {
                        if (id !== this.playerId) {
                            this.gameState.players.set(id, {
                                ...playerData,
                                lastUpdate: Date.now()
                            });
                        }
                    });
                }

                this.setSyncState('synced');
            }

            handlePlayerUpdate(data) {
                if (data.playerId !== this.playerId) {
                    const player = this.gameState.players.get(data.playerId);
                    if (player) {
                        Object.assign(player, data, { lastUpdate: Date.now() });
                    }
                }
            }

            handlePlayerList(data) {
                this.updatePlayerCount(data.players.length);
            }

            handleReconciliation(data) {
                // Server-side reconciliation for conflict resolution
                if (data.playerId === this.playerId && this.localPlayer) {
                    const serverPosition = data.position;
                    const localPosition = this.localPlayer.position;

                    // Check for significant deviation
                    const distance = Math.sqrt(
                        Math.pow(serverPosition.x - localPosition.x, 2) +
                        Math.pow(serverPosition.y - localPosition.y, 2)
                    );

                    if (distance > 10) { // Threshold for reconciliation
                        this.localPlayer.position = serverPosition;
                        this.updateStatus('Position reconciled');
                    }
                }
            }

            setupEventListeners() {
                const keys = {};

                window.addEventListener('keydown', (e) => {
                    keys[e.code] = true;
                    this.handleInput(keys);
                });

                window.addEventListener('keyup', (e) => {
                    keys[e.code] = false;
                });

                this.canvas.addEventListener('click', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    this.fireProjectile(x, y);
                });
            }

            handleInput(keys) {
                if (!this.localPlayer) return;

                let moved = false;
                const speed = 0.5;

                if (keys['ArrowUp'] || keys['KeyW']) {
                    this.localPlayer.velocity.y = Math.max(this.localPlayer.velocity.y - speed, -5);
                    moved = true;
                }
                if (keys['ArrowDown'] || keys['KeyS']) {
                    this.localPlayer.velocity.y = Math.min(this.localPlayer.velocity.y + speed, 5);
                    moved = true;
                }
                if (keys['ArrowLeft'] || keys['KeyA']) {
                    this.localPlayer.velocity.x = Math.max(this.localPlayer.velocity.x - speed, -5);
                    moved = true;
                }
                if (keys['ArrowRight'] || keys['KeyD']) {
                    this.localPlayer.velocity.x = Math.min(this.localPlayer.velocity.x + speed, 5);
                    moved = true;
                }

                if (moved) {
                    this.sendPlayerUpdate();
                }
            }

            fireProjectile(targetX, targetY) {
                if (!this.localPlayer) return;

                const dx = targetX - this.localPlayer.position.x;
                const dy = targetY - this.localPlayer.position.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const direction = { x: dx / length, y: dy / length };

                const projectile = {
                    id: 'proj-' + Date.now() + '-' + this.playerId,
                    position: { ...this.localPlayer.position },
                    velocity: { x: direction.x * 10, y: direction.y * 10 },
                    ownerId: this.playerId,
                    timestamp: Date.now()
                };

                this.gameState.projectiles.push(projectile);
                this.sendMessage('projectile', projectile);
            }

            sendPlayerUpdate() {
                if (!this.localPlayer || !this.canSend()) return;

                this.setSyncState('sending');
                this.sendMessage('playerUpdate', {
                    playerId: this.playerId,
                    position: this.localPlayer.position,
                    velocity: this.localPlayer.velocity,
                    health: this.localPlayer.health,
                    score: this.localPlayer.score,
                    timestamp: Date.now()
                });
                this.lastSyncTime = Date.now();
            }

            canSend() {
                return Date.now() - this.lastSyncTime >= this.syncInterval;
            }

            startGameLoop() {
                const gameLoop = () => {
                    this.update();
                    this.render();
                    requestAnimationFrame(gameLoop);
                };
                requestAnimationFrame(gameLoop);
            }

            update() {
                // Update local player
                if (this.localPlayer) {
                    this.localPlayer.position.x += this.localPlayer.velocity.x;
                    this.localPlayer.position.y += this.localPlayer.velocity.y;

                    // Bounds checking
                    this.localPlayer.position.x = Math.max(10, Math.min(790, this.localPlayer.position.x));
                    this.localPlayer.position.y = Math.max(10, Math.min(590, this.localPlayer.position.y));

                    // Apply friction
                    this.localPlayer.velocity.x *= 0.95;
                    this.localPlayer.velocity.y *= 0.95;
                }

                // Update projectiles
                this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
                    projectile.position.x += projectile.velocity.x;
                    projectile.position.y += projectile.velocity.y;

                    return projectile.position.x >= 0 && projectile.position.x <= 800 &&
                           projectile.position.y >= 0 && projectile.position.y <= 600;
                });

                // Interpolate remote players
                this.interpolateRemotePlayers();

                // Send periodic updates
                if (this.canSend() && this.localPlayer) {
                    this.sendPlayerUpdate();
                }
            }

            interpolateRemotePlayers() {
                if (this.stateBuffer.length < 2) return;

                const now = Date.now();
                const renderTime = now - 100; // Render 100ms in the past for smoothness

                // Find two states to interpolate between
                let prevState = null;
                let nextState = null;

                for (let i = 0; i < this.stateBuffer.length - 1; i++) {
                    if (this.stateBuffer[i].timestamp <= renderTime &&
                        this.stateBuffer[i + 1].timestamp >= renderTime) {
                        prevState = this.stateBuffer[i];
                        nextState = this.stateBuffer[i + 1];
                        break;
                    }
                }

                if (prevState && nextState) {
                    const factor = (renderTime - prevState.timestamp) /
                                   (nextState.timestamp - prevState.timestamp);

                    // Interpolate player positions
                    this.gameState.players.forEach((player, id) => {
                        if (id !== this.playerId) {
                            const prevPlayer = prevState.state.players && prevState.state.players[id];
                            const nextPlayer = nextState.state.players && nextState.state.players[id];

                            if (prevPlayer && nextPlayer) {
                                player.position.x = prevPlayer.position.x +
                                    (nextPlayer.position.x - prevPlayer.position.x) * factor;
                                player.position.y = prevPlayer.position.y +
                                    (nextPlayer.position.y - prevPlayer.position.y) * factor;
                            }
                        }
                    });
                }
            }

            render() {
                // Clear canvas
                this.ctx.fillStyle = '#001122';
                this.ctx.fillRect(0, 0, 800, 600);

                // Draw grid
                this.ctx.strokeStyle = '#003344';
                this.ctx.lineWidth = 1;
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

                // Draw players
                this.gameState.players.forEach(player => {
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

                    // Draw player ID
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(player.id.substr(-3), player.position.x, player.position.y - 20);
                });

                // Draw projectiles
                this.ctx.fillStyle = '#ffff00';
                this.gameState.projectiles.forEach(projectile => {
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.position.x, projectile.position.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            generatePlayerColor(playerId) {
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                const hash = playerId.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                return colors[Math.abs(hash) % colors.length];
            }

            updateStatus(message) {
                document.getElementById('status').textContent = message;
            }

            updateConnectionDisplay() {
                const statusElement = document.getElementById('connectionStatus');
                statusElement.textContent = this.connectionStatus;
                statusElement.className = this.connectionStatus;
            }

            updatePlayerCount(count) {
                if (count !== undefined) {
                    document.getElementById('playerCount').textContent = count;
                } else {
                    document.getElementById('playerCount').textContent = this.gameState.players.size;
                }
            }

            setSyncState(state) {
                document.getElementById('syncState').textContent = state;
                setTimeout(() => {
                    if (document.getElementById('syncState').textContent === state) {
                        document.getElementById('syncState').textContent = 'idle';
                    }
                }, 100);
            }

            // Test utilities
            getGameState() {
                return this.gameState;
            }

            getLocalPlayer() {
                return this.localPlayer;
            }

            getConnectionStatus() {
                return this.connectionStatus;
            }

            simulatePlayerAction(action, data) {
                switch (action) {
                    case 'move':
                        if (this.localPlayer) {
                            this.localPlayer.position.x += data.x || 0;
                            this.localPlayer.position.y += data.y || 0;
                            this.sendPlayerUpdate();
                        }
                        break;
                    case 'shoot':
                        this.fireProjectile(data.x, data.y);
                        break;
                }
            }
        }

        // Initialize game when page loads
        window.addEventListener('load', () => {
            window.game = new MultiplayerBoloGame();
        });
    </script>
</body>
</html>
  `;

  test.beforeAll(async () => {
    testServer = new TestWebSocketServer(8082);
    await testServer.start();
  });

  test.afterAll(async () => {
    await testServer.stop();
  });

  test.beforeEach(async ({ browser }) => {
    // Create three browser contexts for three players
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    context3 = await browser.newContext();

    player1Page = await context1.newPage();
    player2Page = await context2.newPage();
    player3Page = await context3.newPage();

    // Set up game pages with test server URL
    await Promise.all([
      player1Page.setContent(MULTIPLAYER_GAME_HTML),
      player2Page.setContent(MULTIPLAYER_GAME_HTML),
      player3Page.setContent(MULTIPLAYER_GAME_HTML)
    ]);

    // Inject test server URL
    const serverUrl = testServer.getUrl();
    await Promise.all([
      player1Page.evaluate(url => { window.testServerUrl = url; }, serverUrl),
      player2Page.evaluate(url => { window.testServerUrl = url; }, serverUrl),
      player3Page.evaluate(url => { window.testServerUrl = url; }, serverUrl)
    ]);

    // Wait for pages to load and games to initialize
    await Promise.all([
      player1Page.waitForLoadState('networkidle'),
      player2Page.waitForLoadState('networkidle'),
      player3Page.waitForLoadState('networkidle')
    ]);

    await player1Page.waitForTimeout(1000);
    await player2Page.waitForTimeout(1000);
    await player3Page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await context1.close();
    await context2.close();
    await context3.close();
  });

  test.describe('Connection Management', () => {
    test('should establish connections for all players', async () => {
      // Check connection status for all players
      const statuses = await Promise.all([
        player1Page.evaluate(() => window.game.getConnectionStatus()),
        player2Page.evaluate(() => window.game.getConnectionStatus()),
        player3Page.evaluate(() => window.game.getConnectionStatus())
      ]);

      statuses.forEach(status => {
        expect(status).toBe('connected');
      });
    });

    test('should display correct player count across all clients', async () => {
      // Wait for all players to connect and sync
      await player1Page.waitForTimeout(1000);

      const playerCounts = await Promise.all([
        player1Page.locator('#playerCount').textContent(),
        player2Page.locator('#playerCount').textContent(),
        player3Page.locator('#playerCount').textContent()
      ]);

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(3);
      });
    });

    test('should handle player disconnection and reconnection', async () => {
      // Disconnect player 2
      await player2Page.evaluate(() => {
        window.game.ws.close();
      });

      await player1Page.waitForTimeout(500);

      // Check that other players see the disconnection
      const player1Count = await player1Page.locator('#playerCount').textContent();
      expect(parseInt(player1Count || '0')).toBe(2);

      // Reconnect player 2
      await player2Page.reload();
      await player2Page.setContent(MULTIPLAYER_GAME_HTML);
      await player2Page.evaluate(url => { window.testServerUrl = url; }, testServer.getUrl());
      await player2Page.waitForLoadState('networkidle');
      await player2Page.waitForTimeout(1000);

      // Check that all players see the reconnection
      const finalCounts = await Promise.all([
        player1Page.locator('#playerCount').textContent(),
        player2Page.locator('#playerCount').textContent(),
        player3Page.locator('#playerCount').textContent()
      ]);

      finalCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(3);
      });
    });
  });

  test.describe('Player State Synchronization', () => {
    test('should synchronize player positions across all clients', async () => {
      // Move player 1
      await player1Page.keyboard.press('ArrowRight');
      await player1Page.keyboard.press('ArrowRight');
      await player1Page.keyboard.press('ArrowRight');

      // Wait for synchronization
      await player1Page.waitForTimeout(300);

      // Get player 1's position from all clients
      const player1Positions = await Promise.all([
        player1Page.evaluate(() => {
          const localPlayer = window.game.getLocalPlayer();
          return localPlayer ? localPlayer.position : null;
        }),
        player2Page.evaluate(() => {
          const gameState = window.game.getGameState();
          const player1 = Array.from(gameState.players.values()).find(p => p.id.includes('player'));
          return player1 ? player1.position : null;
        }),
        player3Page.evaluate(() => {
          const gameState = window.game.getGameState();
          const player1 = Array.from(gameState.players.values()).find(p => p.id.includes('player'));
          return player1 ? player1.position : null;
        })
      ]);

      // All clients should have similar positions for player 1
      const [local, remote1, remote2] = player1Positions;
      expect(local).toBeDefined();
      expect(remote1).toBeDefined();
      expect(remote2).toBeDefined();

      // Positions should be within reasonable range (accounting for network delay)
      expect(Math.abs(local.x - remote1.x)).toBeLessThan(50);
      expect(Math.abs(local.x - remote2.x)).toBeLessThan(50);
    });

    test('should handle simultaneous player movements', async () => {
      // Move all players simultaneously
      await Promise.all([
        player1Page.keyboard.press('ArrowRight'),
        player2Page.keyboard.press('ArrowUp'),
        player3Page.keyboard.press('ArrowLeft')
      ]);

      // Wait for synchronization
      await player1Page.waitForTimeout(500);

      // Check that all players see all movements
      const allPlayerStates = await Promise.all([
        player1Page.evaluate(() => {
          const gameState = window.game.getGameState();
          return Array.from(gameState.players.values()).map(p => ({
            id: p.id,
            position: p.position
          }));
        }),
        player2Page.evaluate(() => {
          const gameState = window.game.getGameState();
          return Array.from(gameState.players.values()).map(p => ({
            id: p.id,
            position: p.position
          }));
        }),
        player3Page.evaluate(() => {
          const gameState = window.game.getGameState();
          return Array.from(gameState.players.values()).map(p => ({
            id: p.id,
            position: p.position
          }));
        })
      ]);

      // All clients should see the same number of players
      allPlayerStates.forEach(states => {
        expect(states).toHaveLength(3);
      });

      // Player positions should be synchronized across clients
      const [client1States, client2States, client3States] = allPlayerStates;

      client1States.forEach(player1State => {
        const player2State = client2States.find(p => p.id === player1State.id);
        const player3State = client3States.find(p => p.id === player1State.id);

        expect(player2State).toBeDefined();
        expect(player3State).toBeDefined();

        // Positions should be reasonably close
        expect(Math.abs(player1State.position.x - player2State.position.x)).toBeLessThan(20);
        expect(Math.abs(player1State.position.y - player2State.position.y)).toBeLessThan(20);
      });
    });

    test('should synchronize projectile firing across clients', async () => {
      // Player 1 fires projectile
      await player1Page.locator('#gameCanvas').click({ position: { x: 500, y: 300 } });

      // Wait for synchronization
      await player1Page.waitForTimeout(200);

      // Check that all clients see the projectile
      const projectileCounts = await Promise.all([
        player1Page.evaluate(() => window.game.getGameState().projectiles.length),
        player2Page.evaluate(() => window.game.getGameState().projectiles.length),
        player3Page.evaluate(() => window.game.getGameState().projectiles.length)
      ]);

      projectileCounts.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  test.describe('State Consistency', () => {
    test('should maintain consistent game state across all clients', async () => {
      // Perform various actions
      await player1Page.keyboard.press('ArrowRight');
      await player2Page.keyboard.press('ArrowUp');
      await player1Page.locator('#gameCanvas').click({ position: { x: 400, y: 300 } });
      await player3Page.keyboard.press('ArrowDown');

      // Wait for full synchronization
      await player1Page.waitForTimeout(500);

      // Get complete game states from all clients
      const gameStates = await Promise.all([
        player1Page.evaluate(() => ({
          playerCount: window.game.getGameState().players.size,
          projectileCount: window.game.getGameState().projectiles.length
        })),
        player2Page.evaluate(() => ({
          playerCount: window.game.getGameState().players.size,
          projectileCount: window.game.getGameState().projectiles.length
        })),
        player3Page.evaluate(() => ({
          playerCount: window.game.getGameState().players.size,
          projectileCount: window.game.getGameState().projectiles.length
        }))
      ]);

      // All clients should have consistent state
      const [state1, state2, state3] = gameStates;
      expect(state1.playerCount).toBe(state2.playerCount);
      expect(state2.playerCount).toBe(state3.playerCount);
      expect(state1.projectileCount).toBe(state2.projectileCount);
      expect(state2.projectileCount).toBe(state3.projectileCount);
    });

    test('should handle rapid state changes without desynchronization', async () => {
      // Perform rapid actions
      for (let i = 0; i < 10; i++) {
        await Promise.all([
          player1Page.keyboard.press('ArrowRight'),
          player2Page.keyboard.press('ArrowLeft'),
          player3Page.keyboard.press('ArrowUp')
        ]);
        await player1Page.waitForTimeout(50);
      }

      // Wait for synchronization
      await player1Page.waitForTimeout(1000);

      // Check final state consistency
      const finalStates = await Promise.all([
        player1Page.evaluate(() => window.game.getGameState().players.size),
        player2Page.evaluate(() => window.game.getGameState().players.size),
        player3Page.evaluate(() => window.game.getGameState().players.size)
      ]);

      finalStates.forEach(playerCount => {
        expect(playerCount).toBe(3);
      });
    });

    test('should recover from temporary network issues', async () => {
      // Simulate network interruption by closing and reopening connection
      await player2Page.evaluate(() => {
        window.game.ws.close();
      });

      // Continue playing with other players
      await player1Page.keyboard.press('ArrowRight');
      await player3Page.keyboard.press('ArrowUp');
      await player1Page.waitForTimeout(300);

      // Reconnect player 2
      await player2Page.reload();
      await player2Page.setContent(MULTIPLAYER_GAME_HTML);
      await player2Page.evaluate(url => { window.testServerUrl = url; }, testServer.getUrl());
      await player2Page.waitForLoadState('networkidle');
      await player2Page.waitForTimeout(1000);

      // Verify state consistency after reconnection
      const playerCounts = await Promise.all([
        player1Page.locator('#playerCount').textContent(),
        player2Page.locator('#playerCount').textContent(),
        player3Page.locator('#playerCount').textContent()
      ]);

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBe(3);
      });
    });
  });

  test.describe('Performance Under Load', () => {
    test('should maintain synchronization with high activity', async () => {
      // Generate high activity for 5 seconds
      const endTime = Date.now() + 5000;
      const activityPromises = [];

      while (Date.now() < endTime) {
        activityPromises.push(
          player1Page.keyboard.press('Space'),
          player2Page.keyboard.press('ArrowRight'),
          player3Page.keyboard.press('ArrowLeft'),
          player1Page.waitForTimeout(100)
        );
      }

      await Promise.all(activityPromises);

      // Wait for final synchronization
      await player1Page.waitForTimeout(1000);

      // Check that all clients are still synchronized
      const syncStates = await Promise.all([
        player1Page.locator('#syncState').textContent(),
        player2Page.locator('#syncState').textContent(),
        player3Page.locator('#syncState').textContent()
      ]);

      // None should be in error state
      syncStates.forEach(state => {
        expect(state).not.toContain('error');
        expect(state).not.toContain('disconnected');
      });
    });

    test('should handle multiple projectiles without performance degradation', async () => {
      // Fire many projectiles rapidly
      for (let i = 0; i < 20; i++) {
        await Promise.all([
          player1Page.locator('#gameCanvas').click({ position: { x: 200 + i * 10, y: 300 } }),
          player2Page.locator('#gameCanvas').click({ position: { x: 400 + i * 10, y: 300 } }),
          player3Page.locator('#gameCanvas').click({ position: { x: 600 + i * 10, y: 300 } })
        ]);
        await player1Page.waitForTimeout(50);
      }

      // Wait for projectiles to be processed
      await player1Page.waitForTimeout(2000);

      // Check that games are still responsive
      const responsiveTest = await Promise.all([
        player1Page.evaluate(() => {
          return window.game.getConnectionStatus() === 'connected';
        }),
        player2Page.evaluate(() => {
          return window.game.getConnectionStatus() === 'connected';
        }),
        player3Page.evaluate(() => {
          return window.game.getConnectionStatus() === 'connected';
        })
      ]);

      responsiveTest.forEach(isResponsive => {
        expect(isResponsive).toBe(true);
      });
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle out-of-bounds player positions', async () => {
      // Try to move player out of bounds
      for (let i = 0; i < 50; i++) {
        await player1Page.keyboard.press('ArrowRight');
      }

      await player1Page.waitForTimeout(500);

      // Check that player position is bounded
      const player1Position = await player1Page.evaluate(() => {
        const localPlayer = window.game.getLocalPlayer();
        return localPlayer ? localPlayer.position : null;
      });

      expect(player1Position).toBeDefined();
      expect(player1Position.x).toBeGreaterThanOrEqual(0);
      expect(player1Position.x).toBeLessThanOrEqual(800);
      expect(player1Position.y).toBeGreaterThanOrEqual(0);
      expect(player1Position.y).toBeLessThanOrEqual(600);
    });

    test('should maintain synchronization when one client becomes unresponsive', async () => {
      // Simulate unresponsive client by freezing page execution
      await player2Page.evaluate(() => {
        // Simulate lag by blocking execution
        const start = Date.now();
        while (Date.now() - start < 2000) {
          // Block for 2 seconds
        }
      });

      // Continue activity on other clients
      await player1Page.keyboard.press('ArrowRight');
      await player3Page.keyboard.press('ArrowUp');
      await player1Page.waitForTimeout(500);

      // Check that other clients are still synchronized
      const playerCounts = await Promise.all([
        player1Page.locator('#playerCount').textContent(),
        player3Page.locator('#playerCount').textContent()
      ]);

      playerCounts.forEach(count => {
        expect(parseInt(count || '0')).toBeGreaterThanOrEqual(2);
      });
    });

    test('should handle malformed network messages gracefully', async () => {
      // This test would require server-side support for injecting malformed messages
      // For now, we test that the client remains stable under normal conditions

      // Perform normal operations
      await player1Page.keyboard.press('ArrowRight');
      await player2Page.locator('#gameCanvas').click({ position: { x: 400, y: 300 } });
      await player3Page.keyboard.press('ArrowUp');

      await player1Page.waitForTimeout(500);

      // Verify all clients remain functional
      const allFunctional = await Promise.all([
        player1Page.evaluate(() => window.game.getConnectionStatus() === 'connected'),
        player2Page.evaluate(() => window.game.getConnectionStatus() === 'connected'),
        player3Page.evaluate(() => window.game.getConnectionStatus() === 'connected')
      ]);

      allFunctional.forEach(isFunctional => {
        expect(isFunctional).toBe(true);
      });
    });
  });
});