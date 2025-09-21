import { v4 as uuidv4 } from 'uuid';
import { Game } from './Game.js';
import { Room } from './Room.js';
import { logger } from '../utils/logger.js';

export class GameManager {
  constructor() {
    this.rooms = new Map();
    this.games = new Map();
    this.playerToRoom = new Map();
    this.playerToGame = new Map();
  }

  /**
   * Create a new game room
   */
  async createRoom(host, options = {}) {
    const roomId = uuidv4();
    const room = new Room({
      id: roomId,
      name: options.name || `${host.name}'s Room`,
      hostId: host.id,
      maxPlayers: options.maxPlayers || 8,
      gameMode: options.gameMode || 'classic',
      mapName: options.mapName || 'default'
    });

    room.addPlayer(host);
    this.rooms.set(roomId, room);
    this.playerToRoom.set(host.id, roomId);

    logger.info(`Room created: ${room.name} (${roomId}) by ${host.name}`);
    return room;
  }

  /**
   * Join an existing room
   */
  async joinRoom(player, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.status === 'in_game') {
      throw new Error('Game already in progress');
    }

    room.addPlayer(player);
    this.playerToRoom.set(player.id, roomId);

    logger.info(`Player ${player.name} joined room ${room.name}`);
    return room;
  }

  /**
   * Start a game in the specified room
   */
  async startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length < 2) {
      throw new Error('At least 2 players required to start game');
    }

    const gameId = uuidv4();
    const game = new Game({
      id: gameId,
      roomId: roomId,
      players: room.players,
      gameMode: room.gameMode,
      mapName: room.mapName
    });

    // Update room status
    room.status = 'in_game';
    room.gameId = gameId;

    // Store game and player mappings
    this.games.set(gameId, game);
    room.players.forEach(player => {
      this.playerToGame.set(player.id, gameId);
    });

    await game.initialize();
    logger.info(`Game started: ${gameId} in room ${room.name}`);
    return game;
  }

  /**
   * Remove player from room
   */
  removePlayerFromRoom(player, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.removePlayer(player);
    this.playerToRoom.delete(player.id);

    // If room is empty, clean it up
    if (room.players.length === 0) {
      this.rooms.delete(roomId);

      // Clean up associated game if exists
      if (room.gameId) {
        const game = this.games.get(room.gameId);
        if (game) {
          game.endGame();
          this.games.delete(room.gameId);
        }
      }

      logger.info(`Room ${room.name} deleted (empty)`);
    } else if (room.hostId === player.id) {
      // Transfer host to another player
      room.hostId = room.players[0].id;
      logger.info(`Host transferred to ${room.players[0].name} in room ${room.name}`);
    }
  }

  /**
   * Get room by player
   */
  getRoomByPlayer(player) {
    const roomId = this.playerToRoom.get(player.id);
    return roomId ? this.rooms.get(roomId) : null;
  }

  /**
   * Get game by player
   */
  getGameByPlayer(player) {
    const gameId = this.playerToGame.get(player.id);
    return gameId ? this.games.get(gameId) : null;
  }

  /**
   * Get available rooms for joining
   */
  getAvailableRooms() {
    const availableRooms = [];

    for (const room of this.rooms.values()) {
      if (room.status === 'waiting' && room.players.length < room.maxPlayers) {
        availableRooms.push({
          id: room.id,
          name: room.name,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          gameMode: room.gameMode,
          mapName: room.mapName
        });
      }
    }

    return availableRooms;
  }

  /**
   * Update all active games (called by game loop)
   */
  updateAllGames(updateCallback) {
    for (const game of this.games.values()) {
      if (game.status === 'active') {
        const updates = game.update();
        if (updates && updates.length > 0) {
          updateCallback({
            roomId: game.roomId,
            bullets: updates.bullets,
            collisions: updates.collisions,
            destroyed: updates.destroyed
          });
        }
      }
    }
  }

  /**
   * Get statistics
   */
  getActiveGameCount() {
    return Array.from(this.games.values()).filter(game => game.status === 'active').length;
  }

  getGameStats() {
    return {
      totalRooms: this.rooms.size,
      activeGames: this.getActiveGameCount(),
      totalGames: this.games.size
    };
  }
}