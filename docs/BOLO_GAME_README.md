# 🎮 Bolo Tank Game - Multiplayer Battle Arena

A modern HTML5 recreation of the classic Bolo tank game, built with a distributed swarm of AI agents using Claude-Flow orchestration.

## 🚀 Features

### Core Gameplay
- **Real-time Multiplayer**: WebSocket-based networking with low latency
- **Physics Engine**: Realistic tank movement, collision detection, and ballistics
- **Terrain System**: Procedurally generated maps with destructible elements
- **Combat Mechanics**: Multiple weapon types, damage system, and explosions
- **Power-ups**: Speed boosts, shields, rapid fire, and more
- **Game Modes**: Deathmatch, Capture the Flag, King of the Hill

### Technical Highlights
- **60 FPS Performance**: Optimized rendering and physics
- **Responsive Design**: Playable on desktop and mobile devices
- **Modular Architecture**: Clean separation of concerns
- **Comprehensive Testing**: Unit, integration, E2E, and performance tests
- **Security**: Input validation, rate limiting, and sanitization

## 📁 Project Structure

```
bolo-tank-game/
├── src/
│   ├── server/         # Node.js WebSocket server
│   │   ├── server.js   # Main server entry
│   │   ├── game/       # Game logic
│   │   ├── physics/    # Physics engine
│   │   └── terrain/    # Map generation
│   ├── client/         # HTML5 frontend
│   │   ├── index.html  # Game page
│   │   ├── js/         # Game client code
│   │   └── css/        # Styling
│   └── shared/         # Shared game logic
│       ├── physics/    # Core physics
│       ├── entities/   # Tank, bullet entities
│       └── terrain/    # Map generation
├── tests/              # Comprehensive test suite
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   ├── e2e/          # End-to-end tests
│   └── performance/   # Benchmarks
└── docs/              # Documentation
```

## 🎯 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern web browser with HTML5 Canvas support

### Installation

1. **Clone the repository**
```bash
git clone <repository>
cd bolo-tank-game
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Start development servers**
```bash
npm run dev
```

4. **Open the game**
Navigate to `http://localhost:8080` in your browser

### Production Deployment

```bash
npm run build
npm start
```

## 🎮 How to Play

### Controls
- **WASD**: Move tank
- **Mouse**: Aim turret
- **Left Click**: Fire weapon
- **Tab**: Show scoreboard
- **Enter**: Chat
- **ESC**: Menu

### Game Objectives
- **Deathmatch**: Eliminate opponents to reach the score limit
- **Capture the Flag**: Capture enemy flag and return to base
- **King of the Hill**: Control the center point for points

## 🧪 Testing

Run the comprehensive test suite:

```bash
# All tests
npm run test

# Specific test suites
npm run test:unit        # Physics and game logic
npm run test:integration # WebSocket communication
npm run test:e2e         # Complete scenarios
npm run test:performance # Performance benchmarks
```

## 🤖 Development with Claude-Flow

This game was built using Claude-Flow swarm orchestration with specialized agents:

### Swarm Agents Used
- **Coordinator**: Overall architecture and planning
- **Backend Developer**: WebSocket server implementation
- **Frontend Developer**: HTML5 Canvas client
- **Game Mechanics Developer**: Physics and gameplay systems
- **Test Engineer**: Comprehensive test suite

### Memory Coordination
The swarm used shared memory for:
- API contracts between frontend and backend
- Game state synchronization
- Architecture decisions
- Test requirements

## 🛠️ Configuration

### Server Configuration
Edit `src/server/.env`:
```env
PORT=3001
CORS_ORIGIN=http://localhost:8080
MAX_PLAYERS=16
TICK_RATE=60
```

### Client Configuration
Edit `src/client/js/config.js`:
```javascript
const CONFIG = {
  SERVER_URL: 'ws://localhost:3001',
  RENDER_FPS: 60,
  DEBUG_MODE: false
};
```

## 📊 Performance

- **Players**: Supports 2-16 simultaneous players
- **Frame Rate**: Stable 60 FPS with optimization
- **Latency**: <100ms for smooth gameplay
- **Memory**: Efficient object pooling and cleanup
- **Network**: Delta updates minimize bandwidth

## 🔒 Security

- Input validation on all player actions
- Rate limiting to prevent spam
- Sanitization of user-generated content
- Secure WebSocket connections (WSS in production)
- Anti-cheat measures for physics validation

## 🚀 Future Enhancements

- [ ] Additional game modes (Team Deathmatch, Survival)
- [ ] More weapon types and power-ups
- [ ] Custom map editor
- [ ] Player profiles and statistics
- [ ] Replay system
- [ ] AI bot opponents
- [ ] Voice chat integration
- [ ] Tournament mode

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Credits

Built with Claude-Flow swarm orchestration using:
- Node.js & Socket.IO for networking
- HTML5 Canvas for rendering
- TypeScript for type safety
- Vitest & Playwright for testing

Inspired by the original Bolo game by Stuart Cheshire.

---

**Developed by Claude-Flow Swarm** - Demonstrating the power of AI agent orchestration in game development.