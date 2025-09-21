/**
 * NetworkClient for handling WebSocket multiplayer communication
 */
class NetworkClient {
    constructor(url = null) {
        this.url = url || this.getDefaultServerUrl();
        this.socket = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.playerId = null;
        this.playerName = null;
        this.gameState = null;

        // Connection management
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;

        // Message queue for offline messages
        this.messageQueue = [];
        this.maxQueueSize = 100;

        // Event handlers
        this.eventHandlers = {
            'connect': [],
            'disconnect': [],
            'gameState': [],
            'playerJoined': [],
            'playerLeft': [],
            'tankUpdate': [],
            'bulletFired': [],
            'bulletHit': [],
            'playerHit': [],
            'playerDestroyed': [],
            'obstacleDestroyed': [],
            'powerUpSpawned': [],
            'powerUpCollected': [],
            'gameStart': [],
            'gameEnd': [],
            'error': []
        };

        // Network statistics
        this.stats = {
            messagesReceived: 0,
            messagesSent: 0,
            bytesReceived: 0,
            bytesSent: 0,
            averagePing: 0,
            lastPingTime: 0
        };

        this.init();
    }

    getDefaultServerUrl() {
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        // Connect to server on port 3001
        const serverPort = ':3001';
        return `${protocol}//${host}${serverPort}`;
    }

