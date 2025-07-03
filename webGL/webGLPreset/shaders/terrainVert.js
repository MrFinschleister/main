let terrainVert = 

`precision highp float;

attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute float aVertexMaterialIndex;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uRotationMatrix;

varying vec4 vColor;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vColor = aVertexColor;
    vPosition = aVertexPosition.xyz;
    vNormal = aVertexNormal;

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
    
`