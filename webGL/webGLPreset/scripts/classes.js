class Camera {
    constructor(position, rotations) {
        this.position = position;
        this.rotations = rotations;

        this.velocityMax = 5;
        this.friction = 0.95;

        this.velocity = Vector3.neutral();
        this.acceleration = new Vector3(this.velocityMax / 2);

        this.setup();
        
        this.readingMouse = true;
    }

    toggleReadingMouse() {
        this.readingMouse = !this.readingMouse;
    }

    stopReadingMouse() {
        this.readingMouse = false;
    }

    startReadingMouse() {
        this.readingMouse = true;
    }

    setup() {
        this.pressedKeys = {};

        this.mouseListener = new MouseListener(document.body, 
            {
                mousemove: (e) => {
                    if (!this.readingMouse) {
                        return;
                    }
                    
                    let totalRotation = Math.PI * 2;

                    let locX = e.movementX;
                    let locY = e.movementY;
                    let ratioX = locX / document.body.clientWidth;
                    let ratioY = locY / document.body.clientHeight;

                    let rotationVector = new Vector3(ratioY, ratioX, 0.0).scaled(totalRotation);

                    this.rotations.add(rotationVector);

                    if (this.rotations.x > Math.PI / 2) {
                        this.rotations.x = Math.PI / 2;
                    } else if (this.rotations.x < -Math.PI / 2) {
                        this.rotations.x = -Math.PI / 2;
                    }
                }
            }
        );

        this.keyboardListener = new KeyboardListener(document.body,
            {
                keydown: async (e) => {
                    let code = e.code;

                    if (e.altKey) {
                        e.preventDefault();
                    }

                    if (code == "KeyF") {
                        if (document.fullscreenElement) {
                            await document.exitFullscreen();
                            document.exitPointerLock();
                        } else {
                            await document.body.requestFullscreen();
                            await document.body.requestPointerLock();
                        }
                    } else if (code == "Backquote") {
                        Terminal.toggleVisibility();
                    } else if (code == "Backspace") {
                        this.toggleReadingMouse();
                    }

                    this.pressedKeys[code] = true;
                },
                keyup: (e) => {
                    let code = e.code;

                    if (e.altKey) {
                        e.preventDefault();
                    }

                    this.pressedKeys[code] = false;
                }
            }
        );
    }

    tick() {
        let position = this.position;
        let rotations = this.rotations;
        let velocity = this.velocity;
        let acceleration = this.acceleration;
        let pressedKeys = this.pressedKeys;

        let sprintScale = pressedKeys["AltLeft"] ? 2 : 1;

        let movementStepX = acceleration.vectorX().rotateRad(rotations.vectorY(), Vector3.neutral()).scaled(sprintScale);
        let movementStepY = acceleration.vectorY().scaled(sprintScale);
        let movementStepZ = acceleration.vectorZ().rotateRad(rotations.vectorY(), Vector3.neutral()).scaled(sprintScale);

        if (pressedKeys["KeyA"]) {
            velocity.add(movementStepX);
        }
        if (pressedKeys["KeyD"]) {
            velocity.subtract(movementStepX);
        }
        if (pressedKeys["KeyW"]) {
            velocity.add(movementStepZ);
        }
        if (pressedKeys["KeyS"]) {
            velocity.subtract(movementStepZ);
        }
        if (pressedKeys["ShiftLeft"]) {
            velocity.add(movementStepY);
        }
        if (pressedKeys["Space"]) {
            velocity.subtract(movementStepY);
        }

        let totalVelocity = velocity.magnitude();
        if (totalVelocity > this.velocityMax * sprintScale) {
            velocity.scale(this.velocityMax * sprintScale / totalVelocity);
        }

        position.add(velocity);
        velocity.scale(this.friction);
    }
}