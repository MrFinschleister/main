let glcanvas = document.getElementById('glcanvas');
let gl;

let interval;
let tickRate = 16;
let dt = 1;

let camera;

function onload() {
    try {
        Terminal.init();
        Terminal.hide();

        canvasSetup();
        setListeners();
        setup();
        start();
    } catch (error) {
        alert(error.stack);
    }
}

function canvasSetup() {
    glcanvas.width = glcanvas.clientWidth;
    glcanvas.height = glcanvas.clientHeight;

    gl = glcanvas.getContext('webgl2');
}

function setup() {
    camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

    initTerrain(gl);
    initSky(gl);
}

function initTerrain(gl) {
    let noise = new Noise(0);
    noise.settings(1, 1.3, 1, 0.8, 256, 1, 1);

    let terrainPositions = [];
    let terrainColors = [];
    let terrainNormals = [];

    let width = 500;
    let height = 50;
    let depth = 500;
    let centerX = 0;
    let centerY = -50;
    let centerZ = 0;
    let bisections = 8;

    let step = 0.0001;

    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let terrainMesh = generatePlaneTriangles(width, 0, depth, centerX, centerY, centerZ, bisections);

    for (let i = 0; i < terrainMesh.length; i++) {
        let vert = terrainMesh[i];
        let posX = vert.sum(new Vector3(step, 0, 0));
        let posZ = vert.sum(new Vector3(0, 0, step));

        let pointValue = (noise.perlin(vert.x, vert.z) * 0.5 + 0.5) * height;
        let pointValueX = (noise.perlin(posX.x, posX.z) * 0.5 + 0.5) * height;
        let pointValueZ = (noise.perlin(posZ.x, posZ.z) * 0.5 + 0.5) * height;

        let newV1 = vert.sum(new Vector3(0, pointValue, 0));
        let newV2 = posX.sum(new Vector3(0, pointValueX, 0));
        let newV3 = posZ.sum(new Vector3(0, pointValueZ, 0));

        let normal = newV2.difference(newV1).normalised().crossProd(newV3.difference(newV1).normalised()).normalised();

        terrainPositions.push(...newV1.array());
        terrainColors.push(...data4fv.uTerrainColor.array());
        terrainNormals.push(...normal.array());
    }

    terrainAttributeObject = {
        locations: ["aVertexPosition", "aVertexColor", "aVertexNormal"],
        "aVertexPosition": {
            buffer: terrainPositions,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexColor": {
            buffer: terrainColors,

            numComponents: 4, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexNormal": {
            buffer: terrainNormals,

            numComponents: 3,
            type: gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0,
        },
        vertexCount: terrainMesh.length,
    }

    initBuffers(gl, terrainAttributeObject);
}

function initSky(gl) {
    let skyPositions = [];
    let skyColors = [];

    let skyMesh = getSkyMesh();

    for (let i = 0; i < skyMesh.length; i++) {
        skyPositions.push(...skyMesh[i].array());
        skyColors.push(...data4fv.uSkyColor.array());
    }
    
    skyAttributeObject = {
        locations: ["aVertexPosition", "aVertexColor"],
        "aVertexPosition": {
            buffer: skyPositions,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexColor": {
            buffer: skyColors,

            numComponents: 4, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        vertexCount: skyMesh.length,
    }

    initBuffers(gl, skyAttributeObject);
}

function getSkyMesh() {
    return generateIcosphereTriangles(skyDepth * 2, skyDepth * 2, skyDepth * 2, 0, 0, 0, 0);
}

function setListeners() {
    document.body.addEventListener("fullscreenchange", (e) => {
        glcanvas.width = glcanvas.clientWidth;
        glcanvas.height = glcanvas.clientHeight;
        gl.viewport(0, 0, glcanvas.width, glcanvas.height);
    });
}

function start() {
    interval = setInterval(function() {
        try {
            tick();
        } catch (error) {
            Terminal.error(error); 
        }
    }, tickRate);
}

function tick() {
    Terminal.clear();

    camera.tick();

    update();
    render();
}

function update() {
    data3fv.uCameraPosition = camera.position;
    data3fv.uCameraRotations = camera.rotations;
}