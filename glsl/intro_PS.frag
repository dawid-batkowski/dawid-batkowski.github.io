precision mediump float;
uniform float u_time;
uniform float u_fade;
uniform vec2 u_resolution;

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float thickness = 64.0 * (uv.y - 0.5);
    float maskH = 1.0 - saturate(pow(abs(uv.x * thickness - (thickness / 2.0)), 0.25));


    float alpha = maskH;
    if (u_time > 1.5)
    {
        alpha += u_time - 1.5;
    }

    float maskCircle = 1.0 - (length(uv - 0.5) + 1.5  - clamp(u_time * 1.5, 0.0, 1.5));
    float maskAlpha = 1.0 - (length(uv - 0.5) + 3.0  - clamp(u_time * 1.5, 0.0, 3.0));

    vec3 color = maskH * maskCircle * vec3(0.8235, 0.7725, 1.0);
    gl_FragColor = vec4(color, 1.0 - alpha * maskAlpha);
}

// Add this random function if not already defined
