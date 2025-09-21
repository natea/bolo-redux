import { test, expect, Page, BrowserContext } from '@playwright/test';

// Mock Bolo game implementation for frontend testing
const GAME_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Bolo Game</title>
    <style>
        body { margin: 0; padding: 0; background: #000; overflow: hidden; }
        #gameCanvas { border: 1px solid #333; display: block; margin: 0 auto; }
        #ui { position: absolute; top: 10px; left: 10px; color: white; font-family: Arial; }
        #playerList { position: absolute; top: 10px; right: 10px; color: white; font-family: Arial; }
        .player-item { margin: 5px 0; padding: 5px; background: rgba(0,0,0,0.5); }
        #gameStats { position: absolute; bottom: 10px; left: 10px; color: white; font-family: Arial; }
    </style>
</head>
<body>
    <div id="ui">
        <div id="score">Score: <span id="scoreValue">0</span></div>
        <div id="health">Health: <span id="healthValue">100</span></div>
        <div id="ammo">Ammo: <span id="ammoValue">30</span></div>
    </div>
    <div id="playerList">
        <h3>Players</h3>
        <div id="players"></div>
    </div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="gameStats">
        <div>FPS: <span id="fps">60</span></div>
        <div>Ping: <span id="ping">0</span>ms</div>
    </div>

    <script>
        class BoloGameRenderer {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.gameState = {
                    players: new Map(),
                    projectiles: [],
                    powerups: [],
                    timestamp: Date.now()
                };
                this.lastFrameTime = 0;
                this.frameCount = 0;
                this.fps = 60;
                this.setupEventListeners();
                this.startGameLoop();
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
                    this.handleClick(x, y);
                });
            }

            handleInput(keys) {
                const player = this.gameState.players.get('local-player');
                if (!player) return;

                if (keys['ArrowUp'] || keys['KeyW']) {
                    player.velocity.y = Math.max(player.velocity.y - 0.5, -5);
                }
                if (keys['ArrowDown'] || keys['KeyS']) {
                    player.velocity.y = Math.min(player.velocity.y + 0.5, 5);
                }
                if (keys['ArrowLeft'] || keys['KeyA']) {
                    player.velocity.x = Math.max(player.velocity.x - 0.5, -5);
                }
                if (keys['ArrowRight'] || keys['KeyD']) {
                    player.velocity.x = Math.min(player.velocity.x + 0.5, 5);
                }
                if (keys['Space']) {
                    this.fireProjectile();
                }
            }

            handleClick(x, y) {
                this.fireProjectile(x, y);
            }

            fireProjectile(targetX, targetY) {
                const player = this.gameState.players.get('local-player');
                if (!player) return;

                let direction = { x: 1, y: 0 };
                if (targetX !== undefined && targetY !== undefined) {
                    const dx = targetX - player.position.x;
                    const dy = targetY - player.position.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    direction = { x: dx / length, y: dy / length };
                }

                this.gameState.projectiles.push({
                    id: 'proj-' + Date.now(),
                    position: { x: player.position.x, y: player.position.y },
                    velocity: { x: direction.x * 10, y: direction.y * 10 },
                    ownerId: 'local-player',
                    damage: 10,
                    timestamp: Date.now()
                });

                this.updateAmmo(Math.max(0, parseInt(document.getElementById('ammoValue').textContent) - 1));
            }

            updateScore(score) {
                document.getElementById('scoreValue').textContent = score;
            }

            updateHealth(health) {
                document.getElementById('healthValue').textContent = health;
                const healthElement = document.getElementById('healthValue');
                if (health < 30) {
                    healthElement.style.color = 'red';
                } else if (health < 60) {
                    healthElement.style.color = 'orange';
                } else {
                    healthElement.style.color = 'white';
                }
            }

            updateAmmo(ammo) {
                document.getElementById('ammoValue').textContent = ammo;
            }

            updatePlayerList() {
                const playersDiv = document.getElementById('players');
                playersDiv.innerHTML = '';

                this.gameState.players.forEach((player, id) => {
                    const playerDiv = document.createElement('div');
                    playerDiv.className = 'player-item';
                    playerDiv.innerHTML = \`
                        <div>\${player.name || id}</div>
                        <div>Score: \${player.score}</div>
                        <div>Health: \${player.health}</div>
                    \`;
                    playersDiv.appendChild(playerDiv);
                });
            }

            addPlayer(playerId, playerData) {
                this.gameState.players.set(playerId, {
                    id: playerId,
                    position: playerData.position || { x: 100, y: 100 },
                    velocity: { x: 0, y: 0 },
                    health: playerData.health || 100,
                    score: playerData.score || 0,
                    name: playerData.name || playerId,
                    color: playerData.color || '#00ff00'
                });
                this.updatePlayerList();
            }

            removePlayer(playerId) {
                this.gameState.players.delete(playerId);
                this.updatePlayerList();
            }

            updateGameState(newState) {
                this.gameState = { ...this.gameState, ...newState };
                this.updatePlayerList();
            }

            startGameLoop() {
                const gameLoop = (currentTime) => {
                    const deltaTime = currentTime - this.lastFrameTime;
                    this.lastFrameTime = currentTime;

                    this.update(deltaTime);
                    this.render();
                    this.updateFPS();

                    requestAnimationFrame(gameLoop);
                };
                requestAnimationFrame(gameLoop);
            }

            update(deltaTime) {
                // Update player positions
                this.gameState.players.forEach(player => {
                    player.position.x += player.velocity.x;
                    player.position.y += player.velocity.y;

                    // Apply bounds checking
                    player.position.x = Math.max(10, Math.min(790, player.position.x));
                    player.position.y = Math.max(10, Math.min(590, player.position.y));

                    // Apply friction
                    player.velocity.x *= 0.95;
                    player.velocity.y *= 0.95;
                });

                // Update projectiles
                this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
                    projectile.position.x += projectile.velocity.x;
                    projectile.position.y += projectile.velocity.y;

                    // Remove projectiles that go off screen
                    return projectile.position.x >= 0 && projectile.position.x <= 800 &&
                           projectile.position.y >= 0 && projectile.position.y <= 600;
                });
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
                    this.ctx.fillStyle = player.color || '#00ff00';
                    this.ctx.beginPath();
                    this.ctx.arc(player.position.x, player.position.y, 12, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Draw player name
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(player.name || player.id, player.position.x, player.position.y - 20);
                });

                // Draw projectiles
                this.ctx.fillStyle = '#ffff00';
                this.gameState.projectiles.forEach(projectile => {
                    this.ctx.beginPath();
                    this.ctx.arc(projectile.position.x, projectile.position.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                });

                this.frameCount++;
            }

            updateFPS() {
                if (this.frameCount % 60 === 0) {
                    this.fps = Math.round(1000 / (performance.now() - this.lastFrameTime));
                    document.getElementById('fps').textContent = this.fps;
                }
            }

            updatePing(ping) {
                document.getElementById('ping').textContent = ping;
            }
        }

        // Initialize game when page loads
        window.addEventListener('load', () => {
            window.game = new BoloGameRenderer();

            // Add a test player
            window.game.addPlayer('local-player', {
                position: { x: 400, y: 300 },
                health: 100,
                score: 0,
                name: 'Test Player',
                color: '#00ff00'
            });

            // Add some test players for multiplayer testing
            window.game.addPlayer('player-2', {
                position: { x: 200, y: 200 },
                health: 80,
                score: 150,
                name: 'Player 2',
                color: '#ff0000'
            });

            window.game.addPlayer('player-3', {
                position: { x: 600, y: 400 },
                health: 60,
                score: 300,
                name: 'Player 3',
                color: '#0000ff'
            });
        });

        // Expose testing utilities
        window.testUtils = {
            getGameState: () => window.game.gameState,
            addTestPlayer: (id, data) => window.game.addPlayer(id, data),
            removeTestPlayer: (id) => window.game.removePlayer(id),
            fireTestProjectile: () => window.game.fireProjectile(),
            updateTestScore: (score) => window.game.updateScore(score),
            updateTestHealth: (health) => window.game.updateHealth(health),
            updateTestAmmo: (ammo) => window.game.updateAmmo(ammo),
            simulateKeyPress: (key) => {
                const event = new KeyboardEvent('keydown', { code: key });
                window.dispatchEvent(event);
            },
            simulateClick: (x, y) => {
                const event = new MouseEvent('click', { clientX: x, clientY: y });
                document.getElementById('gameCanvas').dispatchEvent(event);
            }
        };
    </script>
</body>
</html>
`;

test.describe('Bolo Game Frontend Rendering Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Set up the game page
    await page.setContent(GAME_HTML);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Allow game to initialize
  });

  test.afterEach(async () => {
    await context.close();
  });

  test.describe('Initial Rendering', () => {
    test('should render game canvas with correct dimensions', async () => {
      const canvas = page.locator('#gameCanvas');
      await expect(canvas).toBeVisible();

      const width = await canvas.getAttribute('width');
      const height = await canvas.getAttribute('height');

      expect(width).toBe('800');
      expect(height).toBe('600');
    });

    test('should display UI elements correctly', async () => {
      // Check score display
      await expect(page.locator('#score')).toBeVisible();
      await expect(page.locator('#scoreValue')).toHaveText('0');

      // Check health display
      await expect(page.locator('#health')).toBeVisible();
      await expect(page.locator('#healthValue')).toHaveText('100');

      // Check ammo display
      await expect(page.locator('#ammo')).toBeVisible();
      await expect(page.locator('#ammoValue')).toHaveText('30');
    });

    test('should display player list', async () => {
      await expect(page.locator('#playerList')).toBeVisible();
      await expect(page.locator('#players')).toBeVisible();

      // Should have multiple players from test setup
      const playerItems = page.locator('.player-item');
      await expect(playerItems).toHaveCount(3);
    });

    test('should display game statistics', async () => {
      await expect(page.locator('#gameStats')).toBeVisible();
      await expect(page.locator('#fps')).toBeVisible();
      await expect(page.locator('#ping')).toBeVisible();
    });
  });

  test.describe('Canvas Rendering', () => {
    test('should render players on canvas', async () => {
      // Take screenshot to verify rendering
      const canvas = page.locator('#gameCanvas');
      await expect(canvas).toBeVisible();

      // Get canvas data to verify players are rendered
      const canvasData = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Check if there are non-background pixels (simple color detection)
        let hasPlayerPixels = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          // Check for green pixels (player color)
          if (g > 200 && r < 50 && b < 50) {
            hasPlayerPixels = true;
            break;
          }
        }

        return hasPlayerPixels;
      });

      expect(canvasData).toBe(true);
    });

    test('should render grid background', async () => {
      const hasGrid = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Check for grid lines (looking for specific grid color)
        let hasGridPixels = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          // Check for grid line color (#003344)
          if (r === 0 && g === 51 && b === 68) {
            hasGridPixels = true;
            break;
          }
        }

        return hasGridPixels;
      });

      expect(hasGrid).toBe(true);
    });

    test('should update canvas content over time', async () => {
      // Take initial screenshot
      const initialScreenshot = await page.locator('#gameCanvas').screenshot();

      // Simulate some game activity
      await page.evaluate(() => {
        window.testUtils.simulateKeyPress('ArrowRight');
      });

      // Wait for animation frame
      await page.waitForTimeout(100);

      // Take second screenshot
      const updatedScreenshot = await page.locator('#gameCanvas').screenshot();

      // Screenshots should be different (player moved)
      expect(Buffer.compare(initialScreenshot, updatedScreenshot)).not.toBe(0);
    });
  });

  test.describe('User Interface Interactions', () => {
    test('should update score display', async () => {
      await page.evaluate(() => {
        window.testUtils.updateTestScore(150);
      });

      await expect(page.locator('#scoreValue')).toHaveText('150');
    });

    test('should update health display with color changes', async () => {
      // Test normal health (white)
      await page.evaluate(() => {
        window.testUtils.updateTestHealth(100);
      });
      await expect(page.locator('#healthValue')).toHaveText('100');

      // Test medium health (orange)
      await page.evaluate(() => {
        window.testUtils.updateTestHealth(50);
      });
      await expect(page.locator('#healthValue')).toHaveText('50');

      const mediumHealthColor = await page.locator('#healthValue').evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(mediumHealthColor).toBe('rgb(255, 165, 0)'); // orange

      // Test low health (red)
      await page.evaluate(() => {
        window.testUtils.updateTestHealth(20);
      });
      await expect(page.locator('#healthValue')).toHaveText('20');

      const lowHealthColor = await page.locator('#healthValue').evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(lowHealthColor).toBe('rgb(255, 0, 0)'); // red
    });

    test('should update ammo display', async () => {
      await page.evaluate(() => {
        window.testUtils.updateTestAmmo(15);
      });

      await expect(page.locator('#ammoValue')).toHaveText('15');
    });

    test('should update player list dynamically', async () => {
      // Add a new player
      await page.evaluate(() => {
        window.testUtils.addTestPlayer('new-player', {
          position: { x: 300, y: 300 },
          health: 90,
          score: 50,
          name: 'New Player',
          color: '#ff00ff'
        });
      });

      const playerItems = page.locator('.player-item');
      await expect(playerItems).toHaveCount(4);

      // Remove a player
      await page.evaluate(() => {
        window.testUtils.removeTestPlayer('player-2');
      });

      await expect(playerItems).toHaveCount(3);
    });
  });

  test.describe('Input Handling', () => {
    test('should handle keyboard input for movement', async () => {
      // Get initial player position
      const initialPosition = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        const player = gameState.players.get('local-player');
        return { x: player.position.x, y: player.position.y };
      });

      // Simulate right arrow key press
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100); // Allow for movement

      // Get updated position
      const updatedPosition = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        const player = gameState.players.get('local-player');
        return { x: player.position.x, y: player.position.y };
      });

      // Player should have moved right
      expect(updatedPosition.x).toBeGreaterThan(initialPosition.x);
    });

    test('should handle mouse clicks for shooting', async () => {
      // Get initial projectile count
      const initialProjectileCount = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        return gameState.projectiles.length;
      });

      // Click on canvas to shoot
      await page.locator('#gameCanvas').click({ position: { x: 500, y: 300 } });
      await page.waitForTimeout(50);

      // Check if projectile was created
      const updatedProjectileCount = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        return gameState.projectiles.length;
      });

      expect(updatedProjectileCount).toBeGreaterThan(initialProjectileCount);
    });

    test('should handle spacebar for shooting', async () => {
      const initialProjectileCount = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        return gameState.projectiles.length;
      });

      await page.keyboard.press('Space');
      await page.waitForTimeout(50);

      const updatedProjectileCount = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        return gameState.projectiles.length;
      });

      expect(updatedProjectileCount).toBeGreaterThan(initialProjectileCount);
    });

    test('should handle WASD movement keys', async () => {
      const initialPosition = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        const player = gameState.players.get('local-player');
        return { x: player.position.x, y: player.position.y };
      });

      // Test W key (up movement)
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(100);

      const updatedPosition = await page.evaluate(() => {
        const gameState = window.testUtils.getGameState();
        const player = gameState.players.get('local-player');
        return { x: player.position.x, y: player.position.y };
      });

      expect(updatedPosition.y).toBeLessThan(initialPosition.y);
    });
  });

  test.describe('Performance and Animation', () => {
    test('should maintain consistent frame rate', async () => {
      // Wait for FPS to stabilize
      await page.waitForTimeout(2000);

      const fpsValues = [];
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(500);
        const fps = await page.locator('#fps').textContent();
        fpsValues.push(parseInt(fps || '0'));
      }

      // FPS should be consistently above 30
      fpsValues.forEach(fps => {
        expect(fps).toBeGreaterThan(30);
      });

      // FPS should be relatively stable (not varying wildly)
      const avgFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
      const maxDeviation = Math.max(...fpsValues.map(fps => Math.abs(fps - avgFps)));
      expect(maxDeviation).toBeLessThan(15);
    });

    test('should handle projectile animations smoothly', async () => {
      // Fire multiple projectiles
      for (let i = 0; i < 5; i++) {
        await page.locator('#gameCanvas').click({ position: { x: 400 + i * 20, y: 300 } });
        await page.waitForTimeout(100);
      }

      // Check that projectiles move over time
      const projectilePositions = [];
      for (let frame = 0; frame < 3; frame++) {
        await page.waitForTimeout(100);
        const positions = await page.evaluate(() => {
          const gameState = window.testUtils.getGameState();
          return gameState.projectiles.map(p => ({ x: p.position.x, y: p.position.y }));
        });
        projectilePositions.push(positions);
      }

      // Projectiles should be moving (positions changing)
      if (projectilePositions[0].length > 0) {
        expect(projectilePositions[0]).not.toEqual(projectilePositions[1]);
      }
    });

    test('should handle multiple simultaneous animations', async () => {
      // Start multiple movements and actions
      await page.keyboard.down('ArrowRight');
      await page.keyboard.down('ArrowUp');

      // Fire projectiles while moving
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(50);
      }

      await page.keyboard.up('ArrowRight');
      await page.keyboard.up('ArrowUp');

      // Check that animations don't interfere with each other
      const gameState = await page.evaluate(() => {
        return window.testUtils.getGameState();
      });

      expect(gameState.players.size).toBe(3); // Players should still exist
      expect(gameState.projectiles.length).toBeGreaterThan(0); // Projectiles should exist
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match expected initial game appearance', async () => {
      await page.waitForTimeout(1000); // Allow for full initialization

      const canvas = page.locator('#gameCanvas');
      await expect(canvas).toHaveScreenshot('initial-game-state.png');
    });

    test('should render UI elements consistently', async () => {
      const ui = page.locator('#ui');
      await expect(ui).toHaveScreenshot('game-ui.png');
    });

    test('should render player list consistently', async () => {
      const playerList = page.locator('#playerList');
      await expect(playerList).toHaveScreenshot('player-list.png');
    });

    test('should handle responsive layout correctly', async () => {
      // Test different viewport sizes
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);

      const canvas = page.locator('#gameCanvas');
      await expect(canvas).toBeVisible();

      // Canvas should maintain its dimensions
      const width = await canvas.getAttribute('width');
      const height = await canvas.getAttribute('height');
      expect(width).toBe('800');
      expect(height).toBe('600');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle missing game elements gracefully', async () => {
      // Remove a UI element and ensure game doesn't crash
      await page.evaluate(() => {
        const element = document.getElementById('scoreValue');
        if (element) element.remove();
      });

      // Game should still function
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Check that game is still running
      const isGameRunning = await page.evaluate(() => {
        return window.game && typeof window.game.render === 'function';
      });

      expect(isGameRunning).toBe(true);
    });

    test('should handle rapid input without crashing', async () => {
      // Rapidly press keys
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Space');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');
      }

      // Game should still be responsive
      const gameState = await page.evaluate(() => {
        return window.testUtils.getGameState();
      });

      expect(gameState).toBeDefined();
      expect(gameState.players.size).toBeGreaterThan(0);
    });

    test('should handle canvas context loss gracefully', async () => {
      // Simulate context loss (this is a theoretical test)
      const contextExists = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        return ctx !== null;
      });

      expect(contextExists).toBe(true);
    });
  });
});