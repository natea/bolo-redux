/**
 * 2D Vector class for position and velocity calculations
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Create a copy of this vector
    clone() {
        return new Vector2D(this.x, this.y);
    }

    // Add another vector to this one
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    // Subtract another vector from this one
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    // Multiply by a scalar
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // Divide by a scalar
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    // Get the magnitude (length) of the vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Get the squared magnitude (faster than magnitude for comparisons)
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // Normalize the vector (make it unit length)
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }

    // Get a normalized copy of this vector
    normalized() {
        return this.clone().normalize();
    }

    // Calculate distance to another vector
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate squared distance to another vector (faster for comparisons)
    distanceToSquared(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return dx * dx + dy * dy;
    }

    // Get the angle of this vector in radians
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // Calculate angle to another vector
    angleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    // Rotate the vector by an angle (in radians)
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    // Get dot product with another vector
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    // Get cross product with another vector (returns scalar in 2D)
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    // Limit the magnitude of the vector
    limit(max) {
        if (this.magnitudeSquared() > max * max) {
            this.normalize().multiply(max);
        }
        return this;
    }

    // Linear interpolation towards another vector
    lerp(vector, t) {
        this.x += (vector.x - this.x) * t;
        this.y += (vector.y - this.y) * t;
        return this;
    }

    // Set the vector values
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    // Set from another vector
    setFrom(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    // Reset to zero
    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    // Check if vector is zero
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    // String representation
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // Static methods for creating vectors
    static zero() {
        return new Vector2D(0, 0);
    }

    static up() {
        return new Vector2D(0, -1);
    }

    static down() {
        return new Vector2D(0, 1);
    }

    static left() {
        return new Vector2D(-1, 0);
    }

    static right() {
        return new Vector2D(1, 0);
    }

    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }

    static fromPolar(radius, angle) {
        return new Vector2D(
            radius * Math.cos(angle),
            radius * Math.sin(angle)
        );
    }

    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }

    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }

    static multiply(vector, scalar) {
        return new Vector2D(vector.x * scalar, vector.y * scalar);
    }

    static distance(v1, v2) {
        return v1.distanceTo(v2);
    }

    static random() {
        return new Vector2D(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();
    }

    static randomInCircle(radius = 1) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        return Vector2D.fromPolar(r, angle);
    }
}