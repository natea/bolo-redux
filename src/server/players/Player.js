export class Player {
  constructor(options) {
    this.id = options.id;
    this.socketId = options.socketId;
    this.name = options.name;
    this.avatar = options.avatar || 'default';
    this.color = options.color || '#FF6B6B';
    this.joinedAt = options.joinedAt || new Date();

    // Connection status
    this.connected = true;
    this.lastActivity = new Date();
    this.connectionCount = 1;

    // Game state
    this.currentRoom = null;
    this.currentGame = null;
    this.inGame = false;

    // Player statistics
    this.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalShots: 0,
      totalHits: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalPlayTime: 0, // in milliseconds
      bestKillStreak: 0,
      currentKillStreak: 0,
      averageAccuracy: 0,
      favoriteWeapon: 'standard',
      achievements: []
    };

    // Session data
    this.sessionStartTime = new Date();
    this.sessionStats = {
      kills: 0,
      deaths: 0,
      shots: 0,
      hits: 0,
      damageDealt: 0,
      damageTaken: 0
    };

    // Preferences
    this.preferences = {
      autoRespawn: true,
      showTrajectory: true,
      soundEnabled: true,
      musicEnabled: true,
      chatEnabled: true,
      spectateMode: false
    };
  }

  /**
   * Update player activity timestamp
   */
  updateActivity(activity = null) {
    this.lastActivity = new Date();

    if (activity) {
      // Log specific activities for analytics
      // Could be extended to track detailed player behavior
    }
  }

  /**
   * Handle player disconnect
   */
  disconnect() {
    this.connected = false;
    this.updateActivity('disconnect');

    // Update total play time
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    this.stats.totalPlayTime += sessionDuration;
  }

  /**
   * Handle player reconnect
   */
  reconnect(newSocketId) {
    this.socketId = newSocketId;
    this.connected = true;
    this.connectionCount++;
    this.sessionStartTime = new Date();
    this.updateActivity('reconnect');

    // Reset session stats
    this.sessionStats = {
      kills: 0,
      deaths: 0,
      shots: 0,
      hits: 0,
      damageDealt: 0,
      damageTaken: 0
    };
  }

  /**
   * Join a room
   */
  joinRoom(roomId) {
    this.currentRoom = roomId;
    this.updateActivity('join_room');
  }

  /**
   * Leave current room
   */
  leaveRoom() {
    this.currentRoom = null;
    this.currentGame = null;
    this.inGame = false;
    this.updateActivity('leave_room');
  }

  /**
   * Start a game
   */
  startGame(gameId) {
    this.currentGame = gameId;
    this.inGame = true;
    this.stats.gamesPlayed++;
    this.updateActivity('start_game');

    // Reset current kill streak for new game
    this.stats.currentKillStreak = 0;
  }

  /**
   * End current game
   */
  endGame(won = false, gameStats = {}) {
    this.inGame = false;
    this.updateActivity('end_game');

    if (won) {
      this.stats.gamesWon++;
      this.addAchievement('winner');
    }

    // Update stats from game
    this.updateStatsFromGame(gameStats);

    // Reset session kill streak
    this.stats.currentKillStreak = 0;
  }

  /**
   * Record a kill
   */
  recordKill(targetPlayerId, weaponType = 'standard') {
    this.sessionStats.kills++;
    this.stats.totalKills++;
    this.stats.currentKillStreak++;

    // Update best kill streak
    if (this.stats.currentKillStreak > this.stats.bestKillStreak) {
      this.stats.bestKillStreak = this.stats.currentKillStreak;

      // Award achievement for kill streak milestones
      if (this.stats.bestKillStreak >= 5) {
        this.addAchievement('kill_streak_5');
      }
      if (this.stats.bestKillStreak >= 10) {
        this.addAchievement('kill_streak_10');
      }
    }

    // Track favorite weapon
    this.updateFavoriteWeapon(weaponType);

    this.updateActivity('kill');
  }

  /**
   * Record a death
   */
  recordDeath(killerPlayerId) {
    this.sessionStats.deaths++;
    this.stats.totalDeaths++;
    this.stats.currentKillStreak = 0; // Reset kill streak on death

    this.updateActivity('death');
  }

  /**
   * Record a shot
   */
  recordShot(weaponType = 'standard', hit = false) {
    this.sessionStats.shots++;
    this.stats.totalShots++;

    if (hit) {
      this.sessionStats.hits++;
      this.stats.totalHits++;
    }

    // Update accuracy
    this.updateAccuracy();
    this.updateFavoriteWeapon(weaponType);
    this.updateActivity('shot');
  }

  /**
   * Record damage dealt
   */
  recordDamageDealt(amount) {
    this.sessionStats.damageDealt += amount;
    this.stats.totalDamageDealt += amount;
  }

  /**
   * Record damage taken
   */
  recordDamageTaken(amount) {
    this.sessionStats.damageTaken += amount;
    this.stats.totalDamageTaken += amount;
  }

  /**
   * Update accuracy calculation
   */
  updateAccuracy() {
    if (this.stats.totalShots > 0) {
      this.stats.averageAccuracy = (this.stats.totalHits / this.stats.totalShots) * 100;
    }
  }

  /**
   * Update favorite weapon based on usage
   */
  updateFavoriteWeapon(weaponType) {
    // Simple implementation - could be enhanced with weapon usage tracking
    this.stats.favoriteWeapon = weaponType;
  }

  /**
   * Add achievement
   */
  addAchievement(achievementId) {
    if (!this.stats.achievements.includes(achievementId)) {
      this.stats.achievements.push(achievementId);
      this.updateActivity('achievement');
    }
  }

  /**
   * Update stats from completed game
   */
  updateStatsFromGame(gameStats) {
    // Aggregate session stats into total stats
    this.stats.totalKills += this.sessionStats.kills;
    this.stats.totalDeaths += this.sessionStats.deaths;
    this.stats.totalShots += this.sessionStats.shots;
    this.stats.totalHits += this.sessionStats.hits;
    this.stats.totalDamageDealt += this.sessionStats.damageDealt;
    this.stats.totalDamageTaken += this.sessionStats.damageTaken;

    // Update calculated stats
    this.updateAccuracy();

    // Check for achievements
    this.checkAchievements();
  }

  /**
   * Check for new achievements
   */
  checkAchievements() {
    // First game
    if (this.stats.gamesPlayed === 1) {
      this.addAchievement('first_game');
    }

    // Win milestones
    if (this.stats.gamesWon === 1) {
      this.addAchievement('first_win');
    }
    if (this.stats.gamesWon >= 10) {
      this.addAchievement('10_wins');
    }
    if (this.stats.gamesWon >= 50) {
      this.addAchievement('50_wins');
    }

    // Kill milestones
    if (this.stats.totalKills >= 50) {
      this.addAchievement('50_kills');
    }
    if (this.stats.totalKills >= 200) {
      this.addAchievement('200_kills');
    }

    // Accuracy achievements
    if (this.stats.averageAccuracy >= 70 && this.stats.totalShots >= 100) {
      this.addAchievement('sharpshooter');
    }
    if (this.stats.averageAccuracy >= 90 && this.stats.totalShots >= 50) {
      this.addAchievement('expert_marksman');
    }

    // Playtime achievements
    const hoursPlayed = this.stats.totalPlayTime / (1000 * 60 * 60);
    if (hoursPlayed >= 10) {
      this.addAchievement('10_hours');
    }
    if (hoursPlayed >= 50) {
      this.addAchievement('50_hours');
    }
  }

  /**
   * Get player statistics
   */
  getStats() {
    const winRate = this.stats.gamesPlayed > 0 ?
      (this.stats.gamesWon / this.stats.gamesPlayed) * 100 : 0;

    const kdr = this.stats.totalDeaths > 0 ?
      this.stats.totalKills / this.stats.totalDeaths : this.stats.totalKills;

    return {
      ...this.stats,
      winRate: Math.round(winRate * 100) / 100,
      killDeathRatio: Math.round(kdr * 100) / 100,
      hoursPlayed: Math.round((this.stats.totalPlayTime / (1000 * 60 * 60)) * 10) / 10,
      sessionStats: this.sessionStats,
      gamesPlayed: this.stats.gamesPlayed,
      wins: this.stats.gamesWon
    };
  }

  /**
   * Get player state for client
   */
  getState() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      color: this.color,
      connected: this.connected,
      inGame: this.inGame,
      currentRoom: this.currentRoom,
      stats: this.getStats(),
      achievements: this.stats.achievements,
      preferences: this.preferences
    };
  }

  /**
   * Update player preferences
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.updateActivity('update_preferences');
  }

  /**
   * Check if player is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Check if player is in a game
   */
  isInGame() {
    return this.inGame;
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity() {
    return Date.now() - this.lastActivity.getTime();
  }

  /**
   * Get session duration
   */
  getSessionDuration() {
    return Date.now() - this.sessionStartTime.getTime();
  }
}