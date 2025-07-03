class Camera {
    constructor(position, rotations, zNearDefault) {
        this.position = position;
        this.rotations = rotations;
        this.zNearDefault = zNearDefault;
        this.zNear = zNearDefault;

        this.velocity = Vector3.neutral();
        this.acceleration = new Vector3(10, 10, 10);

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

        let warpFactor = 16;
        this.zNear = this.zNearDefault * (1 + (1 - sprintScale) / warpFactor);

        let movementStepX = acceleration.vectorX().rotateRad(rotations.vectorY().scaled(-1), Vector3.neutral()).scaled(sprintScale);
        let movementStepY = acceleration.vectorY().scaled(sprintScale);
        let movementStepZ = acceleration.vectorZ().rotateRad(rotations.vectorY().scaled(-1), Vector3.neutral()).scaled(sprintScale);

        if (pressedKeys["KeyA"]) {
            velocity.subtract(movementStepX);
        }
        if (pressedKeys["KeyD"]) {
            velocity.add(movementStepX);
        }
        if (pressedKeys["KeyW"]) {
            velocity.add(movementStepZ);
        }
        if (pressedKeys["KeyS"]) {
            velocity.subtract(movementStepZ);
        }
        if (pressedKeys["Space"]) {
            velocity.subtract(movementStepY);
        }
        if (pressedKeys["ShiftLeft"]) {
            velocity.add(movementStepY);
        }

        let totalVelocity = velocity.magnitude();
        if (totalVelocity > velocityMax * sprintScale) {
            velocity.scale(velocityMax * sprintScale / totalVelocity);
        }

        position.add(velocity);
        velocity.scale(friction);
    }
}

class TriangleObject {
    constructor(structure = [], vertexData = [], transformations = new ObjectTransformations(), renderSettings = new ObjectRenderSettings(), lightsourceData = new ObjectLightsourceData(), mappingSettings = new ObjectMappingSettings()) {
        this.structure = structure;
        this.vertexData = vertexData;
        this.transformations = transformations;
        this.renderSettings = renderSettings;
        this.lightsourceData = lightsourceData;

        if (vertexData.length < structure.length) {
            this.initializeBuffers(mappingSettings);
        }
    }

    initializeBuffers({vColorMap, vColorValue, vNormalMap, vTxCoordMap}) {
        let structure = this.structure;
        let dimensions = this.transformations.dimensions;
        let vertexData = [];

        for (let i = 0; i < structure.length; i++) {
            let v = structure[i];

            let vertexColor;
            let vertexNormal;
            let vertexTextureCoordinate;

            switch (vColorMap) {
                default: {
                    if (typeof vColorValue == "object") {
                        vertexColor = vColorValue.clone();
                    } else {
                        vertexColor = RGBA.value(vColorValue);
                    }

                    break;
                }
                case 1: {
                    let scaled = v.scaled(0.5).sum(Vector3.half()).scaled(255);
                    vertexColor = new RGBA(scaled.x, scaled.y, scaled.z, 255);

                    break;
                }
                case 2: {
                    let scaled = v.scaled(0.5).sum(Vector3.half()).scaled(255);
                    vertexColor = new RGBA(scaled.x, scaled.y, scaled.z, 100);

                    break;
                }
                case 3: {
                    let offset1 = 0;
                    let offset2 = 25;
                    let offset3 = 50;

                    let scaled = v.scaled(0.5).sum(Vector3.half()).product(dimensions);

                    let r = (noise.perlin3(scaled.x + offset1, scaled.y + offset2, scaled.z + offset3) * 0.5 + 0.5) * 255;
                    let g = (noise.perlin3(scaled.x + offset2, scaled.y + offset3, scaled.z + offset1) * 0.5 + 0.5) * 255;
                    let b = (noise.perlin3(scaled.x + offset3, scaled.y + offset1, scaled.z + offset2) * 0.5 + 0.5) * 255;
                    let a = (noise.perlin3(scaled.x, scaled.y, scaled.z) * 0.5 + 0.5) * 255;

                    vertexColor = new RGBA(r, g, b, a);

                    break;
                }
            }

            switch (vNormalMap) {
                default: {
                    vertexNormal = v.normalised();
                    break;
                }
                case 1: {
                    let j = i - i % 3;

                    let vert1Index = j;
                    let vert2Index;
                    let vert3Index;

                    switch (vertexType) {
                        default: {
                            vert2Index = j + 1;
                            vert3Index = j + 2;

                            break;
                        }
                        case 1: {
                            if (j & 1) {
                                vert2Index = j + 1;
                                vert3Index = j + 2;
                            } else {
                                vert2Index = j + 2;
                                vert3Index = j + 1;
                            }

                            break;
                        }
                    }

                    let vert1 = structure[vert1Index];
                    let vert2 = structure[vert2Index];
                    let vert3 = structure[vert3Index];

                    let vert1vert2 = vert1.difference(vert2);
                    let vert1vert3 = vert1.difference(vert3);

                    const triangleNormal = vert1vert2.crossProd(vert1vert3).normalised();

                    vertexNormal = triangleNormal;;

                    break;
                }
            }

            switch (vTxCoordMap) {
                default: {
                    let vNorm = v.normalised();

                    let angle1 = Math.atan2(vNorm.y, vNorm.x);
                    let angle2 = Math.asin(vNorm.z);

                    let value1 = angle1 / (2 * Math.PI) + 0.5;
                    let value2 = angle2 / Math.PI + 0.5;

                    if (!value1) {
                        vertexTextureCoordinate = Vector2.neutral();
                    } else {
                        vertexTextureCoordinate = new Vector2(value1, value2);
                    }

                    break;
                }
                case 1: {
                    vertexTextureCoordinate = v.toVector2().product(new Vector3(1, 1, 1)).sum(new Vector2(0.5)).product(new Vector3(1, -1, 1));
                    break;
                }
            }

            vertexData[i] = new VertexData(vertexColor, vertexNormal, vertexTextureCoordinate)
        }

        this.vertexData = vertexData;
    }

