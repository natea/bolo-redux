export class CollisionDetector {
  constructor() {
    this.precision = 1; // Collision detection precision
  }

  /**
   * Check collision between bullet and terrain
   */
  checkBulletTerrain(bullet, terrain) {
    const bulletBounds = bullet.getBounds();

    // Check multiple points along bullet path for better precision
    const steps = Math.max(1, Math.floor(bullet.getSpeed() / 10));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = bulletBounds.x + t * bullet.velocity.x;
      const checkY = bulletBounds.y + t * bullet.velocity.y;

      const groundHeight = terrain.getHeightAt(checkX);

      if (checkY + bulletBounds.height >= groundHeight) {
        // Collision detected - adjust bullet position to exact impact point
        bullet.position.x = checkX;
        bullet.position.y = groundHeight - bulletBounds.height / 2;
        return true;
      }
    }

    return false;
  }

  /**
   * Check collision between bullet and tank
   */
  checkBulletTank(bullet, tank) {
    if (!tank.isAlive()) return false;

    const bulletBounds = bullet.getBounds();
    const tankBounds = tank.getBounds();

    return this.checkAABBCollision(bulletBounds, tankBounds);
  }

  /**
   * Check collision between two tanks
   */
  checkTankTank(tank1, tank2) {
    if (!tank1.isAlive() || !tank2.isAlive()) return false;

    const bounds1 = tank1.getBounds();
    const bounds2 = tank2.getBounds();

    return this.checkAABBCollision(bounds1, bounds2);
  }

  /**
   * Check collision between tank and terrain
   */
  checkTankTerrain(tank, terrain) {
    const tankBounds = tank.getBounds();

    // Check multiple points along tank bottom
    const checkPoints = 5;
    const stepX = tankBounds.width / (checkPoints - 1);

    for (let i = 0; i < checkPoints; i++) {
      const checkX = tankBounds.x + i * stepX;
      const checkY = tankBounds.y + tankBounds.height;

      const groundHeight = terrain.getHeightAt(checkX);

      if (checkY >= groundHeight) {
        return {
          collision: true,
          groundHeight: groundHeight,
          penetration: checkY - groundHeight
        };
      }
    }

    return { collision: false };
  }

  /**
   * Check AABB (Axis-Aligned Bounding Box) collision
   */
  checkAABBCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  /**
   * Check circle collision
   */
  checkCircleCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
  }

  /**
   * Check point in circle collision
   */
  checkPointInCircle(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle.radius;
  }

  /**
   * Check line intersection (for precise bullet collision)
   */
  checkLineIntersection(line1Start, line1End, line2Start, line2End) {
    const x1 = line1Start.x, y1 = line1Start.y;
    const x2 = line1End.x, y2 = line1End.y;
    const x3 = line2Start.x, y3 = line2Start.y;
    const x4 = line2End.x, y4 = line2End.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (Math.abs(denom) < 1e-10) {
      return null; // Lines are parallel
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null; // No intersection
  }

  /**
   * Get collision normal for terrain collision
   */
  getTerrainCollisionNormal(terrain, position) {
    const sampleDistance = 5;

    // Sample terrain height at nearby points
    const leftHeight = terrain.getHeightAt(position.x - sampleDistance);
    const rightHeight = terrain.getHeightAt(position.x + sampleDistance);

    // Calculate slope
    const slope = (rightHeight - leftHeight) / (2 * sampleDistance);

    // Normal is perpendicular to slope
    const angle = Math.atan(slope) + Math.PI / 2;

    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }

  /**
   * Calculate reflection vector
   */
  calculateReflection(velocity, normal) {
    // v' = v - 2(v · n)n
    const dotProduct = velocity.x * normal.x + velocity.y * normal.y;

    return {
      x: velocity.x - 2 * dotProduct * normal.x,
      y: velocity.y - 2 * dotProduct * normal.y
    };
  }

  /**
   * Check if entity is within explosion radius
   */
  checkExplosionRadius(entityPos, explosionPos, radius) {
    const dx = entityPos.x - explosionPos.x;
    const dy = entityPos.y - explosionPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      inRadius: distance <= radius,
      distance: distance,
      normalizedDistance: distance / radius
    };
  }

  /**
   * Sweep collision detection for fast-moving objects
   */
  sweepAABB(movingRect, staticRect, velocity) {
    // Expand static rect by moving rect dimensions
    const expandedRect = {
      x: staticRect.x - movingRect.width,
      y: staticRect.y - movingRect.height,
      width: staticRect.width + movingRect.width,
      height: staticRect.height + movingRect.height
    };

    // Check if ray from moving rect center intersects expanded rect
    const rayStart = {
      x: movingRect.x + movingRect.width / 2,
      y: movingRect.y + movingRect.height / 2
    };

    const rayEnd = {
      x: rayStart.x + velocity.x,
      y: rayStart.y + velocity.y
    };

    return this.raycastAABB(rayStart, rayEnd, expandedRect);
  }

  /**
   * Raycast against AABB
   */
  raycastAABB(rayStart, rayEnd, rect) {
    const dx = rayEnd.x - rayStart.x;
    const dy = rayEnd.y - rayStart.y;

    if (dx === 0 && dy === 0) return null;

    const invDx = 1 / dx;
    const invDy = 1 / dy;

    let tMin, tMax;

    if (invDx >= 0) {
      tMin = (rect.x - rayStart.x) * invDx;
      tMax = (rect.x + rect.width - rayStart.x) * invDx;
    } else {
      tMin = (rect.x + rect.width - rayStart.x) * invDx;
      tMax = (rect.x - rayStart.x) * invDx;
    }

    let tyMin, tyMax;

    if (invDy >= 0) {
      tyMin = (rect.y - rayStart.y) * invDy;
      tyMax = (rect.y + rect.height - rayStart.y) * invDy;
    } else {
      tyMin = (rect.y + rect.height - rayStart.y) * invDy;
      tyMax = (rect.y - rayStart.y) * invDy;
    }

    if (tMin > tyMax || tyMin > tMax) return null;

    tMin = Math.max(tMin, tyMin);
    tMax = Math.min(tMax, tyMax);

    if (tMin < 0 && tMax < 0) return null;
    if (tMin > 1) return null;

    const t = tMin >= 0 ? tMin : tMax;

    if (t >= 0 && t <= 1) {
      return {
        point: {
          x: rayStart.x + t * dx,
          y: rayStart.y + t * dy
        },
        t: t
      };
    }

    return null;
  }
}