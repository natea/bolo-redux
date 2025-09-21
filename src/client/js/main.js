/**
 * Main entry point for Bolo Tank Game
 */

// Global game instance
let game = null;

// Configuration
const CONFIG = {
    CANVAS_ID: 'game-canvas',
    DEBUG_MODE: false,
    AUTO_START: true,
    MOBILE_CONTROLS: true
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Bolo Tank Game - Starting...');
    initializeGame();
});

async function initializeGame() {
    try {
        // Show loading screen
        showLoadingScreen();

        // Check browser compatibility
        if (!checkBrowserCompatibility()) {
            throw new Error('Browser not compatible. Please use a modern browser with WebGL support.');
        }

        // Initialize game instance
        game = new Game(CONFIG.CANVAS_ID);

        // Setup global event handlers
        setupGlobalHandlers();

        // Setup debug console if enabled
        if (CONFIG.DEBUG_MODE) {
            setupDebugConsole();
        }

        // Setup mobile controls if needed
        if (CONFIG.MOBILE_CONTROLS && isMobileDevice()) {
            setupMobileControls();
        }

        // Wait for game initialization
        await waitForGameReady();

        // Hide loading screen
        hideLoadingScreen();

        // Show welcome message
        showWelcomeMessage();

        console.log('✅ Game initialized successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorScreen(error.message);
    }
}

function checkBrowserCompatibility() {
    const requiredFeatures = [
        'WebSocket',
        'requestAnimationFrame',
        'Map',
        'Set',
        'Promise'
    ];

    for (const feature of requiredFeatures) {
        if (!(feature in window)) {
            console.error(`Missing required feature: ${feature}`);
            return false;
        }
    }

    // Check Canvas support
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) {
        console.error('Canvas 2D not supported');
        return false;
    }

    // Check WebGL support (for future use)
    try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.warn('WebGL not supported - some features may be limited');
        }
    } catch (e) {
        console.warn('WebGL check failed:', e);
    }

    return true;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

function setupGlobalHandlers() {
    // Error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (game && game.hud) {
            game.hud.showNotification('An error occurred. Check console for details.', 'error');
        }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (game && game.hud) {
            game.hud.showNotification('Connection error occurred.', 'error');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Global shortcuts that work regardless of game state
        switch (event.key) {
            case 'F12':
                if (CONFIG.DEBUG_MODE) {
                    toggleDebugConsole();
                }
                break;
            case 'F5':
                event.preventDefault();
                restartGame();
                break;
        }
    });

    // Context menu prevention on game canvas
    const canvas = document.getElementById(CONFIG.CANVAS_ID);
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
}

function setupMobileControls() {
    console.log('📱 Setting up mobile controls...');

    // Add mobile-specific CSS
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        @media (max-width: 768px) {
            #game-container {
                overflow: hidden;
            }

            #hud {
                height: 80px;
                font-size: 12px;
            }

            #score-panel, #player-panel {
                width: 150px;
            }

            .loading-text {
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(mobileStyles);

    // Create virtual controls via InputManager
    if (game && game.inputManager) {
        game.inputManager.createVirtualControls();
    }

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Prevent default touch behaviors on game canvas
    const canvas = document.getElementById(CONFIG.CANVAS_ID);
    if (canvas) {
        canvas.addEventListener('touchstart', (e) => e.preventDefault());
        canvas.addEventListener('touchmove', (e) => e.preventDefault());
        canvas.addEventListener('touchend', (e) => e.preventDefault());
    }
}

function setupDebugConsole() {
    const debugConsole = document.createElement('div');
    debugConsole.id = 'debug-console';
    debugConsole.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        height: 200px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border: 1px solid #00ff00;
        overflow-y: auto;
        z-index: 9999;
        display: none;
    `;

    const title = document.createElement('div');
    title.textContent = '🐛 Debug Console';
    title.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #ffff00;';

    const content = document.createElement('div');
    content.id = 'debug-content';

    debugConsole.appendChild(title);
    debugConsole.appendChild(content);
    document.body.appendChild(debugConsole);

    // Update debug info every second
    setInterval(() => {
        if (game && debugConsole.style.display !== 'none') {
            updateDebugInfo();
        }
    }, 1000);
}

function updateDebugInfo() {
    const debugContent = document.getElementById('debug-content');
    if (!debugContent || !game) return;

    const info = game.getGameInfo();
    const networkStats = game.networkClient ? game.networkClient.getNetworkStats() : null;

    debugContent.innerHTML = `
        <div>FPS: ${info.fps}</div>
        <div>Tanks: ${info.tanks}</div>
        <div>Bullets: ${info.bullets}</div>
        <div>Running: ${info.isRunning}</div>
        <div>Paused: ${info.isPaused}</div>
        <div>Network: ${info.networkConnected ? '✅' : '❌'}</div>
        ${networkStats ? `
            <div>Ping: ${Math.round(networkStats.averagePing)}ms</div>
            <div>Msgs Sent: ${networkStats.messagesSent}</div>
            <div>Msgs Recv: ${networkStats.messagesReceived}</div>
        ` : ''}
        <div>Player: ${info.playerId?.slice(0, 8) || 'None'}</div>
    `;
}

function toggleDebugConsole() {
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
    }
}

async function waitForGameReady() {
    return new Promise((resolve) => {
        // Simple check - wait for game to be running
        const checkReady = () => {
            if (game && game.isRunning) {
                resolve();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    });
}

function showLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showWelcomeMessage() {
    if (game && game.hud) {
        game.hud.showNotification('🎯 Welcome to Bolo Tank Game! Use WASD to move, mouse to aim and shoot!', 'info', 5000);
    }
}

function showErrorScreen(message) {
    hideLoadingScreen();

    const errorScreen = document.createElement('div');
    errorScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        color: #ff0000;
        font-family: monospace;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    errorScreen.innerHTML = `
        <h1>🚫 Game Error</h1>
        <p style="margin: 20px; text-align: center; max-width: 600px;">${message}</p>
        <button onclick="location.reload()" style="
            background: #ff0000;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        ">Reload Page</button>
        <div style="margin-top: 40px; font-size: 12px; color: #666;">
            <p>If this problem persists, try:</p>
            <ul style="text-align: left;">
                <li>Refreshing the page (F5)</li>
                <li>Clearing browser cache</li>
                <li>Using a different browser</li>
                <li>Checking your internet connection</li>
            </ul>
        </div>
    `;

    document.body.appendChild(errorScreen);
}

function restartGame() {
    if (game) {
        console.log('🔄 Restarting game...');
        game.restart();
        if (game.hud) {
            game.hud.showNotification('Game restarted!', 'info');
        }
    } else {
        location.reload();
    }
}

// Global utility functions
window.restartGame = restartGame;
window.toggleDebugConsole = toggleDebugConsole;

// Game information for external access
window.getGameInfo = () => {
    if (game) {
        return game.getGameInfo();
    }
    return { status: 'not_initialized' };
};

// Performance monitoring
window.addEventListener('load', () => {
    // Log performance timing
    if (performance && performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`📊 Page load time: ${loadTime}ms`);
    }
});

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // TODO: Register service worker for offline support
        console.log('💾 Service Worker support detected');
    });
}

// Analytics and monitoring (placeholder)
function trackGameEvent(eventName, data) {
    console.log(`📈 Game Event: ${eventName}`, data);
    // TODO: Implement analytics tracking
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeGame,
        CONFIG,
        restartGame
    };
}

console.log('🎮 Bolo Tank Game main.js loaded');