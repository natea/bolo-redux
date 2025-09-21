/**
 * 2D Vector mathematics for game physics
 * Provides essential vector operations for movement, collision, and physics calculations
 */

export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Static factory methods
  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static one(): Vector2D {
    return new Vector2D(1, 1);
  }

  static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  static right(): Vector2D {
    return new Vector2D(1, 0);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }

  // Basic operations
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  addInPlace(other: Vector2D): Vector2D {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  subtractInPlace(other: Vector2D): Vector2D {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  multiplyInPlace(scalar: number): Vector2D {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar: number): Vector2D {
    if (scalar === 0) throw new Error("Division by zero");
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  divideInPlace(scalar: number): Vector2D {
    if (scalar === 0) throw new Error("Division by zero");
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  // Vector properties
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return Vector2D.zero();
    return this.divide(mag);
  }

  normalizeInPlace(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  // Vector math operations
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  cross(other: Vector2D): number {
    return this.x * other.y - this.y * other.x;
  }

  distance(other: Vector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceSquared(other: Vector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleTo(other: Vector2D): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  // Rotation
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  rotateInPlace(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  // Interpolation
  lerp(other: Vector2D, t: number): Vector2D {
    return new Vector2D(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  lerpInPlace(other: Vector2D, t: number): Vector2D {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    return this;
  }

  // Utility methods
  clamp(min: Vector2D, max: Vector2D): Vector2D {
    return new Vector2D(
      Math.max(min.x, Math.min(max.x, this.x)),
      Math.max(min.y, Math.min(max.y, this.y))
    );
  }

  clampMagnitude(maxLength: number): Vector2D {
    const mag = this.magnitude();
    if (mag > maxLength) {
      return this.normalize().multiply(maxLength);
    }
    return this.clone();
  }

  reflect(normal: Vector2D): Vector2D {
    const normalizedNormal = normal.normalize();
    return this.subtract(normalizedNormal.multiply(2 * this.dot(normalizedNormal)));
  }

  perpendicular(): Vector2D {
    return new Vector2D(-this.y, this.x);
  }

  // Comparison
  equals(other: Vector2D, tolerance: number = 0.0001): boolean {
    return Math.abs(this.x - other.x) < tolerance &&
           Math.abs(this.y - other.y) < tolerance;
  }

  // String representation
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // Serialization
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  static fromArray(arr: [number, number]): Vector2D {
    return new Vector2D(arr[0], arr[1]);
  }

  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  static fromObject(obj: { x: number; y: number }): Vector2D {
    return new Vector2D(obj.x, obj.y);
  }
}