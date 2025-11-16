precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

vec2 gradient_noise_dir(vec2 p) {
    p = mod(p, 289.0);
    float x = mod((34.0 * p.x + 1.0) * p.x + p.y, 289.0);
    x = mod((34.0 * x + 1.0) * x, 289.0);
    x = fract(x / 41.0) * 2.0 - 1.0;

    return normalize(vec2(x - floor(x + 0.5), abs(x) - 0.5));
}

float gradientNoise(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);

    float d00 = dot(gradient_noise_dir(ip), fp);
    float d01 = dot(gradient_noise_dir(ip + vec2(0.0, 1.0)), fp - vec2(0.0, 1.0));
    float d10 = dot(gradient_noise_dir(ip + vec2(1.0, 0.0)), fp - vec2(1.0, 0.0));
    float d11 = dot(gradient_noise_dir(ip + vec2(1.0, 1.0)), fp - vec2(1.0, 1.0));

    fp = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);

    return mix(mix(d00, d01, fp.y), mix(d10, d11, fp.y), fp.x);
}

float GradientNoise_float(vec2 UV, float Scale) {
    return clamp(gradientNoise(UV * Scale) + 0.5, 0.0, 1.0);
    
}


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 mousePos = u_mouse / u_resolution;

    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 diff = (uv - mousePos) * aspect;
    float gradient = clamp(length(diff) * 6.0, 0.0, 1.0);

    vec4 color =  vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);

    gl_FragColor = color * clamp(GradientNoise_float(mix(vec2(0.5, 0.5), uv, gradient) + GradientNoise_float(uv, 5.0) + vec2(0, u_time * 0.1), 32.0), 0.7, 1.0);
}
