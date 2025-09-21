/**
 * Advanced collision detection utilities for Bolo game
 * Provides shape-based collision detection beyond basic circle collisions
 */

import { Vector2D } from '../core/Vector2D';

export interface Rectangle {
  position: Vector2D;
  width: number;
  height: number;
  rotation: number;
}

export interface Circle {
  position: Vector2D;
  radius: number;
}

export interface LineSegment {
  start: Vector2D;
  end: Vector2D;
}

export interface CollisionResult {
  isColliding: boolean;
  penetration: number;
  normal: Vector2D;
  contactPoint: Vector2D;
}

export class CollisionDetection {
  // Circle-Circle collision
  static circleCircle(circle1: Circle, circle2: Circle): CollisionResult {
    const distance = circle1.position.distance(circle2.position);
    const combinedRadius = circle1.radius + circle2.radius;

    const isColliding = distance < combinedRadius;

    if (!isColliding) {
      return {
        isColliding: false,
        penetration: 0,
        normal: Vector2D.zero(),
        contactPoint: Vector2D.zero()
      };
    }

    const direction = circle2.position.subtract(circle1.position);
    const normal = distance > 0 ? direction.normalize() : Vector2D.right();
    const penetration = combinedRadius - distance;
    const contactPoint = circle1.position.add(normal.multiply(circle1.radius));

    return {
      isColliding: true,
      penetration,
      normal,
      contactPoint
    };
  }

  // Rectangle-Rectangle collision (Oriented Bounding Box)
  static rectangleRectangle(rect1: Rectangle, rect2: Rectangle): CollisionResult {
    const corners1 = this.getRectangleCorners(rect1);
    const corners2 = this.getRectangleCorners(rect2);

    const axes1 = this.getRectangleAxes(rect1);
    const axes2 = this.getRectangleAxes(rect2);

    const allAxes = [...axes1, ...axes2];
    let minOverlap = Infinity;
    let collisionAxis = Vector2D.zero();

    for (const axis of allAxes) {
      const projection1 = this.projectRectangle(corners1, axis);
      const projection2 = this.projectRectangle(corners2, axis);

      const overlap = this.getOverlap(projection1, projection2);

      if (overlap <= 0) {
        return {
          isColliding: false,
          penetration: 0,
          normal: Vector2D.zero(),
          contactPoint: Vector2D.zero()
        };
      }

      if (overlap < minOverlap) {
        minOverlap = overlap;
        collisionAxis = axis;
      }
    }

    // Ensure normal points from rect1 to rect2
    const centerDirection = rect2.position.subtract(rect1.position);
    if (centerDirection.dot(collisionAxis) < 0) {
      collisionAxis = collisionAxis.multiply(-1);
    }

    const contactPoint = this.findContactPoint(corners1, corners2, collisionAxis);

    return {
      isColliding: true,
      penetration: minOverlap,
      normal: collisionAxis,
      contactPoint
    };
  }

  // Circle-Rectangle collision
  static circleRectangle(circle: Circle, rect: Rectangle): CollisionResult {
    // Transform circle to rectangle's local space
    const localCircle = this.transformToLocalSpace(circle.position, rect);

    // Find closest point on rectangle to circle center
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const closestX = Math.max(-halfWidth, Math.min(halfWidth, localCircle.x));
    const closestY = Math.max(-halfHeight, Math.min(halfHeight, localCircle.y));
    const closestPoint = new Vector2D(closestX, closestY);

    // Transform back to world space
    const worldClosestPoint = this.transformToWorldSpace(closestPoint, rect);

    // Check distance
    const distance = circle.position.distance(worldClosestPoint);
    const isColliding = distance < circle.radius;

    if (!isColliding) {
      return {
        isColliding: false,
        penetration: 0,
        normal: Vector2D.zero(),
        contactPoint: Vector2D.zero()
      };
    }

    const direction = circle.position.subtract(worldClosestPoint);
    const normal = distance > 0 ? direction.normalize() : Vector2D.up();
    const penetration = circle.radius - distance;

    return {
      isColliding: true,
      penetration,
      normal,
      contactPoint: worldClosestPoint
    };
  }

