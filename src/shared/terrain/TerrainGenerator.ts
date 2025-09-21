/**
 * Procedural terrain generation system for Bolo game
 * Creates maps with walls, destructible terrain, and special areas
 */

import { Vector2D } from '../core/Vector2D';
import { GAME_CONSTANTS } from '../core/GameConstants';
import { PhysicsBody } from '../physics/PhysicsEngine';

export enum TerrainType {
  EMPTY = 0,
  WALL = 1,
  DESTRUCTIBLE_WALL = 2,
  WATER = 3,
  MUD = 4,
  BRIDGE = 5,
  SPAWN_POINT = 6,
  FLAG_BASE = 7,
  POWERUP_SPAWN = 8
}

export interface TerrainTile {
  type: TerrainType;
  position: Vector2D;
  health?: number;
  maxHealth?: number;
  passable: boolean;
  slowFactor: number;
  destructible: boolean;
}

export interface MapConfiguration {
  width: number;
  height: number;
  wallDensity: number;
  destructibleRatio: number;
  waterBodies: number;
  mudPatches: number;
  spawnPoints: number;
  powerupSpots: number;
  seed?: number;
}

export interface GeneratedMap {
  tiles: TerrainTile[][];
  width: number;
  height: number;
  spawnPoints: Vector2D[];
  flagBases: Vector2D[];
  powerupSpots: Vector2D[];
  physicsWalls: PhysicsBody[];
}

