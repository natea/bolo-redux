/**
 * HUD (Heads-Up Display) manager for game UI elements
 */
class HUD {
    constructor() {
        this.elements = {
            scorePanel: document.getElementById('score-panel'),
            scoreList: document.getElementById('score-list'),
            playerPanel: document.getElementById('player-panel'),
            playerList: document.getElementById('player-list'),
            healthBar: document.getElementById('health-fill'),
            ammoCounter: document.getElementById('ammo-count'),
            connectionStatus: document.getElementById('status-text')
        };

        // HUD state
        this.scores = new Map();
        this.players = new Map();
        this.localPlayerId = null;
        this.isVisible = true;

        // Animations
        this.animations = {
            healthFlash: 0,
            ammoFlash: 0,
            scoreUpdate: new Map()
        };

        // Settings
        this.maxScoreEntries = 10;
        this.maxPlayerEntries = 8;
        this.autoHideDelay = 5000; // 5 seconds
        this.autoHideTimer = null;

        // Initialize HUD
        this.initialize();
    }

    initialize() {
        // Set initial connection status
        this.updateConnectionStatus('connecting');

        // Create loading overlay
        this.createLoadingOverlay();

        // Add event listeners for HUD interactions
        this.setupEventListeners();

        // Start update loop
        this.startUpdateLoop();
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loading-overlay';

        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Connecting to game server...';

        overlay.appendChild(loadingText);
        document.body.appendChild(overlay);
    }

    removeLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    setupEventListeners() {
        // Score panel click to expand/collapse
        if (this.elements.scorePanel) {
            this.elements.scorePanel.addEventListener('click', () => {
                this.toggleScorePanel();
            });
        }

        // Player panel click to expand/collapse
        if (this.elements.playerPanel) {
            this.elements.playerPanel.addEventListener('click', () => {
                this.togglePlayerPanel();
            });
        }

        // Auto-hide on mouse move
        document.addEventListener('mousemove', () => {
            this.resetAutoHide();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    this.toggleScoreboard();
                    break;
                case 'F11':
                    this.toggleHUD();
                    break;
            }
        });
    }

    startUpdateLoop() {
        const update = () => {
            this.updateAnimations();
            requestAnimationFrame(update);
        };
        update();
    }

    // Connection status management
    updateConnectionStatus(status, details = '') {
        if (!this.elements.connectionStatus) return;

        const statusElement = this.elements.connectionStatus;
        statusElement.className = `status-${status}`;

        switch (status) {
            case 'connecting':
                statusElement.textContent = 'Connecting...';
                break;
            case 'connected':
                statusElement.textContent = `Connected${details ? ' - ' + details : ''}`;
                this.removeLoadingOverlay();
                break;
            case 'disconnected':
                statusElement.textContent = `Disconnected${details ? ' - ' + details : ''}`;
                break;
            case 'reconnecting':
                statusElement.textContent = 'Reconnecting...';
                break;
            case 'error':
                statusElement.textContent = `Error${details ? ' - ' + details : ''}`;
                break;
        }
    }

    // Player health and ammo
    updatePlayerStats(health, maxHealth, ammo, maxAmmo) {
        this.updateHealthBar(health, maxHealth);
        this.updateAmmoCounter(ammo, maxAmmo);
    }

    updateHealthBar(health, maxHealth) {
        if (!this.elements.healthBar) return;

        const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
        this.elements.healthBar.style.width = `${healthPercent}%`;

        // Color based on health percentage
        if (healthPercent > 75) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #00ff00, #88ff88)';
        } else if (healthPercent > 50) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #ffff00, #ffff88)';
        } else if (healthPercent > 25) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #ff8800, #ffaa44)';
        } else {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
            this.animations.healthFlash = 1.0; // Trigger flash animation
        }

        // Low health warning
        if (healthPercent < 25 && healthPercent > 0) {
            this.flashElement(this.elements.healthBar.parentElement, '#ff0000');
        }
    }

    updateAmmoCounter(ammo, maxAmmo) {
        if (!this.elements.ammoCounter) return;

        this.elements.ammoCounter.textContent = `${ammo}`;

        // Color based on ammo percentage
        const ammoPercent = (ammo / maxAmmo) * 100;
        if (ammoPercent > 50) {
            this.elements.ammoCounter.style.color = '#00ff00';
        } else if (ammoPercent > 25) {
            this.elements.ammoCounter.style.color = '#ffff00';
        } else {
            this.elements.ammoCounter.style.color = '#ff0000';
            if (ammo === 0) {
                this.animations.ammoFlash = 1.0; // Trigger flash animation
                this.flashElement(this.elements.ammoCounter, '#ff0000');
            }
        }
    }

    // Score management
    updateScore(playerId, playerName, score, kills = 0, deaths = 0) {
        const scoreData = {
            id: playerId,
            name: playerName,
            score: score,
            kills: kills,
            deaths: deaths,
            lastUpdate: Date.now()
        };

        this.scores.set(playerId, scoreData);

        // Trigger score update animation
        this.animations.scoreUpdate.set(playerId, 1.0);

        this.renderScoreList();
    }

    removeScore(playerId) {
        this.scores.delete(playerId);
        this.animations.scoreUpdate.delete(playerId);
        this.renderScoreList();
    }

    renderScoreList() {
        if (!this.elements.scoreList) return;

        // Sort scores by score value (descending)
        const sortedScores = Array.from(this.scores.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, this.maxScoreEntries);

        this.elements.scoreList.innerHTML = '';

        sortedScores.forEach((scoreData, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';

            // Highlight local player
            if (scoreData.id === this.localPlayerId) {
                scoreItem.classList.add('self');
            }

            // Rank indicator
            const rank = index + 1;
            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

            scoreItem.innerHTML = `
                <span class="rank">${rankEmoji}</span>
                <span class="name">${this.truncateName(scoreData.name)}</span>
                <span class="score">${scoreData.score}</span>
                <span class="kd">${scoreData.kills}/${scoreData.deaths}</span>
            `;

            // Apply update animation
            const animationStrength = this.animations.scoreUpdate.get(scoreData.id) || 0;
            if (animationStrength > 0) {
                scoreItem.style.backgroundColor = `rgba(0, 255, 0, ${animationStrength * 0.3})`;
            }

            this.elements.scoreList.appendChild(scoreItem);
        });
    }

    // Player list management
    updatePlayer(playerId, playerData) {
        this.players.set(playerId, {
            ...playerData,
            lastUpdate: Date.now()
        });

        this.renderPlayerList();
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.renderPlayerList();
    }

    renderPlayerList() {
        if (!this.elements.playerList) return;

        // Sort players by status (alive first) then by name
        const sortedPlayers = Array.from(this.players.values())
            .sort((a, b) => {
                if (a.isAlive !== b.isAlive) {
                    return b.isAlive - a.isAlive; // Alive players first
                }
                return a.name.localeCompare(b.name);
            })
            .slice(0, this.maxPlayerEntries);

        this.elements.playerList.innerHTML = '';

        sortedPlayers.forEach(playerData => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';

            // Status classes
            if (!playerData.isAlive) {
                playerItem.classList.add('dead');
            }
            if (playerData.id === this.localPlayerId) {
                playerItem.classList.add('self');
            }

            // Health bar for living players
            const healthBar = playerData.isAlive ?
                `<div class="mini-health-bar" style="width: ${(playerData.health / 100) * 100}%"></div>` : '';

            // Ping indicator
            const pingColor = this.getPingColor(playerData.ping || 0);
            const pingIndicator = `<span class="ping" style="color: ${pingColor}">●</span>`;

            playerItem.innerHTML = `
                <span class="player-name">${this.truncateName(playerData.name)}</span>
                <span class="player-status">${playerData.isAlive ? '✓' : '✗'}</span>
                ${pingIndicator}
                ${healthBar}
            `;

            this.elements.playerList.appendChild(playerItem);
        });
    }

    // Utility methods
    truncateName(name, maxLength = 12) {
        return name.length > maxLength ? name.substring(0, maxLength - 2) + '..' : name;
    }

    getPingColor(ping) {
        if (ping < 50) return '#00ff00';
        if (ping < 100) return '#ffff00';
        if (ping < 200) return '#ff8800';
        return '#ff0000';
    }

    flashElement(element, color = '#ffffff', duration = 200) {
        if (!element) return;

        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = color;

        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, duration);
    }

    // Animation updates
    updateAnimations() {
        const deltaTime = 0.016; // Assume 60 FPS

        // Health flash animation
        if (this.animations.healthFlash > 0) {
            this.animations.healthFlash -= deltaTime * 3;
            if (this.animations.healthFlash <= 0) {
                this.animations.healthFlash = 0;
            }
        }

        // Ammo flash animation
        if (this.animations.ammoFlash > 0) {
            this.animations.ammoFlash -= deltaTime * 3;
            if (this.animations.ammoFlash <= 0) {
                this.animations.ammoFlash = 0;
            }
        }

        // Score update animations
        this.animations.scoreUpdate.forEach((value, playerId) => {
            if (value > 0) {
                const newValue = value - deltaTime * 2;
                if (newValue <= 0) {
                    this.animations.scoreUpdate.delete(playerId);
                } else {
                    this.animations.scoreUpdate.set(playerId, newValue);
                }
            }
        });
    }

    // HUD visibility
    toggleHUD() {
        this.isVisible = !this.isVisible;
        const hud = document.getElementById('hud');
        if (hud) {
            hud.style.display = this.isVisible ? 'flex' : 'none';
        }
    }

    toggleScorePanel() {
        if (this.elements.scorePanel) {
            const isCollapsed = this.elements.scorePanel.classList.toggle('collapsed');
            this.elements.scoreList.style.display = isCollapsed ? 'none' : 'block';
        }
    }

    togglePlayerPanel() {
        if (this.elements.playerPanel) {
            const isCollapsed = this.elements.playerPanel.classList.toggle('collapsed');
            this.elements.playerList.style.display = isCollapsed ? 'none' : 'block';
        }
    }

    toggleScoreboard() {
        // Temporarily show full scoreboard
        const isVisible = this.elements.scorePanel.style.opacity !== '0';

        if (!isVisible) {
            this.showFullScoreboard();
            setTimeout(() => {
                this.hideFullScoreboard();
            }, 3000); // Show for 3 seconds
        }
    }

    showFullScoreboard() {
        if (this.elements.scorePanel) {
            this.elements.scorePanel.style.opacity = '1';
            this.elements.scorePanel.style.transform = 'scale(1.1)';
        }
        if (this.elements.playerPanel) {
            this.elements.playerPanel.style.opacity = '1';
            this.elements.playerPanel.style.transform = 'scale(1.1)';
        }
    }

    hideFullScoreboard() {
        if (this.elements.scorePanel) {
            this.elements.scorePanel.style.opacity = '';
            this.elements.scorePanel.style.transform = '';
        }
        if (this.elements.playerPanel) {
            this.elements.playerPanel.style.opacity = '';
            this.elements.playerPanel.style.transform = '';
        }
    }

    // Auto-hide functionality
    resetAutoHide() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }

        // Show HUD
        const hud = document.getElementById('hud');
        if (hud && this.isVisible) {
            hud.style.opacity = '1';
        }

        // Set new auto-hide timer
        this.autoHideTimer = setTimeout(() => {
            if (hud && this.isVisible) {
                hud.style.opacity = '0.3';
            }
        }, this.autoHideDelay);
    }

    // Game event handlers
    onGameStart() {
        this.updateConnectionStatus('connected', 'Game Started');
        this.resetAutoHide();
    }

    onGameEnd(winnerData) {
        // Show game end screen
        this.showGameEndScreen(winnerData);
    }

    onPlayerJoin(playerData) {
        this.updatePlayer(playerData.id, playerData);
        this.showNotification(`${playerData.name} joined the game`, 'info');
    }

    onPlayerLeave(playerData) {
        this.removePlayer(playerData.id);
        this.removeScore(playerData.id);
        this.showNotification(`${playerData.name} left the game`, 'info');
    }

    onPlayerKill(killerData, victimData) {
        const message = killerData.id === this.localPlayerId ?
            `You eliminated ${victimData.name}!` :
            victimData.id === this.localPlayerId ?
            `You were eliminated by ${killerData.name}` :
            `${killerData.name} eliminated ${victimData.name}`;

        this.showNotification(message, 'combat');
    }

    showGameEndScreen(winnerData) {
        const overlay = document.createElement('div');
        overlay.className = 'game-end-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: #00ff00;
            font-family: monospace;
        `;

        const title = document.createElement('h1');
        title.textContent = 'GAME OVER';
        title.style.cssText = 'font-size: 48px; margin-bottom: 20px;';

        const winner = document.createElement('h2');
        winner.textContent = `Winner: ${winnerData.name}`;
        winner.style.cssText = 'font-size: 32px; margin-bottom: 40px; color: #ffff00;';

        const finalScores = document.createElement('div');
        finalScores.innerHTML = '<h3>Final Scores</h3>';
        // Add final score display here

        overlay.appendChild(title);
        overlay.appendChild(winner);
        overlay.appendChild(finalScores);

        document.body.appendChild(overlay);

        // Remove after 10 seconds
        setTimeout(() => {
            overlay.remove();
        }, 10000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 140px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #00ff00;
            padding: 10px 15px;
            color: #00ff00;
            font-family: monospace;
            font-size: 14px;
            z-index: 1500;
            animation: slideIn 0.3s ease-out;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Color by type
        switch (type) {
            case 'combat':
                notification.style.borderColor = '#ff4400';
                notification.style.color = '#ff4400';
                break;
            case 'warning':
                notification.style.borderColor = '#ffff00';
                notification.style.color = '#ffff00';
                break;
            case 'error':
                notification.style.borderColor = '#ff0000';
                notification.style.color = '#ff0000';
                break;
        }

        // Auto-remove
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Settings
    setLocalPlayerId(playerId) {
        this.localPlayerId = playerId;
    }

    setMaxEntries(scores, players) {
        this.maxScoreEntries = scores;
        this.maxPlayerEntries = players;
    }

    // Cleanup
    destroy() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }

        // Remove all event listeners
        // Clear animations
        this.animations.scoreUpdate.clear();
    }

    toString() {
        return `HUD(${this.scores.size} scores, ${this.players.size} players, visible: ${this.isVisible})`;
    }
}