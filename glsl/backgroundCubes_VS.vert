precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_clickTime;
uniform vec2 u_clickPos;

attribute float instanceScale;

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
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    float sinceClick = max(u_time - u_clickTime, 0.001);
    
    vNormal = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
    float shapeID = Hash01(float(gl_InstanceID));
    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
    vec3 instanceWorldPos = instanceMatrix[3].xyz;
    

    vec2 validMouse = length(u_mouse) > 1.0 ? u_mouse : u_resolution * 0.5;
    vec2 mousePos = validMouse / u_resolution;
    

    vec3 mouseWorld = vec3((validMouse - u_resolution * 0.5) * 0.5, 1.0);
    vec3 toMouse = instanceWorldPos - mouseWorld;
    float lenToMouse = length(toMouse);
    vec3 dirToMouse = lenToMouse > 0.1 ? normalize(toMouse) * 200.0 : vec3(0.0);
    

         worldPosition = instanceMatrix * vec4(position, 1.0);
    vec3 sphereCenter = instanceMatrix[3].xyz;
    

    mouseWorld *= vec3(1.0, 1.0, 500.0);
    vec3 viewDir = normalize(sphereCenter - mouseWorld);

    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(worldUp, viewDir));
    vec3 up = normalize(cross(viewDir, right));
    
    vec3 localPos = worldPosition.xyz - sphereCenter;
    
    float sphereRadius = instanceScale * 50.0; 
    float u = dot(localPos, right) / sphereRadius * 0.5 + 0.5;
    float v = dot(localPos, up) / sphereRadius * 0.5 + 0.5;
    
    vUv = vec2(u, v);



    float offsetX = clamp(((mousePos.x - 0.5) * 2.0) * 100.0 * shapeID, -200.0, 200.0);
    float offsetY = clamp(((mousePos.y - 0.5) * 2.0) * 100.0 * shapeID, -200.0, 200.0);
    vec4 worldPosOffset = vec4(offsetX, offsetY, 0.0, 0.0);
    
    worldPosition += vec4(dirToMouse, 0.0);
    vPosition = worldPosition.xyz + worldPosOffset.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * (worldPosition + worldPosOffset);
}