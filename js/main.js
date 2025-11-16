// Grab canvas
const canvas = document.getElementById('bgCanvas');

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

// Shader material with placeholder fragmentShader
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: `
    attribute vec3 position;
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: 'void main() { gl_FragColor = vec4(1.0,0.0,0.0,1.0); }' // temporary red
});

// Fullscreen plane
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
scene.add(plane);

// Load GLSL shader from glsl folder
fetch('glsl/fragShader.frag')
  .then(response => response.text())
  .then(shaderCode => {
    material.fragmentShader = shaderCode;
    material.needsUpdate = true;
  })
  .catch(err => console.error("Failed to load shader:", err));

// Animate loop
function animate(time) {
  uniforms.u_time.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
