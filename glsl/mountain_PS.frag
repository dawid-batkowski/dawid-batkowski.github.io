precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_clickTime;
uniform vec2 u_clickPos;

uniform vec4 u_ambientLightColorAndIntensity;
uniform vec4 u_directionalLightColorAndIntensity;
uniform vec3 u_directionalLightDir;

uniform sampler2D u_albedoMap;
uniform sampler2D u_normalMap;
uniform sampler2D u_roughnessMap;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

float Hash01(float x)
{
    return fract(sin(x * 43758.5453));
}

float Triangle01_PeakAt(float time, float peakTime)
{
    time = saturate(time);
    peakTime = saturate(peakTime);

    if (time <= peakTime)
    {
        return time / peakTime; 
    }

    float fallT = (time - peakTime) / (1.0 - peakTime);
    return 1.0 - fallT; 
}


void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 clickPos = u_clickPos / u_resolution;

    vec2 mousePos = u_mouse / u_resolution;

    vec4 albedo = texture2D(u_albedoMap, vUv);
    vec4 normalMap = texture2D(u_normalMap, vUv);
    float roughness = texture2D(u_roughnessMap, vUv).r;
    
    float dirLight = dot(u_directionalLightDir.rgb, vNormal);


    vec3 color = dirLight * clamp(Hash01(vNormal.x + vNormal.y + vNormal.z), 0.5, 1.0) * vec3(1.0, 1.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}