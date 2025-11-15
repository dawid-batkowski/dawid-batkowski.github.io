
// Grab the canvas
const canvas = document.getElementById('bgCanvas');

// Create Three.js renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create scene and orthographic camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms for the shader
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
};

// Shader material
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;

      // Base gradient
      vec3 color = vec3(st.x, st.y, abs(sin(u_time)));

      // Distance from mouse (normalized)
      float dist = distance(st, u_mouse);

      // Add a subtle glow around the mouse
      float highlight = 1.0 - smoothstep(0.0, 0.2, dist);
      color += vec3(highlight * 0.3);

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

// Fullscreen plane
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(plane);

// Mouse listener
window.addEventListener('mousemove', (event) => {
  uniforms.u_mouse.value.x = event.clientX / window.innerWidth;
  uniforms.u_mouse.value.y = 1.0 - event.clientY / window.innerHeight;
});

// Animation loop
function animate(time) {
  uniforms.u_time.value = time * 0.001; // seconds
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
