export class TerrainGenerator {
  /**
   * Generate terrain based on map configuration
   */
  static async generate(options) {
    const terrain = new Terrain(options);
    await terrain.generate();
    return terrain;
  }
}

export class Terrain {
  constructor(options) {
    this.width = options.width || 2000;
    this.height = options.height || 1500;
    this.mapName = options.mapName || 'default';

    // Terrain data
    this.heightMap = [];
    this.collisionMap = [];
    this.spawnPoints = [];
    this.craters = [];

    // Generation settings
    this.settings = this.getMapSettings(this.mapName);
  }

  /**
   * Get map-specific generation settings
   */
  getMapSettings(mapName) {
    const settings = {
      default: {
        groundLevel: 0.7,
        roughness: 0.3,
        hillCount: 3,
        valleyCount: 2,
        noiseScale: 0.005
      },
      canyon: {
        groundLevel: 0.8,
        roughness: 0.5,
        hillCount: 5,
        valleyCount: 4,
        noiseScale: 0.003
      },
      mountains: {
        groundLevel: 0.6,
        roughness: 0.7,
        hillCount: 7,
        valleyCount: 3,
        noiseScale: 0.002
      },
      plains: {
        groundLevel: 0.8,
        roughness: 0.1,
        hillCount: 1,
        valleyCount: 1,
        noiseScale: 0.008
      }
    };

    return settings[mapName] || settings.default;
  }

  /**
   * Generate the terrain
   */
  async generate() {
    // Generate base height map
    this.generateHeightMap();

    // Smooth the terrain
    this.smoothTerrain();

    // Generate spawn points
    this.generateSpawnPoints();

    // Initialize collision map
    this.generateCollisionMap();
  }

  /**
   * Generate height map using Perlin noise simulation
   */
  generateHeightMap() {
    this.heightMap = new Array(this.width);

    for (let x = 0; x < this.width; x++) {
      // Base ground level
      let height = this.height * this.settings.groundLevel;

      // Add multiple octaves of noise for natural variation
      height += this.noise(x * this.settings.noiseScale) * 100 * this.settings.roughness;
      height += this.noise(x * this.settings.noiseScale * 2) * 50 * this.settings.roughness;
      height += this.noise(x * this.settings.noiseScale * 4) * 25 * this.settings.roughness;

      // Add hills and valleys
      for (let i = 0; i < this.settings.hillCount; i++) {
        const hillCenter = (this.width / (this.settings.hillCount + 1)) * (i + 1);
        const distance = Math.abs(x - hillCenter);
        const hillInfluence = Math.max(0, 1 - distance / 200);
        height -= hillInfluence * 80;
      }

      // Ensure height stays within bounds
      this.heightMap[x] = Math.max(this.height * 0.3, Math.min(this.height * 0.9, height));
    }
  }

  /**
   * Simple noise function (substitute for Perlin noise)
   */
  noise(x) {
    // Simple pseudo-random noise based on sine waves
    return (Math.sin(x) + Math.sin(x * 1.3) + Math.sin(x * 1.7)) / 3;
  }

  /**
   * Smooth terrain to remove sharp edges
   */
  smoothTerrain() {
    const smoothed = [...this.heightMap];
    const smoothRadius = 2;

    for (let x = smoothRadius; x < this.width - smoothRadius; x++) {
      let sum = 0;
      let count = 0;

      for (let dx = -smoothRadius; dx <= smoothRadius; dx++) {
        if (x + dx >= 0 && x + dx < this.width) {
          sum += this.heightMap[x + dx];
          count++;
        }
      }

      smoothed[x] = sum / count;
    }

    this.heightMap = smoothed;
  }

  /**
   * Generate spawn points for tanks
   */
  generateSpawnPoints() {
    this.spawnPoints = [];
    const spacing = this.width / 9; // Space for up to 8 players

    for (let i = 1; i <= 8; i++) {
      const x = spacing * i;
      const y = this.getHeightAt(x) - 20; // Spawn slightly above ground
      const rotation = 0;

      this.spawnPoints.push({
        position: { x, y },
        rotation,
        safe: true
      });
    }
  }

  /**
   * Generate collision map for efficient collision detection
   */
  generateCollisionMap() {
    this.collisionMap = new Array(Math.ceil(this.width / 10));

    for (let i = 0; i < this.collisionMap.length; i++) {
      const x = i * 10;
      this.collisionMap[i] = this.getHeightAt(x);
    }
  }

