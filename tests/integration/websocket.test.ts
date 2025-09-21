import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';
import { TestWebSocketServer, NetworkTestUtils, GameStateTestUtils } from '../utils/test-helpers';

// Game network manager for WebSocket communication
class GameNetworkManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.handleDisconnection();
      };
    });
  }

  send(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    } else {
      this.listeners.delete(event);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      this.emit(message.type, message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  private async handleDisconnection(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      await NetworkTestUtils.simulateLatency(this.reconnectDelay);
      // Reconnection logic would go here
    }
  }
}

// Multiplayer game state synchronizer
class GameStateSynchronizer {
  private networkManager: GameNetworkManager;
  private localState: any;
  private stateBuffer: any[] = [];
  private lastSyncTime = 0;
  private syncInterval = 50; // 20 updates per second

  constructor(networkManager: GameNetworkManager) {
    this.networkManager = networkManager;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.networkManager.on('gameState', (message: any) => {
      this.handleStateUpdate(message.data);
    });

    this.networkManager.on('playerUpdate', (message: any) => {
      this.handlePlayerUpdate(message.data);
    });
  }

  setLocalState(state: any): void {
    this.localState = state;
  }

  syncState(): void {
    const now = Date.now();
    if (now - this.lastSyncTime >= this.syncInterval) {
      if (this.localState) {
        this.networkManager.send({
          type: 'gameState',
          data: this.localState,
          timestamp: now
        });
        this.lastSyncTime = now;
      }
    }
  }

  private handleStateUpdate(state: any): void {
    this.stateBuffer.push({
      state,
      timestamp: Date.now()
    });

    // Keep only recent states (1 second worth)
    const cutoff = Date.now() - 1000;
    this.stateBuffer = this.stateBuffer.filter(item => item.timestamp > cutoff);
  }

  private handlePlayerUpdate(playerData: any): void {
    if (this.localState && this.localState.players) {
      this.localState.players.set(playerData.id, playerData);
    }
  }

  getInterpolatedState(timestamp: number): any {
    if (this.stateBuffer.length < 2) {
      return this.stateBuffer[0]?.state || null;
    }

    // Find two states to interpolate between
    let prevState = null;
    let nextState = null;

    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= timestamp &&
          this.stateBuffer[i + 1].timestamp >= timestamp) {
        prevState = this.stateBuffer[i];
        nextState = this.stateBuffer[i + 1];
        break;
      }
    }

    if (!prevState || !nextState) {
      return this.stateBuffer[this.stateBuffer.length - 1]?.state || null;
    }

    // Interpolate between states
    const factor = (timestamp - prevState.timestamp) /
                   (nextState.timestamp - prevState.timestamp);

    return this.interpolateStates(prevState.state, nextState.state, factor);
  }

  private interpolateStates(state1: any, state2: any, factor: number): any {
    // Simple interpolation for player positions
    const interpolated = JSON.parse(JSON.stringify(state1));

    if (state1.players && state2.players) {
      state1.players.forEach((player1: any, id: string) => {
        const player2 = state2.players.get(id);
        if (player2) {
          const interpolatedPlayer = interpolated.players.get(id);
          interpolatedPlayer.position.x = player1.position.x +
            (player2.position.x - player1.position.x) * factor;
          interpolatedPlayer.position.y = player1.position.y +
            (player2.position.y - player1.position.y) * factor;
        }
      });
    }

    return interpolated;
  }
}

