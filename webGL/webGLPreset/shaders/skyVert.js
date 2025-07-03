let skyVert =

`precision highp float;

attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec4 vColor;
varying vec3 vPosition;

void main() {
    vColor = aVertexColor;
    vPosition = aVertexPosition.xyz;

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
    
`