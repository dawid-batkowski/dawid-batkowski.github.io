precision mediump float;
uniform float u_time;
uniform float u_fade;
uniform vec2 u_resolution;

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec2 RotateUV(vec2 uv, vec2 center, float rotation)
{
    float rad = rotation * (3.1415926 / 180.0);

    float s = sin(rad);
    float c = cos(rad);

    mat2 rot = mat2(
        c, -s,
        s,  c
    );

    uv -= center;
    uv = rot * uv;
    uv += center;

    return uv;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float verticalMask = step(0.5, (1.0 - RotateUV(uv, vec2(0.0, 0.0), -10.0).y  + 0.9 - (u_time * u_time) * 2.5));
    float verticalMaskHigh = 1.0 - saturate(abs(((1.0 - RotateUV(uv, vec2(0.0, 0.0), -10.0).y + 0.9 - (u_time * u_time) * 2.5)) * 2.0 - 1.0) * 5.0) ;
    gl_FragColor = vec4(verticalMaskHigh, verticalMaskHigh, verticalMaskHigh, verticalMaskHigh + verticalMask);
}

// Add this random function if not already defined
