let canvas;
let ctx;

let objectiveBenchmarker;
let iterationBenchmarker;
let camera;
let noiseTexture;

let loop;
let tickRate = 16;
let tick = 0;
let resetTicks = 100;

let resolutionScale = 1;
let sourceWidth = 1920;

let ambientIntensity = 0.25;
let zNearDefault = -500;

let velocityMax = 10;
let friction = 0.9;

let w1Tolerance = 0;
let w2Tolerance = 0;
let w3Tolerance = 0.01;

let noise = new Noise(0);
noise.settings(1, 2.5, 1, 0.25, 32, 5, 1);
// frequency, roughness, amplitude, persistence, cellSize, octaves, contrast

let defaultIcosphere = () => {return generateIcosphereTriangles(1, 1, 1, 0, 0, 0, 3)};

let objects = [

    new TriangleObject(
        generateIcosphereTriangles(1, 1, 1, 0, 0, 0, 1),
        [],
        new ObjectTransformations({
            position: new Vector3(1500, -1000, 0),
            dimensions: new Vector3(25),
            rotations: new Vector3(0, 0, 0),
        }),
        settingsPresets.icosphereNolighting,
        lightsourcePresets.basic,
        mappingPresets.icosphereWhite,
    ),
];

let textures = [];

function setCanvasDimensions(width, height) {
    canvas.width = width * resolutionScale;
    canvas.height = height * resolutionScale;

    Terminal.print("Canvas dimensions set to " + canvas.width + "*" + canvas.height);
}

function changeResolution(newResolutionScale) {
    resolutionScale = newResolutionScale;
    setCanvasDimensions(canvas.clientWidth, canvas.clientHeight);
}

function changeZNear(newZNear) {
    zNearDefault = newZNear;
}

function onload() {
    try {
        Terminal.init();

        setup();
        startLoop();
    } catch (error) {
        alert(error.stack);
    }
}

function setup() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    setCanvasDimensions(canvas.clientWidth, canvas.clientHeight);
    setListeners();
    initTextures();
    initObjects();

    document.getElementById('resolutionSlider').value = resolutionScale;

    camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0), zNearDefault);

    objectiveBenchmarker = new Benchmarker("Objective Time");
    iterationBenchmarker = new Benchmarker("Iteration Time");
}

function setListeners() {
    document.body.addEventListener("fullscreenchange", (e) => {
        setCanvasDimensions(canvas.clientWidth, canvas.clientHeight);
    });
}

function initTextures() {
    let noiseBufferWidth = 512;
    let noiseBufferHeight = 512;

    noiseTexture = noise.perlinBuffer(noiseBufferWidth, noiseBufferHeight, 0.5, 0.5)

    textures = [
        new Texture2D(
            noiseBufferWidth, noiseBufferHeight,
            Array.from(new Array(noiseBufferWidth * noiseBufferHeight)).map((val, index) => {
                let noiseVal = noiseTexture[index] * 0.5 + 0.5;
                
                return RGBA.brightness(noiseVal * 255);
            })
        ),
    ];
}

function initObjects() {
    let numObjects = 0;
    let numFaces = 9;
    let numBisections = 1;
    let rangeX = 1000;
    let rangeY = 1000;
    let rangeZ = 1000;
    let startX = rangeX / -2;
    let startY = rangeY / -2;
    let startZ = 1000;

    let dims = new Vector3(50);

    for (let i = 0; i < numObjects; i++) {
        let rand = Math.floor(Math.random() * 4);

        let objectStructure = generateIcosphereTriangles(1, 1, 1, 0, 0, 0, numBisections);
        let mappingPreset;

        if (rand == 0) {
            mappingPreset = mappingPresets.icosphere;
        } else if (rand == 1) {
            mappingPreset = mappingPresets.icosphereRed;
        } else if (rand == 2) {
            mappingPreset = mappingPresets.icosphereGreen;
        } else if (rand == 3) {
            mappingPreset = mappingPresets.icosphereBlue;
        }

        let loc = new Vector3(startX + Math.random() * rangeX, startY + Math.random() * rangeY, startZ + Math.random() * rangeZ);
        let rots = new Vector3(0, 0, 0);

        let newTriangleObject = new TriangleObject(
            objectStructure, 
            loc, 
            dims,
            rots,
            settingsPresets.icosphere,
            mappingPreset,
            lightsourcePresets.all,
        );

        objects.push(newTriangleObject);
    }
}

function startLoop() {
    loop = setInterval(function() {
        try {            
            iterationBenchmarker.updateCurrentTime();

    	    Terminal.clear();

            update();
            draw();

            tick++;
        } catch (error) {
            alert(error.stack);
        }
    }, tickRate);
}

function update() {
    camera.tick();

    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];

        object.tick();
    }
}