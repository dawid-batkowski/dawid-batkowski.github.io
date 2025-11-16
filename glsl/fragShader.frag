precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 mousePos = u_mouse / u_resolution;
    vec4 color =  vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
    float gradient = saturate(length(uv - mousePos) * 2.0);
    gl_FragColor = mix(vec4(1,1,1,1), color, gradient);
}
