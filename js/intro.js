console.log("Intro Shader Loaded");

// Create fullscreen canvas overlay for the intro
const introCanvas = document.createElement("canvas");
introCanvas.id = "introCanvas";
document.body.appendChild(introCanvas);

// WebGL renderer
const introRenderer = new THREE.WebGLRenderer({
  canvas: introCanvas,
  alpha: true,    // allow fade-out
});
introRenderer.setPixelRatio(window.devicePixelRatio);
introRenderer.setSize(window.innerWidth, window.innerHeight);

// Scene & Camera
const introScene = new THREE.Scene();
const introCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms for intro shader
const introUniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_fade: { value: 1.0 },    // fade-out control
};

// Intro Shader Material (replace fragmentShader later with your effect)
const introMaterial = new THREE.ShaderMaterial({
  uniforms: introUniforms,
  transparent: true,     // needed for fade
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform float u_fade;
    uniform vec2 u_resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;

      // Simple intro animation example
      float circle = smoothstep(0.5, 0.0, (1.0 - uv.y) - pow(u_time, 2.0) + 0.5);

      gl_FragColor = vec4(vec3(circle), 1.0 - circle);
    }
  `
});

// Fullscreen quad
const introPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), introMaterial);
introScene.add(introPlane);

// Animation loop
function introAnimate(time) {
  introUniforms.u_time.value = time * 0.001;

  // Fade out after 3 seconds
  if (introUniforms.u_time.value > 3.0) {
    introUniforms.u_fade.value = 1.0 - (introUniforms.u_time.value - 3.0) * 0.5;
    if (introUniforms.u_fade.value <= 0.0) {
      introCanvas.style.display = "none"; // remove from view
    }
  }

  introRenderer.render(introScene, introCamera);
  requestAnimationFrame(introAnimate);
}
requestAnimationFrame(introAnimate);

// Resize handler
window.addEventListener("resize", () => {
  introRenderer.setSize(window.innerWidth, window.innerHeight);
  introUniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