    init() {
        // Generate unique player ID if not exists
        this.playerId = localStorage.getItem('boloPlayerId') || this.generatePlayerId();
        localStorage.setItem('boloPlayerId', this.playerId);

        // Get player name
        this.playerName = localStorage.getItem('boloPlayerName') || `Player_${this.playerId.slice(0, 6)}`;
        localStorage.setItem('boloPlayerName', this.playerName);
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Connection management
    connect() {
        if (this.isConnected || this.isConnecting) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.isConnecting = true;
                // Use Socket.IO client instead of WebSocket
                this.socket = io(this.url, {
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    timeout: 10000,
                    transports: ['websocket', 'polling']
                });

                this.socket.on('connect', () => {
                    this.handleConnect();
                    resolve();
                });

                this.socket.on('disconnect', (reason) => {
                    this.handleDisconnect({ reason, code: null });
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error.message);
                    this.handleError(error);
                    if (this.isConnecting) {
                        this.isConnecting = false;
                        reject(error);
                    }
                });

                // Listen for game-specific messages
                this.setupSocketListeners();

                // Connection timeout
                setTimeout(() => {
                    if (this.isConnecting && !this.isConnected) {
                        this.socket.disconnect();
                        this.isConnecting = false;
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.cleanup();
    }

    cleanup() {
        this.isConnected = false;
        this.isConnecting = false;
        this.socket = null;

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    // Setup Socket.IO event listeners
    setupSocketListeners() {
        // Game state updates
        this.socket.on('gameState', (data) => {
            this.handleGameState(data);
        });

        this.socket.on('playerJoined', (data) => {
            this.emit('playerJoined', data);
        });

        this.socket.on('playerLeft', (data) => {
            this.emit('playerLeft', data);
        });

        this.socket.on('tankUpdate', (data) => {
            this.emit('tankUpdate', data);
        });

        this.socket.on('bulletFired', (data) => {
            this.emit('bulletFired', data);
        });

        this.socket.on('playerHit', (data) => {
            this.emit('playerHit', data);
        });

        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            this.emit('error', error);
        });
    }

    // Event handling
    handleConnect() {
        console.log('✅ Connected to game server at:', this.url);
        console.log('📊 Connection established:', new Date().toISOString());
        console.log('🔌 Socket ID:', this.socket.id);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Send initial player info
        this.sendMessage('playerJoin', {
            playerId: this.playerId,
            playerName: this.playerName
        });

        // Start heartbeat
        this.startHeartbeat();

        // Process queued messages
        this.processMessageQueue();

        // Trigger connect event
        this.emit('connect', { playerId: this.playerId, socketId: this.socket.id });
    }

    handleDisconnect(event) {
        console.log('Disconnected from game server:', event.reason);
        const wasConnected = this.isConnected;

        this.cleanup();

        if (wasConnected) {
            this.emit('disconnect', { reason: event.reason, code: event.code });

            // Auto-reconnect if not a clean disconnect
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        }
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.stats.messagesReceived++;
            this.stats.bytesReceived += event.data.length;

            // Log incoming messages for debugging
            console.log('📥 Message received:', data.type, 'Total messages:', this.stats.messagesReceived);

            // Handle special messages
            switch (data.type) {
                case 'pong':
                    this.handlePong(data);
                    break;
                case 'gameState':
                    this.gameState = data.payload;
                    console.log('🎮 Game state updated:', data.payload);
                    this.emit('gameState', data.payload);
                    break;
                default:
                    console.log('📨 Event emitted:', data.type);
                    this.emit(data.type, data.payload);
                    break;
            }

        } catch (error) {
            console.error('Error parsing message:', error);
            this.emit('error', { error: 'Message parse error', raw: event.data });
        }
    }

    handleError(event) {
        console.error('WebSocket error:', event);
        this.emit('error', { error: 'WebSocket error', event: event });
    }

    // Message handling
    sendMessage(type, payload = {}) {
        const message = {
            type: type,
            payload: payload,
            timestamp: Date.now(),
            playerId: this.playerId
        };

        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            try {
                const messageStr = JSON.stringify(message);
                this.socket.send(messageStr);
                this.stats.messagesSent++;
                this.stats.bytesSent += messageStr.length;
                console.log('📤 Message sent:', type, 'Total sent:', this.stats.messagesSent);
                return true;
            } catch (error) {
                console.error('Error sending message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            this.queueMessage(message);
            return false;
        }
    }

    queueMessage(message) {
        if (this.messageQueue.length >= this.maxQueueSize) {
            this.messageQueue.shift(); // Remove oldest message
        }
        this.messageQueue.push(message);
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            const messageStr = JSON.stringify(message);
            this.socket.send(messageStr);
            this.stats.messagesSent++;
            this.stats.bytesSent += messageStr.length;
        }
    }

    // Heartbeat system
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.stats.lastPingTime = Date.now();
                this.sendMessage('ping', { timestamp: this.stats.lastPingTime });

                // Set timeout for pong response
                this.heartbeatTimeout = setTimeout(() => {
                    console.log('Heartbeat timeout - connection lost');
                    this.socket.close();
                }, 5000);
            }
        }, 30000); // Send heartbeat every 30 seconds
    }

    handlePong(data) {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }

        // Calculate ping
        const ping = Date.now() - data.payload.timestamp;
        this.stats.averagePing = this.stats.averagePing * 0.8 + ping * 0.2;
    }

    // Reconnection
    scheduleReconnect() {
        this.reconnectAttempts++;
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect().catch(error => {
                    console.error('Reconnect failed:', error);
                    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);

                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    } else {
                        this.emit('error', { error: 'Max reconnect attempts reached' });
                    }
                });
            }
        }, this.reconnectDelay);
    }

    // Game-specific methods
    sendTankUpdate(tank) {
        this.sendMessage('tankUpdate', tank.getNetworkState());
    }

    sendBulletFired(bullet) {
        this.sendMessage('bulletFired', bullet.getNetworkState());
    }

    sendPlayerHit(targetId, damage, sourceId) {
        this.sendMessage('playerHit', {
            targetId: targetId,
            damage: damage,
            sourceId: sourceId,
            timestamp: Date.now()
        });
    }

    sendChat(message) {
        this.sendMessage('chat', {
            playerId: this.playerId,
            playerName: this.playerName,
            message: message,
            timestamp: Date.now()
        });
    }

    requestGameState() {
        this.sendMessage('requestGameState');
    }

    // Event system
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index !== -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // Utility methods
    getConnectionStatus() {
        if (this.isConnected) return 'connected';
        if (this.isConnecting) return 'connecting';
        return 'disconnected';
    }

    getNetworkStats() {
        return { ...this.stats };
    }

    setPlayerName(name) {
        this.playerName = name;
        localStorage.setItem('boloPlayerName', name);

        if (this.isConnected) {
            this.sendMessage('playerNameUpdate', {
                playerId: this.playerId,
                playerName: name
            });
        }
    }

    // Server URL management
    setServerUrl(url) {
        if (this.isConnected) {
            this.disconnect();
        }
        this.url = url;
    }

    // Mock mode for offline testing
    enableMockMode() {
        console.log('Enabling mock network mode');
        this.isMockMode = true;
        this.isConnected = true;

        // Simulate connection after delay
        setTimeout(() => {
            this.emit('connect', { playerId: this.playerId });
        }, 100);

        // Simulate periodic game state updates
        setInterval(() => {
            if (this.isMockMode) {
                this.emit('gameState', this.generateMockGameState());
            }
        }, 100);
    }

    generateMockGameState() {
        return {
            players: [
                {
                    id: this.playerId,
                    name: this.playerName,
                    x: 200,
                    y: 200,
                    health: 100,
                    score: 0,
                    isAlive: true
                }
            ],
            bullets: [],
            obstacles: [],
            powerUps: []
        };
    }

    toString() {
        return `NetworkClient(${this.getConnectionStatus()}, ${this.stats.messagesReceived} msgs received)`;
    }
}