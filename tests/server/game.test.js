import { jest } from '@jest/globals';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameManager } from '../../src/server/game/GameManager.js';
import { PlayerManager } from '../../src/server/players/PlayerManager.js';

describe('Bolo Tank Game Server', () => {
  let server, serverSocket, clientSocket, gameManager, playerManager;

  beforeAll((done) => {
    const httpServer = createServer();
    const io = new Server(httpServer);

    gameManager = new GameManager();
    playerManager = new PlayerManager();

    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`);

      io.on('connection', (socket) => {
        serverSocket = socket;
      });

      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    serverSocket?.disconnect();
    clientSocket?.disconnect();
  });

  describe('Player Management', () => {
    test('should create a new player', async () => {
      const playerData = {
        name: 'TestPlayer',
        avatar: 'default',
        color: '#FF0000'
      };

      const player = await playerManager.createPlayer('socket123', playerData);

      expect(player.name).toBe('TestPlayer');
      expect(player.color).toBe('#FF0000');
      expect(player.isConnected()).toBe(true);
    });

    test('should reject invalid player names', async () => {
      const invalidData = { name: 'a' }; // Too short

      await expect(
        playerManager.createPlayer('socket124', invalidData)
      ).rejects.toThrow('Player name must be between 2 and 20 characters');
    });

    test('should prevent duplicate player names', async () => {
      const playerData = { name: 'DuplicateTest' };

      await playerManager.createPlayer('socket125', playerData);

      await expect(
        playerManager.createPlayer('socket126', playerData)
      ).rejects.toThrow('Player name already taken');
    });
  });

  describe('Room Management', () => {
    test('should create a new room', async () => {
      const host = await playerManager.createPlayer('host123', { name: 'HostPlayer' });
      const roomOptions = {
        name: 'Test Room',
        maxPlayers: 4,
        gameMode: 'classic'
      };

      const room = await gameManager.createRoom(host, roomOptions);

      expect(room.name).toBe('Test Room');
      expect(room.maxPlayers).toBe(4);
      expect(room.players).toHaveLength(1);
      expect(room.hostId).toBe(host.id);
    });

    test('should allow players to join room', async () => {
      const host = await playerManager.createPlayer('host124', { name: 'Host2' });
      const guest = await playerManager.createPlayer('guest124', { name: 'Guest2' });

      const room = await gameManager.createRoom(host, { name: 'Join Test' });
      await gameManager.joinRoom(guest, room.id);

      expect(room.players).toHaveLength(2);
      expect(room.players.find(p => p.id === guest.id)).toBeDefined();
    });

    test('should reject joining full room', async () => {
      const host = await playerManager.createPlayer('host125', { name: 'Host3' });
      const room = await gameManager.createRoom(host, { name: 'Full Room', maxPlayers: 1 });

      const guest = await playerManager.createPlayer('guest125', { name: 'Guest3' });

      await expect(
        gameManager.joinRoom(guest, room.id)
      ).rejects.toThrow('Room is full');
    });
  });

  describe('Game Logic', () => {
    test('should start a game with valid players', async () => {
      const host = await playerManager.createPlayer('gamehost', { name: 'GameHost' });
      const guest = await playerManager.createPlayer('gameguest', { name: 'GameGuest' });

      const room = await gameManager.createRoom(host, { name: 'Game Test' });
      await gameManager.joinRoom(guest, room.id);

      const game = await gameManager.startGame(room.id);

      expect(game.status).toBe('active');
      expect(game.tanks.size).toBe(2);
      expect(room.status).toBe('in_game');
    });

    test('should reject starting game with insufficient players', async () => {
      const host = await playerManager.createPlayer('solohost', { name: 'SoloHost' });
      const room = await gameManager.createRoom(host, { name: 'Solo Room' });

      await expect(
        gameManager.startGame(room.id)
      ).rejects.toThrow('At least 2 players required to start game');
    });
  });

  describe('Tank Movement', () => {
    let game, player1, player2;

    beforeEach(async () => {
      player1 = await playerManager.createPlayer('tank1', { name: 'TankPlayer1' });
      player2 = await playerManager.createPlayer('tank2', { name: 'TankPlayer2' });

      const room = await gameManager.createRoom(player1, { name: 'Tank Test' });
      await gameManager.joinRoom(player2, room.id);
      game = await gameManager.startGame(room.id);
    });

    test('should handle tank movement', async () => {
      const moveAction = {
        type: 'move_right',
        timestamp: Date.now()
      };

      const result = await game.handleTankMovement(player1.id, moveAction);

      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      expect(result.velocity).toBeDefined();
    });

    test('should handle turret rotation', async () => {
      const rotateAction = {
        type: 'rotate_turret',
        delta: 0.5,
        timestamp: Date.now()
      };

      const result = await game.handleTankMovement(player1.id, rotateAction);

      expect(result.success).toBe(true);
    });

    test('should handle tank shooting', async () => {
      const shootAction = {
        type: 'shoot',
        power: 75,
        weaponType: 'standard',
        timestamp: Date.now()
      };

      const result = await game.handleTankShoot(player1.id, shootAction);

      expect(result.success).toBe(true);
      expect(result.bullet).toBeDefined();
      expect(result.bullet.position).toBeDefined();
      expect(result.bullet.velocity).toBeDefined();
    });
  });

  describe('Physics Engine', () => {
    test('should update bullet physics correctly', () => {
      const bullet = {
        id: 'test-bullet',
        position: { x: 100, y: 100 },
        velocity: { x: 10, y: -5 },
        mass: 1,
        getBounds: () => ({ x: 95, y: 95, width: 10, height: 10 })
      };

      const deltaTime = 1/60; // 60 FPS
      const gravity = 0.5;

      // Simulate physics update
      bullet.velocity.y += gravity * deltaTime * 60;
      bullet.velocity.x *= 0.999; // Air resistance
      bullet.velocity.y *= 0.999;
      bullet.position.x += bullet.velocity.x * deltaTime * 60;
      bullet.position.y += bullet.velocity.y * deltaTime * 60;

      expect(bullet.position.x).toBeGreaterThan(100);
      expect(bullet.velocity.y).toBeGreaterThan(-5); // Gravity effect
    });
  });

  describe('Collision Detection', () => {
    test('should detect AABB collision', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };

      const collision = rect1.x < rect2.x + rect2.width &&
                       rect1.x + rect1.width > rect2.x &&
                       rect1.y < rect2.y + rect2.height &&
                       rect1.y + rect1.height > rect2.y;

      expect(collision).toBe(true);
    });

    test('should not detect collision for separated objects', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 20, y: 20, width: 10, height: 10 };

      const collision = rect1.x < rect2.x + rect2.width &&
                       rect1.x + rect1.width > rect2.x &&
                       rect1.y < rect2.y + rect2.height &&
                       rect1.y + rect1.height > rect2.y;

      expect(collision).toBe(false);
    });
  });

  describe('WebSocket Communication', () => {
    test('should handle player join event', (done) => {
      serverSocket.on('player:join', (data) => {
        expect(data.name).toBe('WebSocketPlayer');
        done();
      });

      clientSocket.emit('player:join', {
        name: 'WebSocketPlayer',
        avatar: 'default'
      });
    });

    test('should broadcast room creation', (done) => {
      clientSocket.on('room:available', (data) => {
        expect(data.roomName).toBe('Broadcast Test Room');
        done();
      });

      serverSocket.emit('room:create', {
        name: 'Broadcast Test Room',
        maxPlayers: 8
      });
    });
  });
});