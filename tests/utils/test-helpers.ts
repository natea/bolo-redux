import { WebSocket } from 'ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Test server utilities
export class TestWebSocketServer {
  private server: any;
  private wss: WebSocketServer;
  private port: number;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number = 8080) {
    this.port = port;
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('message', (data) => {
        // Broadcast to all other clients
        this.broadcast(data, ws);
      });
    });
  }

  broadcast(data: any, exclude?: WebSocket) {
    this.clients.forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, resolve);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.clients.forEach(client => client.close());
      this.wss.close(() => {
        this.server.close(resolve);
      });
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getUrl(): string {
    return `ws://localhost:${this.port}`;
  }
}

// Physics test utilities
export class PhysicsTestUtils {
  static createCollisionScenario() {
    return {
      object1: {
        position: { x: 100, y: 100 },
        velocity: { x: 5, y: 0 },
        radius: 10,
        mass: 1
      },
      object2: {
        position: { x: 120, y: 100 },
        velocity: { x: -3, y: 0 },
        radius: 10,
        mass: 1
      }
    };
  }

  static isColliding(obj1: any, obj2: any): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (obj1.radius + obj2.radius);
  }

  static calculateDistance(pos1: any, pos2: any): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Performance measurement utilities
export class PerformanceTestUtils {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(name: string): void {
    performance.mark(`${name}-start`);
  }

  static endMeasurement(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration || 0;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    return duration;
  }

  static getAverageDuration(name: string): number {
    const durations = this.measurements.get(name) || [];
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  static reset(): void {
    this.measurements.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Network testing utilities
export class NetworkTestUtils {
  static createMockMessage(type: string, data: any) {
    return JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  static parseMessage(message: string) {
    try {
      return JSON.parse(message);
    } catch (error) {
      throw new Error(`Invalid message format: ${message}`);
    }
  }

  static simulateLatency(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static createTestClients(count: number, serverUrl: string): Promise<WebSocket[]> {
    const clients: WebSocket[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i < count; i++) {
      const client = new WebSocket(serverUrl);
      clients.push(client);

      promises.push(new Promise((resolve, reject) => {
        client.once('open', () => resolve());
        client.once('error', reject);
      }));
    }

    return Promise.all(promises).then(() => clients);
  }
}

// Game state utilities
export class GameStateTestUtils {
  static createGameWorld(playerCount: number = 2) {
    const players = new Map();

    for (let i = 0; i < playerCount; i++) {
      players.set(`player-${i}`, {
        id: `player-${i}`,
        position: { x: 100 + i * 50, y: 100 + i * 50 },
        velocity: { x: 0, y: 0 },
        health: 100,
        score: 0,
        lastUpdate: Date.now()
      });
    }

    return {
      id: 'test-game',
      players,
      projectiles: [],
      powerups: [],
      boundaries: { x: 0, y: 0, width: 800, height: 600 },
      timestamp: Date.now(),
      status: 'active'
    };
  }

  static simulatePlayerMovement(player: any, deltaTime: number) {
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;
    player.lastUpdate = Date.now();
  }

  static validateGameState(state: any): boolean {
    if (!state.id || !state.players || !state.timestamp) {
      return false;
    }

    // Validate all players have required properties
    for (const player of state.players.values()) {
      if (!player.id || typeof player.position?.x !== 'number' || typeof player.position?.y !== 'number') {
        return false;
      }
    }

    return true;
  }
}