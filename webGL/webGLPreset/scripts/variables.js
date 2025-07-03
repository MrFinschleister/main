let skyDepth = 5000;

let terrainAttributeObject;
let skyAttributeObject;

let data1f = {
    uTick: 0,
    uFoV: Math.PI / 2,
    uZNear: 0.1,
    uZFar: skyDepth * 10,
};

let data3fv = {
    uCameraPosition: Vector3.neutral(),
    uCameraRotations: Vector3.neutral(),
};

let data4fv = {
    uTerrainColor: new Vector4(0.1, 0.9, 0.5, 1),
    uSkyColor: new Vector4(0.3, 0.6, 0.9, 1),
};