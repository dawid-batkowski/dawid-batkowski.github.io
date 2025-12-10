precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_clickTime;
uniform vec2 u_clickPos;

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;

float Hash01(float x)
{
    x = fract(sin(x * 43758.5453));

    return x;
}

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

void main() 
{
    vec2 clickPos = u_clickPos / u_resolution;

    vec2 fixU_mouse = length(u_mouse) > 0.001 ? u_mouse : vec2(0, 0);
    vec2 mousePos = fixU_mouse / u_resolution;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    float sinceClick = max(u_time - u_clickTime, 0.001);



    vNormal = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
    float shapeID = Hash01(float(gl_InstanceID));

    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
    vec3 instanceWorldPos = instanceMatrix[3].xyz;

    vec3 toMouse = instanceWorldPos.xyz - vec3((fixU_mouse - u_resolution / 2.0) / 2.0, 1.0);
    float lenToMouse = length(toMouse);
    vec3 dirToMouse = lenToMouse > 0.001 ? normalize(toMouse) * 200.0 : vec3(0, 0, 0);

    vec4 worldPosOffset = vec4(((mousePos.x - 0.5) * 2.0) * 100.0 * shapeID, ((mousePos.y - 0.5) * 2.0) * 100.0 * shapeID, 0, 0);
    worldPosition += vec4(dirToMouse, 0.0);
    vPosition = worldPosition.xyz + worldPosOffset.xyz;
    //float forceField = length((mousePos + vec2(0.5, 0.5)) * 2.0 - worldPosition.xz) * 1.0;

    vec4 projectionSpace = projectionMatrix * modelViewMatrix * (worldPosition + worldPosOffset);

    vec4 test = projectionSpace;
    gl_Position = test;
}