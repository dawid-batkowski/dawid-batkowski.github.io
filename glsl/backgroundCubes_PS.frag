precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_clickTime;
uniform vec2 u_clickPos;


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
    
    float dirLight = clamp(dot(vec3(0.7, 1.0, 0.5), vNormal), 0.0, 1.0);

    vec3 toEye = normalize(vec3((u_mouse - u_resolution / 2.0) / 2.0, 500.0) - vPosition);
    float test = 1.0 - clamp(length(mousePos - uv) * 2.0, 0.0, 1.0);
    float light = clamp(dot(toEye, vNormal), 0.0, 1.0);
    float iris = clamp(dot(toEye, vNormal), 0.0, 1.0);
    light = smoothstep(0.4, 0.5, light);
    iris = smoothstep(0.9, 1.0, iris);

    vec4 color = mix(vec4(1.0, 1.0, 1.0, 1.0), vec4(0.1, 0.3, 0.5, 1.0), light);
    color = mix(color, vec4(0, 0, 0, 1.0), iris);




    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 diff = ((uv - mousePos) * aspect);
    float gradient = clamp(length(diff) * 6.0, 0.0, 1.0);
    float sinceClick = u_time - u_clickTime;

    float dist = distance(vPosition, vec3((u_mouse - u_resolution / 2.0) / 2.0 , 1.0));
    //--- PULSE
    float pulse = 1.0 - abs(dist - sinceClick * 80.0) * 0.05; 
    pulse = smoothstep(0.0, 0.01, pulse);  
    pulse *= step(0.0, sinceClick);

    vec4 finalColor = mix(vec4(0.0, 1.0, 0.4, 1.0), color * clamp(dirLight, 0.5, 1.0), pulse);
    gl_FragColor = albedo * clamp(dirLight, 0.2, 1.0);
}