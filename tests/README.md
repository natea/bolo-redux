# Bolo Game Comprehensive Test Suite

## Overview

This comprehensive test suite provides complete coverage for the Bolo multiplayer game, following Test-Driven Development (TDD) principles and the SPARC methodology. The test suite ensures game functionality, performance, and reliability across all components.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   └── physics.test.ts   # Physics and collision detection tests
├── integration/          # Integration tests for system interactions
│   └── websocket.test.ts # WebSocket communication tests
├── e2e/                  # End-to-end tests for complete scenarios
│   ├── frontend-rendering.spec.ts        # Frontend rendering and UI tests
│   ├── multiplayer-sync.spec.ts          # Multiplayer synchronization tests
│   └── full-multiplayer-scenarios.spec.ts # Complete game scenarios
├── performance/          # Performance benchmarks and stress tests
│   └── game-engine.bench.ts # Game engine performance tests
├── utils/               # Test utilities and helpers
│   ├── setup.ts         # Test environment setup
│   └── test-helpers.ts  # Utility functions and mock classes
├── vitest.config.ts     # Vitest configuration
└── package.json         # Test dependencies and scripts
```

## Test Categories

### 1. Unit Tests (`/tests/unit/`)

**Physics Engine Tests** (`physics.test.ts`)
- Collision detection algorithms
- Position and velocity calculations
- Projectile trajectory computations
- Boundary collision handling
- Physics performance benchmarks

**Coverage:**
- Collision detection between objects
- Movement calculations with friction and gravity
- Projectile physics and trajectories
- Boundary enforcement
- Performance under load (100+ objects)

### 2. Integration Tests (`/tests/integration/`)

**WebSocket Communication Tests** (`websocket.test.ts`)
- Real-time message passing
- Connection management
- Multi-client scenarios
- Network error handling
- State synchronization

**Coverage:**
- WebSocket connection lifecycle
- Message serialization/deserialization
- Multi-client message broadcasting
- Connection failure recovery
- Network latency simulation

### 3. End-to-End Tests (`/tests/e2e/`)

**Frontend Rendering Tests** (`frontend-rendering.spec.ts`)
- Canvas rendering validation
- UI component interactions
- Input handling (keyboard/mouse)
- Visual regression testing
- Performance monitoring

**Multiplayer Synchronization Tests** (`multiplayer-sync.spec.ts`)
- Real-time player state sync
- Multiplayer game scenarios
- Network disconnection handling
- State consistency validation

**Complete Game Scenarios** (`full-multiplayer-scenarios.spec.ts`)
- Full gameplay flows
- Combat scenarios
- Player elimination/respawn
- Leaderboard management
- Advanced multiplayer features

### 4. Performance Tests (`/tests/performance/`)

**Game Engine Benchmarks** (`game-engine.bench.ts`)
- Frame rate maintenance (60 FPS target)
- Memory usage optimization
- Collision detection efficiency
- Network simulation performance
- Stress testing with multiple players

## Test Utilities

### TestWebSocketServer
Mock WebSocket server for integration testing:
```typescript
const server = new TestWebSocketServer(8080);
await server.start();
// Use server.getUrl() for client connections
await server.stop();
```

### PhysicsTestUtils
Physics simulation helpers:
```typescript
const scenario = PhysicsTestUtils.createCollisionScenario();
const isColliding = PhysicsTestUtils.isColliding(obj1, obj2);
```

### PerformanceTestUtils
Performance measurement utilities:
```typescript
PerformanceTestUtils.startMeasurement('test-name');
// ... perform operations
const duration = PerformanceTestUtils.endMeasurement('test-name');
```

### NetworkTestUtils
Network simulation helpers:
```typescript
await NetworkTestUtils.simulateLatency(100); // 100ms delay
const clients = await NetworkTestUtils.createTestClients(5, serverUrl);
```

## Running Tests

### Prerequisites
```bash
cd tests
npm install
npx playwright install  # For e2e tests
```

### Individual Test Types
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance benchmarks
npm run test:performance

# All tests
npm run test:all
```

### Development Workflows
```bash
# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# UI test runner
npm run test:ui

# Playwright debugging
npm run playwright:debug
```

## Performance Requirements

### Frame Rate Targets
- **Normal gameplay**: 60 FPS (4-8 players)
- **Stress scenarios**: >30 FPS (16+ players)
- **Frame time**: <16.67ms average, <25ms maximum

### Network Performance
- **Latency tolerance**: Up to 200ms
- **Message throughput**: 100+ messages/second
- **Synchronization**: <100ms state consistency

### Memory Usage
- **Baseline**: <50MB increase during stress tests
- **Leak detection**: No memory growth over time
- **Object lifecycle**: Efficient creation/destruction

## Test Coverage Requirements

### Code Coverage
- **Unit tests**: >90% line coverage
- **Integration tests**: All network paths covered
- **E2E tests**: Core user journeys validated

### Scenario Coverage
- **Single player**: Basic functionality
- **Multiplayer**: 2-8 players typical scenarios
- **Stress testing**: Up to 16 players
- **Edge cases**: Network failures, rapid actions

## Continuous Integration

The test suite is designed for CI/CD pipelines:

```yaml
# Example CI configuration
test:
  runs-on: ubuntu-latest
  steps:
    - name: Install dependencies
      run: cd tests && npm install
    - name: Run unit tests
      run: cd tests && npm run test:unit
    - name: Run integration tests
      run: cd tests && npm run test:integration
    - name: Run e2e tests
      run: cd tests && npm run test:e2e
    - name: Performance benchmarks
      run: cd tests && npm run test:performance
```

## Development Guidelines

### Test-Driven Development
1. **Red**: Write failing test first
2. **Green**: Implement minimal code to pass
3. **Refactor**: Clean up while keeping tests green

### Test Organization
- One test file per component/feature
- Group related tests with `describe` blocks
- Use descriptive test names
- Include both positive and negative test cases

### Performance Testing
- Establish baseline performance metrics
- Test under realistic load conditions
- Monitor for performance regressions
- Include stress testing scenarios

### Mocking Strategy
- Mock external dependencies (WebSocket, Canvas API)
- Use real implementations for integration tests
- Provide test data factories
- Simulate realistic network conditions

## Debugging Tests

### Common Issues
1. **Timing issues**: Use proper waits instead of fixed delays
2. **Network flakiness**: Implement retry mechanisms
3. **Canvas testing**: Mock canvas operations properly
4. **State synchronization**: Account for network latency

### Debug Tools
```bash
# Playwright debugging
npm run playwright:debug

# Visual test runner
npm run playwright:ui

# Coverage visualization
npm run coverage:serve
```

## Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Include both unit and integration test coverage
3. Add performance tests for new features
4. Update this documentation for new test categories
5. Ensure tests pass in CI environment

## Test Data

The test suite includes realistic game scenarios:
- Various player counts (1-16)
- Different network conditions
- Stress testing scenarios
- Edge cases and error conditions

All test data is generated programmatically to ensure consistency and reduce maintenance overhead.

## Monitoring and Reporting

### Test Reports
- Coverage reports in HTML format
- Performance benchmark results
- Visual regression test artifacts
- CI/CD integration status

### Metrics Tracking
- Test execution time trends
- Performance benchmark history
- Code coverage evolution
- Flaky test identification

This comprehensive test suite ensures the Bolo game maintains high quality, performance, and reliability across all multiplayer scenarios.