  // Line-Circle collision (for raycast projectiles)
  static lineCircle(line: LineSegment, circle: Circle): CollisionResult {
    const lineVector = line.end.subtract(line.start);
    const toCircle = circle.position.subtract(line.start);

    const projection = toCircle.dot(lineVector) / lineVector.magnitudeSquared();
    const clampedProjection = Math.max(0, Math.min(1, projection));

    const closestPoint = line.start.add(lineVector.multiply(clampedProjection));
    const distance = circle.position.distance(closestPoint);

    const isColliding = distance <= circle.radius;

    if (!isColliding) {
      return {
        isColliding: false,
        penetration: 0,
        normal: Vector2D.zero(),
        contactPoint: Vector2D.zero()
      };
    }

    const direction = circle.position.subtract(closestPoint);
    const normal = distance > 0 ? direction.normalize() : Vector2D.up();
    const penetration = circle.radius - distance;

    return {
      isColliding: true,
      penetration,
      normal,
      contactPoint: closestPoint
    };
  }

  // Line-Rectangle collision
  static lineRectangle(line: LineSegment, rect: Rectangle): CollisionResult {
    const corners = this.getRectangleCorners(rect);
    const edges = [
      { start: corners[0], end: corners[1] },
      { start: corners[1], end: corners[2] },
      { start: corners[2], end: corners[3] },
      { start: corners[3], end: corners[0] }
    ];

    let closestCollision: CollisionResult | null = null;
    let minDistance = Infinity;

    for (const edge of edges) {
      const intersection = this.lineLineIntersection(line, edge);

      if (intersection) {
        const distance = line.start.distance(intersection);
        if (distance < minDistance) {
          minDistance = distance;

          const edgeVector = edge.end.subtract(edge.start);
          const normal = edgeVector.perpendicular().normalize();

          closestCollision = {
            isColliding: true,
            penetration: 0, // Line intersections don't have penetration
            normal,
            contactPoint: intersection
          };
        }
      }
    }

    return closestCollision || {
      isColliding: false,
      penetration: 0,
      normal: Vector2D.zero(),
      contactPoint: Vector2D.zero()
    };
  }

  // Sweep collision detection for moving objects
  static sweepCircleCircle(
    circle1: Circle, velocity1: Vector2D,
    circle2: Circle, velocity2: Vector2D,
    deltaTime: number
  ): { collision: CollisionResult; timeOfImpact: number } | null {

    const relativeVelocity = velocity1.subtract(velocity2);
    const relativePosition = circle1.position.subtract(circle2.position);
    const combinedRadius = circle1.radius + circle2.radius;

    // Quadratic equation coefficients for collision time
    const a = relativeVelocity.magnitudeSquared();
    const b = 2 * relativePosition.dot(relativeVelocity);
    const c = relativePosition.magnitudeSquared() - combinedRadius * combinedRadius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0 || a === 0) {
      return null; // No collision
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    const t2 = (-b + sqrtDiscriminant) / (2 * a);

    const timeOfImpact = t1 >= 0 ? t1 : t2;

    if (timeOfImpact < 0 || timeOfImpact > deltaTime) {
      return null; // Collision is in the past or future beyond this frame
    }

    // Calculate collision position and normal
    const collisionPos1 = circle1.position.add(velocity1.multiply(timeOfImpact));
    const collisionPos2 = circle2.position.add(velocity2.multiply(timeOfImpact));

    const collisionCircle1 = { position: collisionPos1, radius: circle1.radius };
    const collisionCircle2 = { position: collisionPos2, radius: circle2.radius };

    const collision = this.circleCircle(collisionCircle1, collisionCircle2);

    return { collision, timeOfImpact };
  }

  // Utility methods
  private static getRectangleCorners(rect: Rectangle): Vector2D[] {
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const corners = [
      new Vector2D(-halfWidth, -halfHeight),
      new Vector2D(halfWidth, -halfHeight),
      new Vector2D(halfWidth, halfHeight),
      new Vector2D(-halfWidth, halfHeight)
    ];

    // Rotate and translate corners
    return corners.map(corner =>
      this.transformToWorldSpace(corner, rect)
    );
  }

  private static getRectangleAxes(rect: Rectangle): Vector2D[] {
    const rightVector = Vector2D.fromAngle(rect.rotation);
    const upVector = Vector2D.fromAngle(rect.rotation + Math.PI / 2);

    return [rightVector, upVector];
  }

