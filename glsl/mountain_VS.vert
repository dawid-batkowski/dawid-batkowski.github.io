precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_clickTime;
uniform vec2 u_clickPos;


varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;

float Hash01(float x)
{
    return fract(sin(x * 43758.5453));
}

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

void main() 
{
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}