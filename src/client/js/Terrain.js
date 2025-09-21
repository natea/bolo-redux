/**
 * Terrain class for managing game map, obstacles, and environment
 */
class Terrain {
    constructor(width, height, tileSize = 32) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tilesX = Math.ceil(width / tileSize);
        this.tilesY = Math.ceil(height / tileSize);

        // Initialize terrain grid
        this.tiles = [];
        this.obstacles = [];
        this.powerUps = [];
        this.bases = [];

        this.initializeTerrain();
        this.generateObstacles();
        this.placeBases();
    }

    initializeTerrain() {
        for (let y = 0; y < this.tilesY; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.tilesX; x++) {
                this.tiles[y][x] = this.createTile(x, y);
            }
        }
    }

    createTile(x, y) {
        const worldX = x * this.tileSize;
        const worldY = y * this.tileSize;

        // Determine tile type based on position
        let type = 'grass';
        let isSolid = false;
        let color = '#2d5a2d';

        // Create some variation in terrain
        const noise = this.generateNoise(x, y);

        if (noise > 0.7) {
            type = 'rock';
            isSolid = true;
            color = '#666666';
        } else if (noise > 0.5) {
            type = 'dirt';
            color = '#8b4513';
        } else if (noise < 0.2) {
            type = 'water';
            isSolid = true;
            color = '#0066cc';
        }

        return {
            x: x,
            y: y,
            worldX: worldX,
            worldY: worldY,
            type: type,
            isSolid: isSolid,
            color: color,
            bounds: {
                x: worldX,
                y: worldY,
                width: this.tileSize,
                height: this.tileSize
            }
        };
    }

    generateNoise(x, y) {
        // Simple pseudo-random noise generator
        const seed = x * 12.9898 + y * 78.233;
        return Math.abs(Math.sin(seed * 43758.5453) % 1);
    }

    generateObstacles() {
        // Add larger obstacles like buildings, rocks, trees
        const obstacleCount = Math.floor((this.width * this.height) / 50000);

        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = this.createRandomObstacle();
            if (this.isValidObstaclePosition(obstacle)) {
                this.obstacles.push(obstacle);
            }
        }
    }

    createRandomObstacle() {
        const types = ['building', 'rock', 'tree', 'wall'];
        const type = types[Math.floor(Math.random() * types.length)];

        let width, height, color, health;

        switch (type) {
            case 'building':
                width = 60 + Math.random() * 80;
                height = 60 + Math.random() * 80;
                color = '#888888';
                health = 200;
                break;
            case 'rock':
                width = 30 + Math.random() * 40;
                height = 30 + Math.random() * 40;
                color = '#555555';
                health = 150;
                break;
            case 'tree':
                width = 20 + Math.random() * 20;
                height = 20 + Math.random() * 20;
                color = '#228b22';
                health = 50;
                break;
            case 'wall':
                width = 100 + Math.random() * 100;
                height = 20 + Math.random() * 20;
                color = '#996633';
                health = 100;
                break;
        }

        return {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: Math.random() * (this.width - width),
            y: Math.random() * (this.height - height),
            width: width,
            height: height,
            color: color,
            maxHealth: health,
            health: health,
            isDestructible: type !== 'rock',
            bounds: null // Will be set below
        };
    }

    isValidObstaclePosition(obstacle) {
        // Check if obstacle overlaps with existing obstacles
        for (const existing of this.obstacles) {
            if (this.rectanglesOverlap(obstacle, existing)) {
                return false;
            }
        }

        // Check if obstacle overlaps with bases (if they exist)
        for (const base of this.bases) {
            if (this.rectanglesOverlap(obstacle, base)) {
                return false;
            }
        }

        // Ensure minimum distance from edges
        const margin = 50;
        return (
            obstacle.x > margin &&
            obstacle.y > margin &&
            obstacle.x + obstacle.width < this.width - margin &&
            obstacle.y + obstacle.height < this.height - margin
        );
    }

    rectanglesOverlap(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    placeBases() {
        // Place team bases at corners
        const baseSize = 80;
        const margin = 100;

        const basePositions = [
            { x: margin, y: margin, team: 'red' },
            { x: this.width - margin - baseSize, y: margin, team: 'blue' },
            { x: margin, y: this.height - margin - baseSize, team: 'green' },
            { x: this.width - margin - baseSize, y: this.height - margin - baseSize, team: 'yellow' }
        ];

        basePositions.forEach(pos => {
            this.bases.push({
                id: `base_${pos.team}`,
                team: pos.team,
                x: pos.x,
                y: pos.y,
                width: baseSize,
                height: baseSize,
                color: this.getTeamColor(pos.team),
                health: 500,
                maxHealth: 500,
                isSpawnPoint: true,
                bounds: {
                    x: pos.x,
                    y: pos.y,
                    width: baseSize,
                    height: baseSize
                }
            });
        });
    }

    getTeamColor(team) {
        const colors = {
            'red': '#ff4444',
            'blue': '#4444ff',
            'green': '#44ff44',
            'yellow': '#ffff44'
        };
        return colors[team] || '#888888';
    }

    // Collision detection methods
    getTileAt(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);

        if (tileX >= 0 && tileX < this.tilesX && tileY >= 0 && tileY < this.tilesY) {
            return this.tiles[tileY][tileX];
        }
        return null;
    }

    getTilesInRadius(position, radius) {
        const tiles = [];
        const startX = Math.max(0, Math.floor((position.x - radius) / this.tileSize));
        const endX = Math.min(this.tilesX - 1, Math.floor((position.x + radius) / this.tileSize));
        const startY = Math.max(0, Math.floor((position.y - radius) / this.tileSize));
        const endY = Math.min(this.tilesY - 1, Math.floor((position.y + radius) / this.tileSize));

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                tiles.push(this.tiles[y][x]);
            }
        }

        return tiles;
    }

    isPositionSolid(x, y) {
        const tile = this.getTileAt(x, y);
        if (tile && tile.isSolid) {
            return true;
        }

        // Check obstacles
        for (const obstacle of this.obstacles) {
            if (x >= obstacle.x && x <= obstacle.x + obstacle.width &&
                y >= obstacle.y && y <= obstacle.y + obstacle.height) {
                return true;
            }
        }

        return false;
    }

    getObstaclesInRadius(position, radius) {
        return this.obstacles.filter(obstacle => {
            const centerX = obstacle.x + obstacle.width / 2;
            const centerY = obstacle.y + obstacle.height / 2;
            const distance = Math.sqrt(
                Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
            );
            return distance <= radius + Math.max(obstacle.width, obstacle.height) / 2;
        });
    }

    damageObstacle(obstacleId, damage) {
        const obstacle = this.obstacles.find(obs => obs.id === obstacleId);
        if (obstacle && obstacle.isDestructible) {
            obstacle.health -= damage;
            if (obstacle.health <= 0) {
                this.destroyObstacle(obstacleId);
                return true; // Obstacle destroyed
            }
        }
        return false; // Obstacle damaged but not destroyed
    }

    destroyObstacle(obstacleId) {
        const index = this.obstacles.findIndex(obs => obs.id === obstacleId);
        if (index !== -1) {
            this.obstacles.splice(index, 1);
        }
    }

    // Power-up management
    spawnPowerUp(x, y, type) {
        const powerUp = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: x,
            y: y,
            size: 15,
            color: this.getPowerUpColor(type),
            spawnTime: Date.now(),
            duration: 30000, // 30 seconds
            effect: this.getPowerUpEffect(type)
        };

        this.powerUps.push(powerUp);
        return powerUp;
    }

    getPowerUpColor(type) {
        const colors = {
            'health': '#ff0000',
            'ammo': '#ffff00',
            'speed': '#00ff00',
            'damage': '#ff8800',
            'shield': '#0088ff'
        };
        return colors[type] || '#ffffff';
    }

    getPowerUpEffect(type) {
        const effects = {
            'health': { healthRestore: 50 },
            'ammo': { ammoRestore: 15 },
            'speed': { speedBoost: 1.5, duration: 10000 },
            'damage': { damageBoost: 1.5, duration: 15000 },
            'shield': { shield: 100, duration: 20000 }
        };
        return effects[type] || {};
    }

    collectPowerUp(powerUpId) {
        const index = this.powerUps.findIndex(pu => pu.id === powerUpId);
        if (index !== -1) {
            const powerUp = this.powerUps[index];
            this.powerUps.splice(index, 1);
            return powerUp;
        }
        return null;
    }

    updatePowerUps() {
        const now = Date.now();
        this.powerUps = this.powerUps.filter(powerUp => {
            return (now - powerUp.spawnTime) < powerUp.duration;
        });
    }

    // Spawn point management
    getSpawnPoint(team) {
        const base = this.bases.find(base => base.team === team);
        if (base) {
            return {
                x: base.x + base.width / 2,
                y: base.y + base.height / 2
            };
        }

        // Default spawn points if no base found
        const spawnPoints = [
            { x: 100, y: 100 },
            { x: this.width - 100, y: 100 },
            { x: 100, y: this.height - 100 },
            { x: this.width - 100, y: this.height - 100 }
        ];

        return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    }

    // Pathfinding support
    isPathClear(start, end) {
        const steps = 20;
        const dx = (end.x - start.x) / steps;
        const dy = (end.y - start.y) / steps;

        for (let i = 0; i <= steps; i++) {
            const x = start.x + dx * i;
            const y = start.y + dy * i;
            if (this.isPositionSolid(x, y)) {
                return false;
            }
        }

        return true;
    }

    // Network state for multiplayer
    getNetworkState() {
        return {
            obstacles: this.obstacles.map(obs => ({
                id: obs.id,
                type: obs.type,
                x: obs.x,
                y: obs.y,
                width: obs.width,
                height: obs.height,
                health: obs.health,
                maxHealth: obs.maxHealth
            })),
            powerUps: this.powerUps.map(pu => ({
                id: pu.id,
                type: pu.type,
                x: pu.x,
                y: pu.y,
                spawnTime: pu.spawnTime
            })),
            bases: this.bases
        };
    }

    updateFromNetworkState(state) {
        // Update obstacles
        if (state.obstacles) {
            state.obstacles.forEach(netObs => {
                const localObs = this.obstacles.find(obs => obs.id === netObs.id);
                if (localObs) {
                    localObs.health = netObs.health;
                }
            });
        }

        // Update power-ups
        if (state.powerUps) {
            this.powerUps = state.powerUps.map(netPu => {
                const existing = this.powerUps.find(pu => pu.id === netPu.id);
                return existing || {
                    ...netPu,
                    size: 15,
                    color: this.getPowerUpColor(netPu.type),
                    duration: 30000,
                    effect: this.getPowerUpEffect(netPu.type)
                };
            });
        }
    }

    toString() {
        return `Terrain(${this.width}x${this.height}, ${this.obstacles.length} obstacles, ${this.powerUps.length} power-ups)`;
    }
}