let terrainFrag = 

`precision highp float;

varying vec4 vColor;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    gl_FragColor = vec4(normalize(vNormal + vec3(0.5)), 1.0);
}
    
`