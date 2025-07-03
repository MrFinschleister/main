function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawTerrain(gl);
    drawSky(gl);
}

function drawTerrain(gl) {
    let programInfo = getShaderProgram(gl, terrainVert, terrainFrag, terrainAttributeObject);
    finaliseProgram(programInfo, terrainAttributeObject);

    let FoV = data1f.uFoV;
    let aspect = gl.canvas.width / gl.canvas.height;
    let zNear = data1f.uZNear;
    let zFar = data1f.uZFar;
    let rotationsArray = data3fv.uCameraRotations.array();
    let translationsArray = data3fv.uCameraPosition.array();

    let projectionMatrix = getMat4Projection(FoV, aspect, zNear, zFar);
    let modelViewMatrix = getMat4ModelView(rotationsArray, translationsArray);
    let rotationMatrix = getMat4ModelView(rotationsArray, [0.0, 0.0, 0.0]);

    let dataMat4 = {
        uProjectionMatrix: projectionMatrix,
        uModelViewMatrix: modelViewMatrix,
        uRotationMatrix: rotationMatrix,
    };

    setUniforms(gl, programInfo, data1f, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, terrainAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}

function drawSky(gl) {
    let programInfo = getShaderProgram(gl, skyVert, skyFrag, skyAttributeObject);
    finaliseProgram(programInfo, skyAttributeObject);

    let FoV = data1f.uFoV;
    let aspect = gl.canvas.width / gl.canvas.height;
    let zNear = data1f.uZNear;
    let zFar = data1f.uZFar;
    let rotationsArray = data3fv.uCameraRotations.array();
    let translationsArray = [0.0, 0.0, 0.0];

    let projectionMatrix = getMat4Projection(FoV, aspect, zNear, zFar);
    let modelViewMatrix = getMat4ModelView(rotationsArray, translationsArray);
    let rotationMatrix = getMat4ModelView(rotationsArray, [0.0, 0.0, 0.0]);

    let dataMat4 = {
        uProjectionMatrix: projectionMatrix,
        uModelViewMatrix: modelViewMatrix,
        uRotationMatrix: rotationMatrix,
    };

    setUniforms(gl, programInfo, data1f, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, skyAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}