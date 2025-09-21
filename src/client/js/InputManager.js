/**
 * InputManager handles all user input for WASD movement, mouse controls, and other interactions
 */
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            isDown: false,
            button: -1
        };

        // Input state
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.shooting = {
            isShooting: false,
            lastShot: 0,
            shootCooldown: 100 // ms between shots
        };

        // Event handlers
        this.eventHandlers = {
            'move': [],
            'shoot': [],
            'aim': [],
            'keyDown': [],
            'keyUp': [],
            'mouseDown': [],
            'mouseUp': [],
            'mouseMove': [],
            'wheel': []
        };

        // Settings
        this.mouseSensitivity = 1.0;
        this.invertY = false;
        this.enableKeyRepeat = false;

        // Mobile support
        this.isMobile = this.detectMobile();
        this.touches = {};

        this.initializeEventListeners();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    initializeEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Context menu disable (right-click)
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Focus management
        this.canvas.addEventListener('mouseenter', () => this.canvas.focus());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

        // Touch events for mobile
        if (this.isMobile) {
            this.initializeTouchControls();
        }

        // Window focus/blur
        window.addEventListener('blur', () => this.handleWindowBlur());
        window.addEventListener('focus', () => this.handleWindowFocus());

        // Make canvas focusable
        this.canvas.tabIndex = 0;
    }

    initializeTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));

        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
        this.canvas.addEventListener('touchend', (e) => e.preventDefault());
    }

    // Keyboard handling
    handleKeyDown(event) {
        const key = event.code || event.key;

        if (!this.enableKeyRepeat && this.keys[key]) {
            return; // Ignore key repeat
        }

        this.keys[key] = true;
        this.updateMovementState();

        // Handle special keys
        this.handleSpecialKeys(key, true);

        // Emit key down event
        this.emit('keyDown', { key: key, event: event });
    }

    handleKeyUp(event) {
        const key = event.code || event.key;
        this.keys[key] = false;
        this.updateMovementState();

        // Handle special keys
        this.handleSpecialKeys(key, false);

        // Emit key up event
        this.emit('keyUp', { key: key, event: event });
    }

    handleSpecialKeys(key, isDown) {
        switch (key) {
            case 'Space':
                if (isDown) {
                    this.attemptShoot();
                }
                break;

            case 'Escape':
                if (isDown) {
                    this.emit('menu', {});
                }
                break;

            case 'Tab':
                if (isDown) {
                    this.emit('scoreboard', { show: true });
                } else {
                    this.emit('scoreboard', { show: false });
                }
                break;

            case 'Enter':
                if (isDown) {
                    this.emit('chat', {});
                }
                break;

            // Debug keys
            case 'F1':
                if (isDown) {
                    this.emit('debug', { toggle: 'info' });
                }
                break;

            case 'F2':
                if (isDown) {
                    this.emit('debug', { toggle: 'grid' });
                }
                break;
        }
    }

    updateMovementState() {
        const newMovement = {
            forward: this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp'),
            backward: this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown'),
            left: this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft'),
            right: this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')
        };

        // Check if movement changed
        const changed = Object.keys(newMovement).some(key =>
            newMovement[key] !== this.movement[key]
        );

        this.movement = newMovement;

        if (changed) {
            this.emit('move', this.movement);
        }
    }

    // Mouse handling
    handleMouseDown(event) {
        event.preventDefault();
        this.canvas.focus();

        this.mouse.isDown = true;
        this.mouse.button = event.button;

        this.updateMousePosition(event);

        // Left click = shoot
        if (event.button === 0) {
            this.attemptShoot();
        }

        this.emit('mouseDown', {
            button: event.button,
            x: this.mouse.x,
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });
    }

    handleMouseUp(event) {
        this.mouse.isDown = false;
        this.mouse.button = -1;

        this.updateMousePosition(event);

        this.emit('mouseUp', {
            button: event.button,
            x: this.mouse.x,
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });
    }

    handleMouseMove(event) {
        this.updateMousePosition(event);

        this.emit('mouseMove', {
            x: this.mouse.x,
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });

        this.emit('aim', {
            x: this.mouse.worldX,
            y: this.mouse.worldY
        });
    }

    handleMouseLeave() {
        this.mouse.isDown = false;
        this.mouse.button = -1;
    }

    handleWheel(event) {
        event.preventDefault();

        const delta = event.deltaY > 0 ? -0.1 : 0.1;

        this.emit('wheel', {
            delta: delta,
            x: this.mouse.x,
            y: this.mouse.y
        });
    }

    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;

        // Emit aim event for world coordinates (will be calculated by game)
        this.emit('aim', {
            screenX: this.mouse.x,
            screenY: this.mouse.y
        });
    }

    // Touch handling for mobile
    handleTouchStart(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches[touch.identifier] = {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now()
            };

            // First touch is movement, second touch is shooting
            if (Object.keys(this.touches).length === 1) {
                this.handleMovementTouch(touch);
            } else if (Object.keys(this.touches).length === 2) {
                this.handleShootingTouch(touch);
            }
        }
    }

    handleTouchMove(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchData = this.touches[touch.identifier];

            if (touchData) {
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;

                // Update movement or aiming based on touch
                this.updateTouchControls();
            }
        }
    }

    handleTouchEnd(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            delete this.touches[touch.identifier];
        }

        this.updateTouchControls();
    }

    handleMovementTouch(touch) {
        // Virtual joystick for movement
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width * 0.2;
        const centerY = rect.height * 0.8;

        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 50) {
            const angle = Math.atan2(deltaY, deltaX);
            this.updateMovementFromAngle(angle);
        }
    }

    handleShootingTouch(touch) {
        // Touch to aim and shoot
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;

        this.emit('aim', {
            screenX: this.mouse.x,
            screenY: this.mouse.y
        });

        this.attemptShoot();
    }

    updateTouchControls() {
        if (Object.keys(this.touches).length === 0) {
            // No touches, stop movement
            this.movement = {
                forward: false,
                backward: false,
                left: false,
                right: false
            };
            this.emit('move', this.movement);
        }
    }

    updateMovementFromAngle(angle) {
        // Convert angle to movement directions
        const threshold = Math.PI / 4; // 45 degrees

        this.movement = {
            forward: angle > -threshold && angle < threshold,
            backward: angle > Math.PI - threshold || angle < -Math.PI + threshold,
            left: angle > Math.PI / 2 - threshold && angle < Math.PI / 2 + threshold,
            right: angle > -Math.PI / 2 - threshold && angle < -Math.PI / 2 + threshold
        };

        this.emit('move', this.movement);
    }

    // Shooting
    attemptShoot() {
        const now = Date.now();
        if (now - this.shooting.lastShot >= this.shooting.shootCooldown) {
            this.shooting.lastShot = now;
            this.shooting.isShooting = true;

            this.emit('shoot', {
                x: this.mouse.worldX,
                y: this.mouse.worldY
            });

            // Reset shooting flag after brief delay
            setTimeout(() => {
                this.shooting.isShooting = false;
            }, 50);
        }
    }

    // Window focus handling
    handleWindowBlur() {
        // Clear all keys when window loses focus
        this.keys = {};
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        this.mouse.isDown = false;
        this.touches = {};

        this.emit('move', this.movement);
    }

    handleWindowFocus() {
        // Reset input state when window gains focus
        this.keys = {};
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
    }

    // Utility methods
    isKeyPressed(key) {
        return !!this.keys[key];
    }

    isAnyKeyPressed(...keys) {
        return keys.some(key => this.isKeyPressed(key));
    }

    setMouseWorldPosition(worldX, worldY) {
        this.mouse.worldX = worldX;
        this.mouse.worldY = worldY;
    }

    getMovementState() {
        return { ...this.movement };
    }

    getMouseState() {
        return { ...this.mouse };
    }

    // Settings
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
    }

    setInvertY(invert) {
        this.invertY = invert;
    }

    setKeyRepeat(enable) {
        this.enableKeyRepeat = enable;
    }

    // Event system
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index !== -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in input handler for ${event}:`, error);
                }
            });
        }
    }

    // Mobile virtual controls UI (optional)
    createVirtualControls() {
        if (!this.isMobile) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'virtual-controls';
        controlsContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            pointer-events: none;
            z-index: 1000;
        `;

        // Movement joystick
        const joystick = document.createElement('div');
        joystick.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 2px solid #00ff00;
            background: rgba(0, 255, 0, 0.1);
            pointer-events: auto;
        `;

        // Shoot button
        const shootButton = document.createElement('div');
        shootButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid #ff0000;
            background: rgba(255, 0, 0, 0.1);
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff0000;
            font-weight: bold;
        `;
        shootButton.textContent = 'FIRE';

        controlsContainer.appendChild(joystick);
        controlsContainer.appendChild(shootButton);
        document.body.appendChild(controlsContainer);

        // Add touch handlers for virtual controls
        this.setupVirtualControlHandlers(joystick, shootButton);
    }

    setupVirtualControlHandlers(joystick, shootButton) {
        // Joystick handling
        let joystickActive = false;

        joystick.addEventListener('touchstart', (e) => {
            joystickActive = true;
            e.preventDefault();
        });

        joystick.addEventListener('touchmove', (e) => {
            if (joystickActive) {
                const rect = joystick.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const touch = e.touches[0];

                const deltaX = touch.clientX - centerX;
                const deltaY = touch.clientY - centerY;
                const angle = Math.atan2(deltaY, deltaX);

                this.updateMovementFromAngle(angle);
                e.preventDefault();
            }
        });

        joystick.addEventListener('touchend', () => {
            joystickActive = false;
            this.movement = {
                forward: false,
                backward: false,
                left: false,
                right: false
            };
            this.emit('move', this.movement);
        });

        // Shoot button handling
        shootButton.addEventListener('touchstart', (e) => {
            this.attemptShoot();
            e.preventDefault();
        });
    }

    // Cleanup
    destroy() {
        // Remove all event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        // Clear virtual controls
        const virtualControls = document.getElementById('virtual-controls');
        if (virtualControls) {
            virtualControls.remove();
        }
    }

    toString() {
        return `InputManager(mobile: ${this.isMobile}, keys: ${Object.keys(this.keys).length})`;
    }
}