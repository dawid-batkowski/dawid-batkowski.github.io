precision mediump float;

uniform vec2      u_resolution;
uniform sampler2D u_input; 

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  vec3 color = texture2D(u_input, uv).rgb;

  vec3 inverted = 1.0 - color;

  gl_FragColor = vec4(inverted, 1.0);
}