export class TerrainGenerator {
  private random: () => number;
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
    this.random = this.createSeededRandom(this.seed);
  }

  // Seeded random number generator for consistent map generation
  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  generateMap(config: MapConfiguration): GeneratedMap {
    const tiles = this.initializeEmptyMap(config.width, config.height);

    // Generate different terrain features
    this.placeBoundaryWalls(tiles, config);
    this.generateMaze(tiles, config);
    this.placeWaterBodies(tiles, config);
    this.placeMudPatches(tiles, config);
    this.placeSpawnPoints(tiles, config);
    this.placeFlagBases(tiles, config);
    this.placePowerupSpots(tiles, config);
    this.ensureConnectivity(tiles, config);

    const result: GeneratedMap = {
      tiles,
      width: config.width,
      height: config.height,
      spawnPoints: this.findTilesByType(tiles, TerrainType.SPAWN_POINT),
      flagBases: this.findTilesByType(tiles, TerrainType.FLAG_BASE),
      powerupSpots: this.findTilesByType(tiles, TerrainType.POWERUP_SPAWN),
      physicsWalls: this.createPhysicsWalls(tiles)
    };

    return result;
  }

  private initializeEmptyMap(width: number, height: number): TerrainTile[][] {
    const tiles: TerrainTile[][] = [];

    for (let x = 0; x < width; x++) {
      tiles[x] = [];
      for (let y = 0; y < height; y++) {
        tiles[x][y] = {
          type: TerrainType.EMPTY,
          position: new Vector2D(x * GAME_CONSTANTS.TERRAIN.TILE_SIZE, y * GAME_CONSTANTS.TERRAIN.TILE_SIZE),
          passable: true,
          slowFactor: 1.0,
          destructible: false
        };
      }
    }

    return tiles;
  }

  private placeBoundaryWalls(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height } = config;

    // Top and bottom walls
    for (let x = 0; x < width; x++) {
      this.setTile(tiles, x, 0, TerrainType.WALL);
      this.setTile(tiles, x, height - 1, TerrainType.WALL);
    }

    // Left and right walls
    for (let y = 0; y < height; y++) {
      this.setTile(tiles, 0, y, TerrainType.WALL);
      this.setTile(tiles, width - 1, y, TerrainType.WALL);
    }
  }

  private generateMaze(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height, wallDensity, destructibleRatio } = config;

    // Create maze-like structure with random walls
    for (let x = 2; x < width - 2; x += 3) {
      for (let y = 2; y < height - 2; y += 3) {
        if (this.random() < wallDensity) {
          // Place a wall cluster
          this.placeWallCluster(tiles, x, y, destructibleRatio);
        }
      }
    }

    // Add some random scattered walls
    const scatteredWalls = Math.floor(width * height * wallDensity * 0.1);
    for (let i = 0; i < scatteredWalls; i++) {
      const x = Math.floor(this.random() * (width - 4)) + 2;
      const y = Math.floor(this.random() * (height - 4)) + 2;

      if (tiles[x][y].type === TerrainType.EMPTY) {
        const isDestructible = this.random() < destructibleRatio;
        this.setTile(tiles, x, y, isDestructible ? TerrainType.DESTRUCTIBLE_WALL : TerrainType.WALL);
      }
    }
  }

  private placeWallCluster(tiles: TerrainTile[][], centerX: number, centerY: number, destructibleRatio: number): void {
    const patterns = [
      [[1]], // Single wall
      [[1, 1]], // Horizontal line
      [[1], [1]], // Vertical line
      [[1, 1], [1, 1]], // 2x2 square
      [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Plus shape
      [[1, 0, 1], [0, 1, 0], [1, 0, 1]], // X shape
    ];

    const pattern = patterns[Math.floor(this.random() * patterns.length)];

    for (let dy = 0; dy < pattern.length; dy++) {
      for (let dx = 0; dx < pattern[dy].length; dx++) {
        if (pattern[dy][dx] === 1) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (this.isValidPosition(tiles, x, y) && tiles[x][y].type === TerrainType.EMPTY) {
            const isDestructible = this.random() < destructibleRatio;
            this.setTile(tiles, x, y, isDestructible ? TerrainType.DESTRUCTIBLE_WALL : TerrainType.WALL);
          }
        }
      }
    }
  }

  private placeWaterBodies(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height, waterBodies } = config;

    for (let i = 0; i < waterBodies; i++) {
      const centerX = Math.floor(this.random() * (width - 8)) + 4;
      const centerY = Math.floor(this.random() * (height - 8)) + 4;
      const size = Math.floor(this.random() * 4) + 2;

      this.placeCircularArea(tiles, centerX, centerY, size, TerrainType.WATER);
    }
  }

  private placeMudPatches(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height, mudPatches } = config;

    for (let i = 0; i < mudPatches; i++) {
      const centerX = Math.floor(this.random() * (width - 6)) + 3;
      const centerY = Math.floor(this.random() * (height - 6)) + 3;
      const size = Math.floor(this.random() * 3) + 2;

      this.placeCircularArea(tiles, centerX, centerY, size, TerrainType.MUD);
    }
  }

  private placeCircularArea(tiles: TerrainTile[][], centerX: number, centerY: number, radius: number, type: TerrainType): void {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        if (distance <= radius && this.isValidPosition(tiles, x, y) && tiles[x][y].passable) {
          this.setTile(tiles, x, y, type);
        }
      }
    }
  }

  private placeSpawnPoints(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height, spawnPoints } = config;
    const placed: Vector2D[] = [];

    while (placed.length < spawnPoints) {
      const x = Math.floor(this.random() * (width - 4)) + 2;
      const y = Math.floor(this.random() * (height - 4)) + 2;

      if (this.isGoodSpawnLocation(tiles, x, y, placed)) {
        this.setTile(tiles, x, y, TerrainType.SPAWN_POINT);
        placed.push(new Vector2D(x, y));
      }
    }
  }

  private isGoodSpawnLocation(tiles: TerrainTile[][], x: number, y: number, existing: Vector2D[]): boolean {
    // Check if area is clear
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;

        if (!this.isValidPosition(tiles, nx, ny) || !tiles[nx][ny].passable) {
          return false;
        }
      }
    }

    // Check distance from other spawn points
    const minDistance = 5;
    for (const spawn of existing) {
      if (Math.sqrt((x - spawn.x) ** 2 + (y - spawn.y) ** 2) < minDistance) {
        return false;
      }
    }

    return true;
  }

  private placeFlagBases(tiles: TerrainTile[][], config: MapConfiguration): void {
    // Place 2 flag bases on opposite sides of the map
    const { width, height } = config;

    // Red base (left side)
    const redX = Math.floor(width * 0.2);
    const redY = Math.floor(height * 0.5);
    this.clearArea(tiles, redX, redY, 2);
    this.setTile(tiles, redX, redY, TerrainType.FLAG_BASE);

    // Blue base (right side)
    const blueX = Math.floor(width * 0.8);
    const blueY = Math.floor(height * 0.5);
    this.clearArea(tiles, blueX, blueY, 2);
    this.setTile(tiles, blueX, blueY, TerrainType.FLAG_BASE);
  }

  private placePowerupSpots(tiles: TerrainTile[][], config: MapConfiguration): void {
    const { width, height, powerupSpots } = config;
    const placed = 0;

    while (placed < powerupSpots) {
      const x = Math.floor(this.random() * (width - 4)) + 2;
      const y = Math.floor(this.random() * (height - 4)) + 2;

      if (tiles[x][y].type === TerrainType.EMPTY) {
        this.setTile(tiles, x, y, TerrainType.POWERUP_SPAWN);
        break;
      }
    }
  }

  private clearArea(tiles: TerrainTile[][], centerX: number, centerY: number, radius: number): void {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        if (this.isValidPosition(tiles, x, y)) {
          this.setTile(tiles, x, y, TerrainType.EMPTY);
        }
      }
    }
  }

  private ensureConnectivity(tiles: TerrainTile[][], config: MapConfiguration): void {
    // Simple connectivity check using flood fill
    const visited = new Set<string>();
    const passableTiles: Vector2D[] = [];

    // Find all passable tiles
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (tiles[x][y].passable) {
          passableTiles.push(new Vector2D(x, y));
        }
      }
    }

    if (passableTiles.length === 0) return;

    // Flood fill from first passable tile
    const stack = [passableTiles[0]];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      // Check adjacent tiles
      const directions = [
        new Vector2D(0, 1), new Vector2D(0, -1),
        new Vector2D(1, 0), new Vector2D(-1, 0)
      ];

      for (const dir of directions) {
        const next = current.add(dir);
        const nextKey = `${next.x},${next.y}`;

        if (!visited.has(nextKey) &&
            this.isValidPosition(tiles, next.x, next.y) &&
            tiles[next.x][next.y].passable) {
          stack.push(next);
        }
      }
    }

    // Remove walls to connect isolated areas
    for (const tile of passableTiles) {
      const key = `${tile.x},${tile.y}`;
      if (!visited.has(key)) {
        // This tile is isolated, create a path to the main area
        this.createPathToMainArea(tiles, tile, visited);
      }
    }
  }

  private createPathToMainArea(tiles: TerrainTile[][], isolated: Vector2D, connected: Set<string>): void {
    // Simple path creation - remove walls in a straight line to nearest connected tile
    let minDistance = Infinity;
    let nearestConnected: Vector2D | null = null;

    for (const key of connected) {
      const [x, y] = key.split(',').map(Number);
      const distance = isolated.distance(new Vector2D(x, y));
      if (distance < minDistance) {
        minDistance = distance;
        nearestConnected = new Vector2D(x, y);
      }
    }

    if (nearestConnected) {
      const direction = nearestConnected.subtract(isolated).normalize();
      let current = isolated.clone();

      while (current.distance(nearestConnected) > 1) {
        current.addInPlace(direction);
        const x = Math.round(current.x);
        const y = Math.round(current.y);

        if (this.isValidPosition(tiles, x, y) && !tiles[x][y].passable) {
          this.setTile(tiles, x, y, TerrainType.EMPTY);
        }
      }
    }
  }

  private setTile(tiles: TerrainTile[][], x: number, y: number, type: TerrainType): void {
    if (!this.isValidPosition(tiles, x, y)) return;

    const tile = tiles[x][y];
    tile.type = type;

    switch (type) {
      case TerrainType.EMPTY:
        tile.passable = true;
        tile.slowFactor = 1.0;
        tile.destructible = false;
        break;

      case TerrainType.WALL:
        tile.passable = false;
        tile.slowFactor = 0.0;
        tile.destructible = false;
        break;

      case TerrainType.DESTRUCTIBLE_WALL:
        tile.passable = false;
        tile.slowFactor = 0.0;
        tile.destructible = true;
        tile.health = GAME_CONSTANTS.TERRAIN.DESTRUCTIBLE_HEALTH;
        tile.maxHealth = GAME_CONSTANTS.TERRAIN.DESTRUCTIBLE_HEALTH;
        break;

      case TerrainType.WATER:
        tile.passable = true;
        tile.slowFactor = GAME_CONSTANTS.TERRAIN.WATER_SLOW_FACTOR;
        tile.destructible = false;
        break;

      case TerrainType.MUD:
        tile.passable = true;
        tile.slowFactor = GAME_CONSTANTS.TERRAIN.MUD_SLOW_FACTOR;
        tile.destructible = false;
        break;

      case TerrainType.SPAWN_POINT:
      case TerrainType.FLAG_BASE:
      case TerrainType.POWERUP_SPAWN:
        tile.passable = true;
        tile.slowFactor = 1.0;
        tile.destructible = false;
        break;
    }
  }

  private isValidPosition(tiles: TerrainTile[][], x: number, y: number): boolean {
    return x >= 0 && x < tiles.length && y >= 0 && y < tiles[0].length;
  }

  private findTilesByType(tiles: TerrainTile[][], type: TerrainType): Vector2D[] {
    const result: Vector2D[] = [];

    for (let x = 0; x < tiles.length; x++) {
      for (let y = 0; y < tiles[x].length; y++) {
        if (tiles[x][y].type === type) {
          result.push(new Vector2D(
            x * GAME_CONSTANTS.TERRAIN.TILE_SIZE,
            y * GAME_CONSTANTS.TERRAIN.TILE_SIZE
          ));
        }
      }
    }

    return result;
  }

  private createPhysicsWalls(tiles: TerrainTile[][]): PhysicsBody[] {
    const walls: PhysicsBody[] = [];

    for (let x = 0; x < tiles.length; x++) {
      for (let y = 0; y < tiles[x].length; y++) {
        const tile = tiles[x][y];

        if (tile.type === TerrainType.WALL || tile.type === TerrainType.DESTRUCTIBLE_WALL) {
          walls.push({
            id: `wall_${x}_${y}`,
            position: tile.position.clone(),
            velocity: Vector2D.zero(),
            acceleration: Vector2D.zero(),
            rotation: 0,
            angularVelocity: 0,
            mass: Infinity,
            collisionRadius: GAME_CONSTANTS.TERRAIN.TILE_SIZE / 2,
            collisionLayer: GAME_CONSTANTS.COLLISION_LAYERS.TERRAIN,
            collisionMask: GAME_CONSTANTS.COLLISION_LAYERS.TANK |
                          GAME_CONSTANTS.COLLISION_LAYERS.PROJECTILE,
            isStatic: true,
            friction: 0.0,
            bounciness: 0.8
          });
        }
      }
    }

    return walls;
  }

  // Utility methods
  getTileAt(tiles: TerrainTile[][], worldPosition: Vector2D): TerrainTile | null {
    const tileX = Math.floor(worldPosition.x / GAME_CONSTANTS.TERRAIN.TILE_SIZE);
    const tileY = Math.floor(worldPosition.y / GAME_CONSTANTS.TERRAIN.TILE_SIZE);

    if (this.isValidPosition(tiles, tileX, tileY)) {
      return tiles[tileX][tileY];
    }

    return null;
  }

  damageTile(tiles: TerrainTile[][], worldPosition: Vector2D, damage: number): boolean {
    const tile = this.getTileAt(tiles, worldPosition);

    if (tile && tile.destructible && tile.health !== undefined) {
      tile.health -= damage;

      if (tile.health <= 0) {
        this.setTile(tiles,
          Math.floor(worldPosition.x / GAME_CONSTANTS.TERRAIN.TILE_SIZE),
          Math.floor(worldPosition.y / GAME_CONSTANTS.TERRAIN.TILE_SIZE),
          TerrainType.EMPTY
        );
        return true; // Tile was destroyed
      }
    }

    return false;
  }

  // Preset map generators
  static generateArena(width: number = 32, height: number = 24): GeneratedMap {
    const generator = new TerrainGenerator();
    return generator.generateMap({
      width,
      height,
      wallDensity: 0.15,
      destructibleRatio: 0.7,
      waterBodies: 2,
      mudPatches: 3,
      spawnPoints: 8,
      powerupSpots: 6
    });
  }

  static generateMaze(width: number = 40, height: number = 30): GeneratedMap {
    const generator = new TerrainGenerator();
    return generator.generateMap({
      width,
      height,
      wallDensity: 0.4,
      destructibleRatio: 0.3,
      waterBodies: 1,
      mudPatches: 2,
      spawnPoints: 6,
      powerupSpots: 8
    });
  }

  static generateOpen(width: number = 36, height: number = 28): GeneratedMap {
    const generator = new TerrainGenerator();
    return generator.generateMap({
      width,
      height,
      wallDensity: 0.05,
      destructibleRatio: 0.9,
      waterBodies: 3,
      mudPatches: 5,
      spawnPoints: 10,
      powerupSpots: 12
    });
  }
}