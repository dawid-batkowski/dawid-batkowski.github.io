console.log("JS Loaded");


// Grab canvas
const canvas = document.getElementById("bgCanvas");

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( new THREE.Color(0, 0, 0) , 200, 600 );

const aspect = window.innerWidth / window.innerHeight;
const frustum = 300.0;

const camera = new THREE.OrthographicCamera(
    frustum * -aspect,
    frustum * aspect,
    frustum,
    -frustum,
    1,
    2000
);

camera.position.z = 500;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(new THREE.Color(0.8, 0.8, 0.9), 1);
scene.add(ambientLight);

// cube
const cubeSize = 55;
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const material2 = new THREE.MeshStandardMaterial({});


const cubeCount = 10;
const totalInstances = cubeCount * cubeCount;
const cubeInstance = new THREE.InstancedMesh(geometry, material2, totalInstances);

cubeInstance.position.z += 50;
scene.add(cubeInstance);

const cubeOffset = (cubeCount - 1) * 0.5;
const dummy = new THREE.Object3D();

// Store initial positions for each cube
const initialPositions = [];
const cubeScales = [];
let i = 0;
for (let x = 0; x < cubeCount; x++) {
  for (let y = 0; y < cubeCount; y++) {
    const posX = (cubeOffset - x) * 80; // Use 80 for spacing
    const posY = (cubeOffset - y) * 80;
    const randomSize = Math.random() * 0.5;
    cubeScales.push(randomSize);
    // Store initial position
    initialPositions.push({ x: posX, y: posY });
    
    // Generate random size between 25 and 55 and apply it ONCE

    dummy.position.set(posX, posY, 0);
    dummy.scale.set(randomSize, randomSize, randomSize); // Set scale once here
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    cubeInstance.setMatrixAt(i, dummy.matrix);
    i++;
  }
}

// tell Three.js matrices changed
cubeInstance.instanceMatrix.needsUpdate = true;

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



function animate(t) {
  requestAnimationFrame(animate);

  const time = t * 0.001;

  for (let i = 0; i < totalInstances; i++) {
    const initialPos = initialPositions[i];

    dummy.position.set(initialPos.x, initialPos.y, 0);

    dummy.rotation.x = time * 0.5 + (i * 0.1 * initialPos.y);
    dummy.rotation.y = time * 1.0 + (initialPos.x * 0.01 + i);

    dummy.position.x += Math.sin(time + i + initialPos.x * 0.01) * 100;
    dummy.position.y += Math.sin(time + i + initialPos.y * 0.01) * 100;
    dummy.position.z += Math.sin(time + i) * 50;

    const s = cubeScales[i];          // read precomputed scale
    dummy.scale.set(s, s, s);         // apply here

    dummy.updateMatrix();
    cubeInstance.setMatrixAt(i, dummy.matrix);
  }

  cubeInstance.instanceMatrix.needsUpdate = true;

  uniforms.u_time.value = time;
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);


// Resize handler
function resize() {
  // Update renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  // Update camera frustum based on new aspect ratio
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = frustum * -aspect;
  camera.right = frustum * aspect;
  camera.top = frustum;
  camera.bottom = -frustum;
  camera.updateProjectionMatrix(); // CRITICAL: This applies the changes

  // Update shader uniforms
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


