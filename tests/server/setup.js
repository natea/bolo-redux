// Test setup and global configurations
import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for tests
process.env.LOG_LEVEL = 'error'; // Minimize logging in tests

// Global test utilities
global.createMockPlayer = (overrides = {}) => ({
  id: 'test-player-id',
  socketId: 'test-socket-id',
  name: 'TestPlayer',
  avatar: 'default',
  color: '#FF0000',
  isConnected: () => true,
  isAlive: () => true,
  ...overrides
});

global.createMockRoom = (overrides = {}) => ({
  id: 'test-room-id',
  name: 'Test Room',
  hostId: 'test-host-id',
  maxPlayers: 8,
  players: [],
  status: 'waiting',
  gameMode: 'classic',
  mapName: 'default',
  ...overrides
});

global.createMockGame = (overrides = {}) => ({
  id: 'test-game-id',
  roomId: 'test-room-id',
  status: 'active',
  tanks: new Map(),
  bullets: new Map(),
  settings: {
    mapWidth: 2000,
    mapHeight: 1500,
    gravity: 0.5,
    maxBullets: 50
  },
  ...overrides
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});