    getLightsource(translations = Vector3.neutral(), rotations = Vector3.neutral()) {
        let {color, diffuseIntensity, diffuseExponent, specularIntensity, specularExponent} = this.lightsourceData;

        return new Lightsource(this.transformations.position.difference(translations).rotateRad(rotations), color, diffuseIntensity, diffuseExponent, specularIntensity, specularExponent);
    }

    tick(dt = 1) {

    }
}

class ObjectTransformations {
    constructor({position = Vector3.neutral(), dimensions = Vector3.neutral(), rotations = Vector3.neutral()} = {}) {
        this.position = position;
        this.dimensions = dimensions;
        this.rotations = rotations;
    }
}

class ObjectRenderSettings {
    constructor({textureIndex = 0, vertexType = 0, attributeInterpolationMode = 0, normalInterpolationMode = 0, colorMode = 0, useLighting = 0} = {}) {
        this.textureIndex = textureIndex;
        this.vertexType = vertexType,
        this.normalInterpolationMode = normalInterpolationMode,
        this.attributeInterpolationMode = attributeInterpolationMode;
        this.colorMode = colorMode;
        this.useLighting = useLighting;       
    }
}

class ObjectLightsourceData {
    constructor({emits = false, color: lightColor = RGBA.white(), diffuseIntensity = 0, diffuseExponent = 1, specularIntensity = 0, specularExponent = 1} = {}) {
        this.emits = emits;
        this.color = lightColor;
        this.diffuseIntensity = diffuseIntensity;
        this.diffuseExponent = diffuseExponent;
        this.specularIntensity = specularIntensity;
        this.specularExponent = specularExponent;
    }
}

class ObjectMappingSettings {
    constructor({vColorMap = 0, vColorValue = 255, vNormalMap = 0, vTxCoordMap = 0} = {}) {
        this.vColorMap = vColorMap;
        this.vColorValue = vColorValue;
        this.vNormalMap = vNormalMap;
        this.vTxCoordMap = vTxCoordMap;
    }
}

class Lightsource {
    constructor(position, color, diffuseIntensity, diffuseExponent, specularIntensity, specularExponent) {
        this.position = position;
        this.color = color;
        
        this.diffuseIntensity = diffuseIntensity;
        this.diffuseExponent = diffuseExponent;

        this.specularIntensity = specularIntensity;
        this.specularExponent = specularExponent;
    }
}

class VertexData {
    constructor(color, normal, textureCoordinate) {
        this.color = color;
        this.normal = normal;
        this.textureCoordinate = textureCoordinate;
    }
}