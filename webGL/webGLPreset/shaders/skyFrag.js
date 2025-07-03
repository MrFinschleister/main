let skyFrag =

`precision highp float;

varying vec4 vColor;
varying vec3 vPosition;

void main() {
    gl_FragColor = vColor;
}
    
`