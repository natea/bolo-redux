import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { GameManager } from './game/GameManager.js';
import { PlayerManager } from './players/PlayerManager.js';
import { logger } from './utils/logger.js';
import { validatePlayerData, validateGameAction } from './validation/validators.js';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Socket.IO server setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Initialize game and player managers
const gameManager = new GameManager();
const playerManager = new PlayerManager();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    games: gameManager.getActiveGameCount(),
    players: playerManager.getActivePlayerCount()
  });
});

// Game stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    games: gameManager.getGameStats(),
    players: playerManager.getPlayerStats()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Player connected: ${socket.id}`);

  // Player authentication and registration
  socket.on('player:join', async (data) => {
    try {
      const validatedData = validatePlayerData(data);
      const player = await playerManager.createPlayer(socket.id, validatedData);

      socket.emit('player:joined', {
        playerId: player.id,
        playerName: player.name,
        availableRooms: gameManager.getAvailableRooms()
      });

      logger.info(`Player ${player.name} (${player.id}) joined`);
    } catch (error) {
      logger.error(`Player join error: ${error.message}`);
      socket.emit('error', { message: 'Failed to join game', error: error.message });
    }
  });

  // Room/Lobby management
  socket.on('room:create', async (data) => {
    try {
      const player = playerManager.getPlayer(socket.id);
      if (!player) {
        throw new Error('Player not found');
      }

      const room = await gameManager.createRoom(player, data);
      socket.join(room.id);

      socket.emit('room:created', {
        roomId: room.id,
        roomName: room.name,
        maxPlayers: room.maxPlayers
      });

      // Broadcast to all clients about new room
      socket.broadcast.emit('room:available', {
        roomId: room.id,
        roomName: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers
      });

      logger.info(`Room ${room.name} created by ${player.name}`);
    } catch (error) {
      logger.error(`Room creation error: ${error.message}`);
      socket.emit('error', { message: 'Failed to create room', error: error.message });
    }
  });

  socket.on('room:join', async (data) => {
    try {
      const player = playerManager.getPlayer(socket.id);
      if (!player) {
        throw new Error('Player not found');
      }

      const room = await gameManager.joinRoom(player, data.roomId);
      socket.join(room.id);

      // Notify player
      socket.emit('room:joined', {
        roomId: room.id,
        roomName: room.name,
        players: room.players.map(p => ({ id: p.id, name: p.name }))
      });

      // Notify other players in room
      socket.to(room.id).emit('player:joined_room', {
        playerId: player.id,
        playerName: player.name
      });

      logger.info(`Player ${player.name} joined room ${room.name}`);
    } catch (error) {
      logger.error(`Room join error: ${error.message}`);
      socket.emit('error', { message: 'Failed to join room', error: error.message });
    }
  });

  // Game state management
  socket.on('game:start', async (data) => {
    try {
      const player = playerManager.getPlayer(socket.id);
      const room = gameManager.getRoomByPlayer(player);

      if (!room || room.hostId !== player.id) {
        throw new Error('Only room host can start the game');
      }

      const game = await gameManager.startGame(room.id);

      // Notify all players in room
      io.to(room.id).emit('game:started', {
        gameId: game.id,
        gameState: game.getInitialState(),
        tanks: game.tanks,
        terrain: game.terrain
      });

      logger.info(`Game started in room ${room.name}`);
    } catch (error) {
      logger.error(`Game start error: ${error.message}`);
      socket.emit('error', { message: 'Failed to start game', error: error.message });
    }
  });

  // Tank movement and actions
  socket.on('tank:move', async (data) => {
    try {
      const validatedAction = validateGameAction(data);
      const player = playerManager.getPlayer(socket.id);
      const game = gameManager.getGameByPlayer(player);

      if (!game) {
        throw new Error('Player not in active game');
      }

      const result = await game.handleTankMovement(player.id, validatedAction);

      if (result.success) {
        // Broadcast updated position to all players
        io.to(game.roomId).emit('tank:moved', {
          playerId: player.id,
          position: result.position,
          rotation: result.rotation,
          velocity: result.velocity,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error(`Tank movement error: ${error.message}`);
      socket.emit('error', { message: 'Invalid movement', error: error.message });
    }
  });

  socket.on('tank:shoot', async (data) => {
    try {
      const validatedAction = validateGameAction(data);
      const player = playerManager.getPlayer(socket.id);
      const game = gameManager.getGameByPlayer(player);

      if (!game) {
        throw new Error('Player not in active game');
      }

      const result = await game.handleTankShoot(player.id, validatedAction);

      if (result.success) {
        // Broadcast new bullet to all players
        io.to(game.roomId).emit('bullet:created', {
          bulletId: result.bullet.id,
          position: result.bullet.position,
          velocity: result.bullet.velocity,
          playerId: player.id,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error(`Tank shoot error: ${error.message}`);
      socket.emit('error', { message: 'Failed to shoot', error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const player = playerManager.getPlayer(socket.id);
      if (player) {
        const room = gameManager.getRoomByPlayer(player);
        if (room) {
          gameManager.removePlayerFromRoom(player, room.id);
          socket.to(room.id).emit('player:left_room', {
            playerId: player.id,
            playerName: player.name
          });
        }

        playerManager.removePlayer(socket.id);
        logger.info(`Player ${player.name} disconnected`);
      }
    } catch (error) {
      logger.error(`Disconnect error: ${error.message}`);
    }
  });
});

// Game loop for physics updates
setInterval(() => {
  gameManager.updateAllGames((gameUpdate) => {
    io.to(gameUpdate.roomId).emit('game:update', {
      bullets: gameUpdate.bullets,
      collisions: gameUpdate.collisions,
      destroyed: gameUpdate.destroyed,
      timestamp: Date.now()
    });
  });
}, 1000 / 60); // 60 FPS update rate

// Server startup
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  logger.info(`Bolo Tank Server running on ${HOST}:${PORT}`);
  logger.info(`Health check available at http://${HOST === '0.0.0.0' ? '<your-server-ip>' : HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, server, io };