import { vi } from 'vitest';

// Mock WebSocket for testing
global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock Canvas API for rendering tests
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn()
  })),
  width: 800,
  height: 600,
  toDataURL: vi.fn(() => 'data:image/png;base64,test')
};

global.HTMLCanvasElement = vi.fn(() => mockCanvas);

// Mock performance API for benchmarking
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => [])
};

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
});

// Global test utilities
export const createMockGameState = () => ({
  players: new Map(),
  projectiles: [],
  timestamp: Date.now(),
  gameId: 'test-game',
  status: 'active'
});

export const createMockPlayer = (id: string) => ({
  id,
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  health: 100,
  score: 0,
  lastUpdate: Date.now()
});

export const createMockProjectile = () => ({
  id: 'proj-1',
  position: { x: 150, y: 150 },
  velocity: { x: 5, y: 0 },
  damage: 10,
  ownerId: 'player-1',
  timestamp: Date.now()
});