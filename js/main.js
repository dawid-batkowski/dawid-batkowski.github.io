console.log("JS Loaded");

// Grab canvas
const canvas = document.getElementById("bgCanvas");

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( new THREE.Color(0, 0, 0) , 200, 700 );

const aspect = window.innerWidth / window.innerHeight;
const frustum = 200.0;

const camera = new THREE.OrthographicCamera(
    frustum * -aspect,
    frustum * aspect,
    frustum,
    -frustum,
    1,
    1000
);

camera.position.z = 500;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(new THREE.Color(0.5, 0.7, 0.9), 0.5);
scene.add(ambientLight);

// cube
const geometry = new THREE.BoxGeometry(55, 55, 55);
const material2 = new THREE.MeshLambertMaterial({ color: new THREE.Color(0.5, 0.5, 0.5) });
const cube = new THREE.Mesh(geometry, material2);
cube.position.z += 50;
cube.position.x += 300;
scene.add(cube);



renderer.render(scene, camera);
// Uniforms
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2() },
  u_clickPos: { value: new THREE.Vector2() },
  u_clickTime: { value: 0 },
};

// Shader Material
const material = new THREE.ShaderMaterial({
  uniforms,
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

// Load external shader
fetch("glsl/fragShader.frag")
  .then(r => r.text())
  .then(code => { material.fragmentShader = code; material.needsUpdate = true; });

// Fullscreen Plane
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));


// Animation
function animate(t) {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.02;

  uniforms.u_time.value = t * 0.001;
  renderer.render(scene, camera);

}
requestAnimationFrame(animate);

// Resize handler
function resize() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  uniforms.u_resolution.value.set(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
}
window.addEventListener("resize", resize);
resize();

// Mouse & touch
function setPointerPos(e) {
  const dpr = window.devicePixelRatio || 1;
  let x, y;

  if (e.touches) {
    x = e.touches[0].clientX * dpr;
    y = (window.innerHeight - e.touches[0].clientY) * dpr;
  } else {
    x = e.clientX * dpr;
    y = (window.innerHeight - e.clientY) * dpr;
  }

  uniforms.u_mouse.value.set(x, y);
}

window.addEventListener("mousemove", setPointerPos);
window.addEventListener("touchmove", setPointerPos);
window.addEventListener("touchstart", e => {
  setPointerPos(e);
  uniforms.u_clickTime.value = uniforms.u_time.value;
  uniforms.u_clickPos.value.copy(uniforms.u_mouse.value);
});
window.addEventListener("click", e => {
  setPointerPos(e);
  uniforms.u_clickTime.value = uniforms.u_time.value;
  uniforms.u_clickPos.value.copy(uniforms.u_mouse.value);
});


