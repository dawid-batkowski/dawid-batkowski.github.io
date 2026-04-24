precision mediump float;

uniform vec2  u_resolution;
uniform sampler2D tex_uv;
uniform bool u_hasUV;

uniform float u_scale;
uniform float u_seed;

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

vec2 warpedUV = texture2D(tex_uv, uv).rg;
vec2 finalUV = uv;

if (u_hasUV) {
    finalUV = texture2D(tex_uv, uv).rg;
  }

  vec2 p = finalUV + u_seed * 137.547;

  float n = GradientNoise_float(p, u_scale);

  gl_FragColor = vec4(vec3(n), 1.0);
}