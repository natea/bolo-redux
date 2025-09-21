# Bolo Tank Game - WebSocket Server

A real-time multiplayer tank battle game server built with Node.js, Socket.IO, and modern WebSocket technology.

## Features

### Core Functionality
- **Real-time Multiplayer**: WebSocket-based communication for instant game updates
- **Room/Lobby System**: Create and join game rooms with customizable settings
- **Player Management**: Authentication, session management, and player statistics
- **Physics Engine**: Realistic tank movement, bullet trajectories, and collision detection
- **Terrain System**: Destructible terrain with procedural generation
- **Game Modes**: Multiple game modes including classic and last-tank-standing

### Technical Features
- **Scalable Architecture**: Modular design with separated concerns
- **Input Validation**: Comprehensive validation using Joi schemas
- **Rate Limiting**: Protection against spam and abuse
- **Performance Monitoring**: Built-in performance tracking and bottleneck detection
- **Comprehensive Logging**: Winston-based logging with different levels and outputs
- **Error Handling**: Robust error handling with graceful degradation

## Architecture

```
src/server/
├── server.js                 # Main server entry point
├── game/
│   ├── GameManager.js        # Manages all games and rooms
│   ├── Game.js              # Individual game instance logic
│   ├── Room.js              # Room/lobby management
│   ├── entities/
│   │   ├── Tank.js          # Tank entity with movement and combat
│   │   └── Bullet.js        # Bullet entity with physics
│   ├── physics/
│   │   ├── PhysicsEngine.js # Physics calculations and updates
│   │   └── CollisionDetector.js # Collision detection algorithms
│   └── terrain/
│       └── TerrainGenerator.js # Procedural terrain generation
├── players/
│   ├── PlayerManager.js     # Player session management
│   └── Player.js           # Individual player state and statistics
├── validation/
│   └── validators.js       # Input validation schemas and functions
└── utils/
    └── logger.js          # Logging configuration and utilities
```

## WebSocket API

### Client Events

#### Player Management
```javascript
// Join the game
socket.emit('player:join', {
  name: 'PlayerName',
  avatar: 'default',
  color: '#FF0000'
});

// Response
socket.on('player:joined', (data) => {
  console.log(data.playerId, data.availableRooms);
});
```

#### Room Management
```javascript
// Create a room
socket.emit('room:create', {
  name: 'My Room',
  maxPlayers: 8,
  gameMode: 'classic',
  mapName: 'default'
});

// Join a room
socket.emit('room:join', {
  roomId: 'room-uuid'
});

// Start a game (host only)
socket.emit('game:start', {});
```

#### Game Actions
```javascript
// Tank movement
socket.emit('tank:move', {
  type: 'move_left', // move_left, move_right, stop
  timestamp: Date.now()
});

// Turret rotation
socket.emit('tank:move', {
  type: 'rotate_turret',
  delta: 0.1, // Rotation amount
  timestamp: Date.now()
});

// Shooting
socket.emit('tank:shoot', {
  type: 'shoot',
  power: 75, // 10-100
  weaponType: 'standard', // standard, heavy, light
  timestamp: Date.now()
});
```

### Server Events

#### Game State Updates
```javascript
// Game started
socket.on('game:started', (data) => {
  console.log(data.gameState, data.tanks, data.terrain);
});

// Real-time updates (60 FPS)
socket.on('game:update', (data) => {
  console.log(data.bullets, data.collisions, data.destroyed);
});

// Tank movements
socket.on('tank:moved', (data) => {
  console.log(data.playerId, data.position, data.rotation);
});

// Bullet creation
socket.on('bullet:created', (data) => {
  console.log(data.bulletId, data.position, data.velocity);
});
```

#### Room Updates
```javascript
// Player joined room
socket.on('player:joined_room', (data) => {
  console.log(data.playerId, data.playerName);
});

// New room available
socket.on('room:available', (data) => {
  console.log(data.roomId, data.roomName, data.playerCount);
});
```

## Game Mechanics

### Tank System
- **Movement**: Horizontal movement with physics-based acceleration and friction
- **Rotation**: Tank body and turret can rotate independently
- **Health**: 100 HP with damage calculation based on weapon type and impact
- **Respawn**: Automatic respawn after 5 seconds with invulnerability period

### Physics Engine
- **Gravity**: Affects both tanks and bullets
- **Collision Detection**: AABB and precise collision detection
- **Terrain Interaction**: Tanks conform to terrain slopes, bullets create craters
- **Ballistics**: Realistic bullet trajectories with air resistance

### Weapon Types
- **Standard**: Balanced damage and explosion radius
- **Heavy**: High damage, large explosion, slow reload
- **Light**: Low damage, small explosion, fast reload

### Terrain System
- **Procedural Generation**: Multiple map types (plains, mountains, canyon)
- **Destructible**: Explosions create permanent craters
- **Collision**: Pixel-perfect collision detection with terrain

## Configuration

### Environment Variables
```bash
PORT=3001                    # Server port
LOG_LEVEL=info              # Logging level (error, warn, info, debug)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173  # CORS origins
```

### Game Settings
```javascript
const settings = {
  mapWidth: 2000,           // Map width in pixels
  mapHeight: 1500,          // Map height in pixels
  gravity: 0.5,             // Gravity strength
  maxBullets: 50,           // Maximum bullets per game
  respawnTime: 5000         // Respawn delay in milliseconds
};
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   cd src/server
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status, uptime, and active game statistics.

### Game Statistics
```
GET /api/stats
```
Returns detailed statistics about games and players.

## Performance Features

### Rate Limiting
- **Movement**: 30 actions per second per player
- **Shooting**: 1 shot per second per player
- **Chat**: 10 messages per minute per player

### Optimizations
- **Game Loop**: 60 FPS physics updates with delta time
- **Collision Detection**: Spatial partitioning for large games
- **Memory Management**: Automatic cleanup of disconnected players and finished games
- **Message Batching**: Efficient WebSocket message handling

## Security Features

- **Input Validation**: All client inputs validated with Joi schemas
- **Rate Limiting**: Protection against spam and DOS attacks
- **CORS Configuration**: Configurable allowed origins
- **Sanitization**: Input sanitization to prevent XSS
- **Error Handling**: Secure error messages that don't leak system information

## Monitoring & Logging

### Log Levels
- **Error**: Critical errors and exceptions
- **Warn**: Performance issues and security events
- **Info**: Game events and player activities
- **Debug**: Detailed technical information

### Performance Monitoring
- **Operation Timing**: Automatic timing of critical operations
- **Memory Usage**: Tracking of memory consumption
- **Connection Count**: Active connection monitoring
- **Game Statistics**: Real-time game performance metrics

## Testing

The server includes comprehensive test coverage:
- **Unit Tests**: Individual component testing
- **Integration Tests**: WebSocket communication testing
- **Performance Tests**: Load testing and benchmarking
- **Security Tests**: Input validation and rate limiting

Run tests with:
```bash
npm test
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Deployment

### Production Checklist
- [ ] Set appropriate LOG_LEVEL (warn or error)
- [ ] Configure CORS origins for production domains
- [ ] Set up SSL/TLS termination
- [ ] Configure load balancing for multiple instances
- [ ] Set up log aggregation
- [ ] Configure monitoring and alerting

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Follow the existing code style and architecture patterns
2. Add tests for new features
3. Update documentation for API changes
4. Use semantic commit messages
5. Ensure all tests pass before submitting

## License

This project is part of the Bolo Tank Game implementation.