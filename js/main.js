console.log("JS Loaded");

// Grab canvas
const canvas = document.getElementById("bgCanvas");

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false); // false ensures CSS scaling

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

// Shader Material
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    uniform vec2 u_resolution;
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      gl_FragColor = vec4(uv, 0.0, 1.0);
    }
  `
});

// Load external fragment shader if needed
fetch("glsl/fragShader.frag")
  .then(res => res.text())
  .then(code => {
    material.fragmentShader = code;
    material.needsUpdate = true;
  })
  .catch(err => console.error("Shader load error:", err));

// Fullscreen plane
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(plane);

// Animate loop
function animate(time) {
  uniforms.u_time.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  uniforms.u_resolution.value.set(width, height);
});