  private static projectRectangle(corners: Vector2D[], axis: Vector2D): { min: number; max: number } {
    let min = corners[0].dot(axis);
    let max = min;

    for (let i = 1; i < corners.length; i++) {
      const projection = corners[i].dot(axis);
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }

    return { min, max };
  }

  private static getOverlap(proj1: { min: number; max: number }, proj2: { min: number; max: number }): number {
    return Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
  }

  private static findContactPoint(corners1: Vector2D[], corners2: Vector2D[], normal: Vector2D): Vector2D {
    // Find the corner of rect1 that's furthest along the collision normal
    let maxProjection = -Infinity;
    let contactPoint = Vector2D.zero();

    for (const corner of corners1) {
      const projection = corner.dot(normal);
      if (projection > maxProjection) {
        maxProjection = projection;
        contactPoint = corner;
      }
    }

    return contactPoint;
  }

  private static transformToLocalSpace(worldPoint: Vector2D, rect: Rectangle): Vector2D {
    const translated = worldPoint.subtract(rect.position);
    return translated.rotate(-rect.rotation);
  }

  private static transformToWorldSpace(localPoint: Vector2D, rect: Rectangle): Vector2D {
    const rotated = localPoint.rotate(rect.rotation);
    return rotated.add(rect.position);
  }

  private static lineLineIntersection(line1: LineSegment, line2: LineSegment): Vector2D | null {
    const p1 = line1.start;
    const p2 = line1.end;
    const p3 = line2.start;
    const p4 = line2.end;

    const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

    if (Math.abs(denominator) < 1e-10) {
      return null; // Lines are parallel
    }

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denominator;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new Vector2D(
        p1.x + t * (p2.x - p1.x),
        p1.y + t * (p2.y - p1.y)
      );
    }

    return null; // No intersection
  }

  // Specialized game collision checks
  static tankTankCollision(
    tank1Pos: Vector2D, tank1Rotation: number,
    tank2Pos: Vector2D, tank2Rotation: number
  ): CollisionResult {
    const rect1: Rectangle = {
      position: tank1Pos,
      width: 32,
      height: 32,
      rotation: tank1Rotation
    };

    const rect2: Rectangle = {
      position: tank2Pos,
      width: 32,
      height: 32,
      rotation: tank2Rotation
    };

    return this.rectangleRectangle(rect1, rect2);
  }

  static projectileTerrainCollision(
    projectilePos: Vector2D, projectileRadius: number,
    terrainTiles: Vector2D[]
  ): CollisionResult {
    const projectileCircle: Circle = {
      position: projectilePos,
      radius: projectileRadius
    };

    for (const tilePos of terrainTiles) {
      const tileRect: Rectangle = {
        position: tilePos,
        width: 32,
        height: 32,
        rotation: 0
      };

      const result = this.circleRectangle(projectileCircle, tileRect);
      if (result.isColliding) {
        return result;
      }
    }

    return {
      isColliding: false,
      penetration: 0,
      normal: Vector2D.zero(),
      contactPoint: Vector2D.zero()
    };
  }

  // Broad phase collision detection
  static broadPhaseAABB(entities: { position: Vector2D; size: number }[]): { a: number; b: number }[] {
    const pairs: { a: number; b: number }[] = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        const distance = entityA.position.distance(entityB.position);
        const combinedSize = entityA.size + entityB.size;

        if (distance < combinedSize * 1.5) { // Broad phase threshold
          pairs.push({ a: i, b: j });
        }
      }
    }

    return pairs;
  }

  // Spatial hash for efficient collision detection
  static createSpatialHash(entities: { id: string; position: Vector2D; size: number }[], cellSize: number): Map<string, string[]> {
    const hash = new Map<string, string[]>();

    for (const entity of entities) {
      const minX = Math.floor((entity.position.x - entity.size) / cellSize);
      const maxX = Math.floor((entity.position.x + entity.size) / cellSize);
      const minY = Math.floor((entity.position.y - entity.size) / cellSize);
      const maxY = Math.floor((entity.position.y + entity.size) / cellSize);

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const key = `${x},${y}`;

          if (!hash.has(key)) {
            hash.set(key, []);
          }

          hash.get(key)!.push(entity.id);
        }
      }
    }

    return hash;
  }
}