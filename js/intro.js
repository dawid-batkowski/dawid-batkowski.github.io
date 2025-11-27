console.log("Intro Shader Loaded");


const introCanvas = document.createElement("canvas");
introCanvas.id = "introCanvas";
document.body.appendChild(introCanvas);


const introRenderer = new THREE.WebGLRenderer({
  canvas: introCanvas,
  alpha: true, 
  antialias: false 
});


introRenderer.setSize(window.innerWidth, window.innerHeight);
introRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

// Scene & Camera
const introScene = new THREE.Scene();
const introCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms for intro shader - use exact pixel dimensions
const introUniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(
    introCanvas.width, 
    introCanvas.height
  )},
  u_fade: { value: 1.0 },
};

// Intro Shader Material
const introMaterial = new THREE.ShaderMaterial({
  uniforms: introUniforms,
  transparent: true,
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `
});

fetch("glsl/intro_PS.frag")
  .then(r => r.text())
  .then(code => {
    introMaterial.fragmentShader = code;
    introMaterial.needsUpdate = true;
  })
  .catch(err => {
    console.error("Error loading intro shader:", err);
  });

// Fullscreen quad
const introPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), introMaterial);
introScene.add(introPlane);

// Animation control
let introRunning = true;

function introAnimate(time) {
  if (!introRunning) return;
  
  introUniforms.u_time.value = time * 0.001;

  if (introUniforms.u_time.value > 3.0) {
    introUniforms.u_fade.value = 1.0 - (introUniforms.u_time.value - 3.0) * 0.5;
    if (introUniforms.u_fade.value <= 0.0) {
      introCanvas.style.display = "none";
      introRunning = false;
      return;
    }
  }

  introRenderer.render(introScene, introCamera);
  
  if (introRunning) {
    requestAnimationFrame(introAnimate);
  }
}

// DEDICATED MOBILE-FRIENDLY RESIZE HANDLER
function introResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Update renderer size and pixel ratio
  introRenderer.setSize(width, height);
  introRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Update canvas internal size (CRITICAL for mobile)
  introCanvas.width = width * introRenderer.getPixelRatio();
  introCanvas.height = height * introRenderer.getPixelRatio();
  
  // Update uniforms with actual canvas dimensions
  introUniforms.u_resolution.value.set(introCanvas.width, introCanvas.height);
  
  console.log("Intro canvas:", {
    style: `${width}x${height}`,
    internal: `${introCanvas.width}x${introCanvas.height}`,
    pixelRatio: introRenderer.getPixelRatio()
  });
}

// Force initial resize and start animation
introResize();
requestAnimationFrame(introAnimate);


window.addEventListener("resize", introResize);
window.addEventListener("orientationchange", function() {
  // Add delay for mobile orientation change
  setTimeout(introResize, 100);
});