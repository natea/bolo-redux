import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player.js';
import { logger } from '../utils/logger.js';

export class PlayerManager {
  constructor() {
    this.players = new Map(); // socketId -> Player
    this.playersByName = new Map(); // name -> Player
    this.playersById = new Map(); // playerId -> Player
    this.sessionStats = {
      totalConnections: 0,
      activeConnections: 0,
      peakConnections: 0
    };
  }

  /**
   * Create a new player
   */
  async createPlayer(socketId, playerData) {
    // Validate player name
    if (!playerData.name || playerData.name.trim().length === 0) {
      throw new Error('Player name is required');
    }

    const name = playerData.name.trim();

    // Check name length
    if (name.length < 2 || name.length > 20) {
      throw new Error('Player name must be between 2 and 20 characters');
    }

    // Check for profanity or inappropriate names
    if (this.isInappropriateName(name)) {
      throw new Error('Inappropriate player name');
    }

    // Check if name is already taken
    if (this.playersByName.has(name.toLowerCase())) {
      throw new Error('Player name already taken');
    }

    // Remove existing player if reconnecting
    if (this.players.has(socketId)) {
      this.removePlayer(socketId);
    }

    // Create new player
    const playerId = uuidv4();
    const player = new Player({
      id: playerId,
      socketId: socketId,
      name: name,
      avatar: playerData.avatar || 'default',
      color: playerData.color || this.generateRandomColor(),
      joinedAt: new Date()
    });

    // Store player references
    this.players.set(socketId, player);
    this.playersByName.set(name.toLowerCase(), player);
    this.playersById.set(playerId, player);

    // Update statistics
    this.sessionStats.totalConnections++;
    this.sessionStats.activeConnections++;
    this.sessionStats.peakConnections = Math.max(
      this.sessionStats.peakConnections,
      this.sessionStats.activeConnections
    );

    logger.info(`Player created: ${name} (${playerId}) from socket ${socketId}`);
    return player;
  }

  /**
   * Get player by socket ID
   */
  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  /**
   * Get player by player ID
   */
  getPlayerById(playerId) {
    return this.playersById.get(playerId);
  }

  /**
   * Get player by name
   */
  getPlayerByName(name) {
    return this.playersByName.get(name.toLowerCase());
  }

  /**
   * Remove player
   */
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) return;

    // Update player status
    player.disconnect();

    // Remove from all maps
    this.players.delete(socketId);
    this.playersByName.delete(player.name.toLowerCase());
    this.playersById.delete(player.id);

    // Update statistics
    this.sessionStats.activeConnections--;

    logger.info(`Player removed: ${player.name} (${player.id})`);
  }

  /**
   * Update player activity
   */
  updatePlayerActivity(socketId, activity) {
    const player = this.getPlayer(socketId);
    if (player) {
      player.updateActivity(activity);
    }
  }

  /**
   * Get all active players
   */
  getActivePlayers() {
    return Array.from(this.players.values()).filter(player => player.isConnected());
  }

  /**
   * Get player count
   */
  getActivePlayerCount() {
    return this.sessionStats.activeConnections;
  }

  /**
   * Get player statistics
   */
  getPlayerStats() {
    return {
      ...this.sessionStats,
      players: Array.from(this.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        connected: player.isConnected(),
        joinedAt: player.joinedAt,
        lastActivity: player.lastActivity,
        stats: player.getStats()
      }))
    };
  }

  /**
   * Validate player name for inappropriate content
   */
  isInappropriateName(name) {
    const inappropriateWords = [
      'admin', 'moderator', 'bot', 'system', 'server',
      // Add more inappropriate words as needed
    ];

    const lowerName = name.toLowerCase();
    return inappropriateWords.some(word => lowerName.includes(word));
  }

  /**
   * Generate random player color
   */
  generateRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#AED6F1'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Cleanup inactive players (called periodically)
   */
  cleanupInactivePlayers() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    const playersToRemove = [];

    for (const [socketId, player] of this.players) {
      if (!player.isConnected() && (now - player.lastActivity.getTime()) > inactiveThreshold) {
        playersToRemove.push(socketId);
      }
    }

    playersToRemove.forEach(socketId => {
      this.removePlayer(socketId);
    });

    if (playersToRemove.length > 0) {
      logger.info(`Cleaned up ${playersToRemove.length} inactive players`);
    }
  }

  /**
   * Get leaderboard data
   */
  getLeaderboard(limit = 10) {
    const players = Array.from(this.players.values())
      .filter(player => player.isConnected())
      .sort((a, b) => {
        // Sort by wins, then by games played, then by join time
        const aStats = a.getStats();
        const bStats = b.getStats();

        if (aStats.wins !== bStats.wins) {
          return bStats.wins - aStats.wins;
        }

        if (aStats.gamesPlayed !== bStats.gamesPlayed) {
          return bStats.gamesPlayed - aStats.gamesPlayed;
        }

        return a.joinedAt.getTime() - b.joinedAt.getTime();
      })
      .slice(0, limit);

    return players.map((player, index) => ({
      rank: index + 1,
      name: player.name,
      wins: player.getStats().wins,
      gamesPlayed: player.getStats().gamesPlayed,
      winRate: player.getStats().winRate,
      totalKills: player.getStats().totalKills,
      totalDeaths: player.getStats().totalDeaths
    }));
  }

  /**
   * Search players by name
   */
  searchPlayers(query, limit = 10) {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.players.values())
      .filter(player =>
        player.isConnected() &&
        player.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit)
      .map(player => ({
        id: player.id,
        name: player.name,
        color: player.color,
        avatar: player.avatar,
        stats: player.getStats()
      }));
  }

  /**
   * Broadcast message to all players
   */
  broadcastToAll(message, data) {
    // This would be called from the main server with socket.io instance
    // Included here for completeness of the manager interface
    return {
      playerCount: this.getActivePlayerCount(),
      message,
      data
    };
  }

  /**
   * Get server capacity info
   */
  getCapacityInfo() {
    const maxPlayers = 100; // Configurable server limit

    return {
      current: this.sessionStats.activeConnections,
      maximum: maxPlayers,
      percentage: (this.sessionStats.activeConnections / maxPlayers) * 100,
      available: maxPlayers - this.sessionStats.activeConnections
    };
  }
}