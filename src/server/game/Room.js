export class Room {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.hostId = options.hostId;
    this.maxPlayers = options.maxPlayers || 8;
    this.gameMode = options.gameMode || 'classic';
    this.mapName = options.mapName || 'default';

    this.players = [];
    this.status = 'waiting'; // waiting, in_game, finished
    this.gameId = null;
    this.createdAt = new Date();
  }

  /**
   * Add a player to the room
   */
  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('Room is full');
    }

    if (this.players.find(p => p.id === player.id)) {
      throw new Error('Player already in room');
    }

    this.players.push(player);
  }

  /**
   * Remove a player from the room
   */
  removePlayer(player) {
    const index = this.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  /**
   * Check if room is full
   */
  isFull() {
    return this.players.length >= this.maxPlayers;
  }

  /**
   * Check if player is host
   */
  isHost(playerId) {
    return this.hostId === playerId;
  }

  /**
   * Get room info for client
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
      gameMode: this.gameMode,
      mapName: this.mapName,
      status: this.status,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.id === this.hostId
      }))
    };
  }
}