describe('WebSocket Communication Tests', () => {
  let testServer: TestWebSocketServer;
  let networkManager: GameNetworkManager;
  let synchronizer: GameStateSynchronizer;

  beforeEach(async () => {
    testServer = new TestWebSocketServer(8081);
    await testServer.start();

    networkManager = new GameNetworkManager();
    synchronizer = new GameStateSynchronizer(networkManager);
  });

  afterEach(async () => {
    networkManager.disconnect();
    await testServer.stop();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection successfully', async () => {
      await networkManager.connect(testServer.getUrl());
      expect(networkManager.isConnected()).toBe(true);
    });

    it('should handle connection failure gracefully', async () => {
      await expect(networkManager.connect('ws://localhost:9999')).rejects.toThrow();
    });

    it('should disconnect cleanly', async () => {
      await networkManager.connect(testServer.getUrl());
      expect(networkManager.isConnected()).toBe(true);

      networkManager.disconnect();
      expect(networkManager.isConnected()).toBe(false);
    });

    it('should maintain connection state correctly', async () => {
      expect(networkManager.isConnected()).toBe(false);

      await networkManager.connect(testServer.getUrl());
      expect(networkManager.isConnected()).toBe(true);

      networkManager.disconnect();
      expect(networkManager.isConnected()).toBe(false);
    });
  });

  describe('Message Sending and Receiving', () => {
    beforeEach(async () => {
      await networkManager.connect(testServer.getUrl());
    });

    it('should send messages successfully when connected', () => {
      const message = { type: 'test', data: 'hello' };
      const result = networkManager.send(message);
      expect(result).toBe(true);
    });

    it('should fail to send messages when disconnected', () => {
      networkManager.disconnect();
      const message = { type: 'test', data: 'hello' };
      const result = networkManager.send(message);
      expect(result).toBe(false);
    });

    it('should receive and parse messages correctly', async () => {
      const receivedMessages: any[] = [];
      networkManager.on('test', (message: any) => {
        receivedMessages.push(message);
      });

      // Create second client to send message
      const client2 = new GameNetworkManager();
      await client2.connect(testServer.getUrl());

      const testMessage = { type: 'test', data: 'hello world' };
      client2.send(testMessage);

      // Wait for message propagation
      await NetworkTestUtils.simulateLatency(100);

      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].type).toBe('test');
      expect(receivedMessages[0].data).toBe('hello world');

      client2.disconnect();
    });

    it('should handle malformed messages gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate malformed message (this would need server-side support)
      networkManager['handleMessage']('invalid json');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse message:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await networkManager.connect(testServer.getUrl());
    });

    it('should register and trigger event listeners', () => {
      const callback = vi.fn();
      networkManager.on('test-event', callback);

      networkManager['emit']('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should support multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      networkManager.on('test-event', callback1);
      networkManager.on('test-event', callback2);

      networkManager['emit']('test-event', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should remove event listeners correctly', () => {
      const callback = vi.fn();
      networkManager.on('test-event', callback);
      networkManager.off('test-event', callback);

      networkManager['emit']('test-event', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove all listeners for event when no callback specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      networkManager.on('test-event', callback1);
      networkManager.on('test-event', callback2);
      networkManager.off('test-event');

      networkManager['emit']('test-event', { data: 'test' });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Client Communication', () => {
    it('should handle multiple simultaneous connections', async () => {
      const clients = await NetworkTestUtils.createTestClients(3, testServer.getUrl());

      expect(testServer.getClientCount()).toBe(3);

      // Close all clients
      clients.forEach(client => client.close());

      // Wait for disconnections
      await NetworkTestUtils.simulateLatency(100);
    });

    it('should broadcast messages to all connected clients', async () => {
      const client1 = new GameNetworkManager();
      const client2 = new GameNetworkManager();
      const client3 = new GameNetworkManager();

      await Promise.all([
        client1.connect(testServer.getUrl()),
        client2.connect(testServer.getUrl()),
        client3.connect(testServer.getUrl())
      ]);

      const receivedMessages: any[] = [];
      client2.on('broadcast', (msg: any) => receivedMessages.push(msg));
      client3.on('broadcast', (msg: any) => receivedMessages.push(msg));

      const message = { type: 'broadcast', data: 'hello everyone' };
      client1.send(message);

      await NetworkTestUtils.simulateLatency(100);

      expect(receivedMessages).toHaveLength(2); // client2 and client3 should receive

      [client1, client2, client3].forEach(client => client.disconnect());
    });

    it('should handle client disconnections gracefully', async () => {
      const client1 = new GameNetworkManager();
      const client2 = new GameNetworkManager();

      await Promise.all([
        client1.connect(testServer.getUrl()),
        client2.connect(testServer.getUrl())
      ]);

      expect(testServer.getClientCount()).toBe(2);

      client1.disconnect();
      await NetworkTestUtils.simulateLatency(100);

      expect(testServer.getClientCount()).toBe(1);

      client2.disconnect();
    });
  });

  describe('Game State Synchronization', () => {
    beforeEach(async () => {
      await networkManager.connect(testServer.getUrl());
    });

    it('should sync local game state to network', () => {
      const gameState = GameStateTestUtils.createGameWorld(2);
      synchronizer.setLocalState(gameState);

      const sendSpy = vi.spyOn(networkManager, 'send');

      synchronizer.syncState();

      expect(sendSpy).toHaveBeenCalledWith({
        type: 'gameState',
        data: gameState,
        timestamp: expect.any(Number)
      });
    });

    it('should respect sync interval timing', async () => {
      const gameState = GameStateTestUtils.createGameWorld(1);
      synchronizer.setLocalState(gameState);

      const sendSpy = vi.spyOn(networkManager, 'send');

      // First sync should work
      synchronizer.syncState();
      expect(sendSpy).toHaveBeenCalledTimes(1);

      // Immediate second sync should be throttled
      synchronizer.syncState();
      expect(sendSpy).toHaveBeenCalledTimes(1);

      // After waiting, sync should work again
      await NetworkTestUtils.simulateLatency(60);
      synchronizer.syncState();
      expect(sendSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle incoming state updates', () => {
      const remoteState = GameStateTestUtils.createGameWorld(1);

      networkManager['emit']('gameState', {
        type: 'gameState',
        data: remoteState,
        timestamp: Date.now()
      });

      // State should be buffered
      expect(synchronizer['stateBuffer']).toHaveLength(1);
    });

    it('should interpolate between states for smooth animation', () => {
      const state1 = GameStateTestUtils.createGameWorld(1);
      const state2 = GameStateTestUtils.createGameWorld(1);

      // Modify player position in state2
      const player = state2.players.get('player-0');
      player.position.x = 200;
      player.position.y = 200;

      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 + 100;

      // Add states to buffer
      synchronizer['stateBuffer'] = [
        { state: state1, timestamp: timestamp1 },
        { state: state2, timestamp: timestamp2 }
      ];

      // Interpolate at midpoint
      const interpolated = synchronizer.getInterpolatedState(timestamp1 + 50);

      const interpolatedPlayer = interpolated.players.get('player-0');
      expect(interpolatedPlayer.position.x).toBeCloseTo(150); // halfway between 100 and 200
      expect(interpolatedPlayer.position.y).toBeCloseTo(150);
    });

    it('should handle player updates correctly', () => {
      const gameState = GameStateTestUtils.createGameWorld(2);
      synchronizer.setLocalState(gameState);

      const updatedPlayer = {
        id: 'player-0',
        position: { x: 300, y: 300 },
        velocity: { x: 5, y: 5 },
        health: 80,
        score: 100
      };

      networkManager['emit']('playerUpdate', {
        type: 'playerUpdate',
        data: updatedPlayer
      });

      const localPlayer = gameState.players.get('player-0');
      expect(localPlayer.position.x).toBe(300);
      expect(localPlayer.position.y).toBe(300);
      expect(localPlayer.health).toBe(80);
      expect(localPlayer.score).toBe(100);
    });
  });

  describe('Network Performance and Reliability', () => {
    beforeEach(async () => {
      await networkManager.connect(testServer.getUrl());
    });

    it('should handle high-frequency message sending', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        type: 'performance-test',
        data: `message-${i}`,
        id: i
      }));

      const startTime = performance.now();

      for (const message of messages) {
        networkManager.send(message);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should send 100 messages in under 100ms
    });

    it('should maintain message order', async () => {
      const client2 = new GameNetworkManager();
      await client2.connect(testServer.getUrl());

      const receivedMessages: any[] = [];
      client2.on('order-test', (msg: any) => {
        receivedMessages.push(msg.data.id);
      });

      // Send messages in sequence
      for (let i = 0; i < 10; i++) {
        networkManager.send({
          type: 'order-test',
          data: { id: i }
        });
      }

      await NetworkTestUtils.simulateLatency(100);

      expect(receivedMessages).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

      client2.disconnect();
    });

    it('should handle network latency gracefully', async () => {
      const client2 = new GameNetworkManager();
      await client2.connect(testServer.getUrl());

      const receivedMessages: any[] = [];
      client2.on('latency-test', (msg: any) => {
        msg.receivedAt = Date.now();
        receivedMessages.push(msg);
      });

      const sentAt = Date.now();
      networkManager.send({
        type: 'latency-test',
        data: { sentAt }
      });

      await NetworkTestUtils.simulateLatency(150);

      expect(receivedMessages).toHaveLength(1);
      const latency = receivedMessages[0].receivedAt - sentAt;
      expect(latency).toBeGreaterThan(0);
      expect(latency).toBeLessThan(300); // Should be reasonable

      client2.disconnect();
    });
  });
});