  /**
   * Get height at specific x coordinate
   */
  getHeightAt(x) {
    x = Math.max(0, Math.min(this.width - 1, x));
    const index = Math.floor(x);

    if (index >= this.heightMap.length - 1) {
      return this.heightMap[this.heightMap.length - 1];
    }

    // Linear interpolation between adjacent points
    const fraction = x - index;
    const height1 = this.heightMap[index];
    const height2 = this.heightMap[index + 1];

    return height1 + (height2 - height1) * fraction;
  }

  /**
   * Get terrain slope at specific x coordinate
   */
  getSlopeAt(x) {
    const sampleDistance = 5;
    const leftHeight = this.getHeightAt(x - sampleDistance);
    const rightHeight = this.getHeightAt(x + sampleDistance);

    const slope = (rightHeight - leftHeight) / (2 * sampleDistance);
    return Math.atan(slope);
  }

  /**
   * Check collision with bounding box
   */
  checkCollision(bounds) {
    const startX = Math.max(0, bounds.x);
    const endX = Math.min(this.width, bounds.x + bounds.width);

    for (let x = startX; x <= endX; x += 5) {
      const groundHeight = this.getHeightAt(x);
      if (bounds.y + bounds.height >= groundHeight) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create crater from explosion
   */
  createCrater(position, radius) {
    const crater = {
      x: position.x,
      y: position.y,
      radius: radius,
      depth: radius * 0.5,
      id: Date.now() + Math.random()
    };

    this.craters.push(crater);

    // Modify height map around crater
    const startX = Math.max(0, Math.floor(position.x - radius));
    const endX = Math.min(this.width - 1, Math.ceil(position.x + radius));

    for (let x = startX; x <= endX; x++) {
      const distance = Math.abs(x - position.x);
      if (distance <= radius) {
        const influence = 1 - (distance / radius);
        const heightReduction = crater.depth * influence * influence; // Quadratic falloff

        this.heightMap[x] = Math.min(
          this.heightMap[x],
          this.heightMap[x] + heightReduction
        );
      }
    }

    // Update collision map in affected area
    this.updateCollisionMap(startX, endX);
  }

  /**
   * Update collision map in specific range
   */
  updateCollisionMap(startX, endX) {
    const startIndex = Math.floor(startX / 10);
    const endIndex = Math.ceil(endX / 10);

    for (let i = startIndex; i <= endIndex && i < this.collisionMap.length; i++) {
      const x = i * 10;
      this.collisionMap[i] = this.getHeightAt(x);
    }
  }

  /**
   * Get spawn points for number of players
   */
  getSpawnPoints(playerCount) {
    const selected = [];
    const totalSpawns = this.spawnPoints.length;

    if (playerCount <= totalSpawns) {
      // Distribute players evenly across available spawn points
      const step = Math.floor(totalSpawns / playerCount);

      for (let i = 0; i < playerCount; i++) {
        const index = i * step;
        selected.push(this.spawnPoints[index]);
      }
    } else {
      // More players than spawn points, use all and add random ones
      selected.push(...this.spawnPoints);

      for (let i = totalSpawns; i < playerCount; i++) {
        selected.push(this.getRandomSpawnPoint());
      }
    }

    return selected;
  }

  /**
   * Get random safe spawn point
   */
  getRandomSpawnPoint() {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const x = Math.random() * this.width;
      const y = this.getHeightAt(x) - 20;

      // Check if position is safe (not too steep, not in crater)
      const slope = Math.abs(this.getSlopeAt(x));
      if (slope < Math.PI / 6) { // Less than 30 degrees
        return {
          position: { x, y },
          rotation: 0,
          safe: true
        };
      }

      attempts++;
    }

    // Fallback to center of map
    const x = this.width / 2;
    const y = this.getHeightAt(x) - 20;
    return {
      position: { x, y },
      rotation: 0,
      safe: false
    };
  }

  /**
   * Get terrain bounds
   */
  getBounds() {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Get terrain data for client
   */
  getData() {
    // Sample height map for client (reduce data size)
    const sampleRate = 5;
    const sampledHeights = [];

    for (let x = 0; x < this.width; x += sampleRate) {
      sampledHeights.push({
        x: x,
        height: this.getHeightAt(x)
      });
    }

    return {
      width: this.width,
      height: this.height,
      mapName: this.mapName,
      heightMap: sampledHeights,
      spawnPoints: this.spawnPoints,
      craters: this.craters,
      bounds: this.getBounds()
    };
  }
}