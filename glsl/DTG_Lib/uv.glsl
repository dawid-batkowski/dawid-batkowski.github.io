precision mediump float;

uniform vec2  u_resolution;
uniform float u_scale;

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution;

  gl_FragColor = vec4(uv, 0.0, 1.0);
}
