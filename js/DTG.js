const RES = 512;

// ── SHADER LOADER ─────────────────────────────────────────────
const shaderCache = {};

async function loadShader(name) {
  if (shaderCache[name]) return shaderCache[name];
  const response = await fetch(`glsl/DTG_lib/${name}.glsl`);
  if (!response.ok) throw new Error(`Could not load shader: ${name}.glsl`);
  const src = await response.text();
  shaderCache[name] = src;
  return src;
}

// ── OFFSCREEN RENDERER ────────────────────────────────────────
const offscreenRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
offscreenRenderer.setSize(RES, RES);

const offscreenScene  = new THREE.Scene();
const offscreenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const fullscreenQuad  = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
offscreenScene.add(fullscreenQuad);

const VERTEX_SHADER = `void main() { gl_Position = vec4(position, 1.0); }`;

function renderNode(fragmentSrc, uniforms) {
  const allUniforms = {
    u_resolution: { value: new THREE.Vector2(RES, RES) },
    ...uniforms,
  };
  const material = new THREE.ShaderMaterial({
    vertexShader:   VERTEX_SHADER,
    fragmentShader: fragmentSrc,
    uniforms:       allUniforms,
  });
  fullscreenQuad.material = material;
  offscreenRenderer.render(offscreenScene, offscreenCamera);
  material.dispose();

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width  = RES;
  outputCanvas.height = RES;
  outputCanvas.getContext('2d').drawImage(offscreenRenderer.domElement, 0, 0);
  return outputCanvas;
}

function canvasToTexture(canvas) {
  const tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ── THUMBNAIL HELPER ──────────────────────────────────────────
// Draws a square thumbnail that fills the node width, flush below the widgets.
// Uses ctx.save/clip so nothing bleeds outside the rectangle.

function drawThumbnail(node, ctx, thumbCanvas) {
  if (!thumbCanvas) return;

  // How tall is the widget area?
  // LiteGraph stacks widgets starting just below the title.
  // Each widget row is (node.size[1] - widget area) — but the reliable
  // way is to ask LiteGraph where the last widget ends via widgets_up.
  // Simplest reliable method: count widgets, each is ~20px + 4px gap.
  const WIDGET_ROW_H = 24; // 20px widget + 4px gap
  const TITLE_H      = 30;
  const widgetCount  = node.widgets ? node.widgets.length : 0;
  const thumbY       = TITLE_H + widgetCount * WIDGET_ROW_H + 2; // 2px gap

  const thumbW = node.size[0];
  const thumbH = node.size[1] - thumbY;

  if (thumbH < 4) return;

  ctx.save();
  // Clip to exact rectangle — no borders, no rounding bleed
  ctx.beginPath();
  ctx.rect(0, thumbY, thumbW, thumbH);
  ctx.clip();
  ctx.drawImage(thumbCanvas, 0, thumbY, thumbW, thumbH);
  ctx.restore();
}

// ── NODES ─────────────────────────────────────────────────────

function NoiseNode() {
  this.addInput('in', 'texture');
  this.addOutput('out', 'texture');

  this.properties = { scale: 4.0, seed: 0.0 };
  this._canvas  = null;
  this._dirty   = true;
  this._lastUV  = undefined;

  this.addWidget("number", "scale", this.properties.scale, (v) => {
    this.properties.scale = v;
    this._dirty = true;
  }, { min: 0.1, max: 10000, step: 0.1 });

  this.addWidget("number", "seed", this.properties.seed, (v) => {
    this.properties.seed = v;
    this._dirty = true;
  }, { min: 0, max: 10000, step: 1 });

  // title + 2 widgets + square thumbnail (node width = 180, so thumb = 180px tall)
  this.size = [180, 20 + 2 * 24 + 180];
}

NoiseNode.title = 'GradientNoise_float';

NoiseNode.prototype.onExecute = async function() {
  const uvCanvas = this.getInputData(0);
  if (this._dirty || this._lastUV !== uvCanvas) {
    this._lastUV = uvCanvas;
    const src = await loadShader('noise');
    this._canvas = renderNode(src, {
      u_scale: { value: this.properties.scale },
      u_seed:  { value: this.properties.seed  },
      tex_uv:  { value: uvCanvas ? canvasToTexture(uvCanvas) : null },
      u_hasUV: { value: !!uvCanvas },
    });
    this._dirty = false;
  }
  this.setOutputData(0, this._canvas);
};

// onDrawForeground renders on top of everything including node chrome —
// this is what lets us get a clean flush thumbnail with no border bleed.
NoiseNode.prototype.onDrawForeground = function(ctx) {
  drawThumbnail(this, ctx, this._canvas);
};

LiteGraph.registerNodeType('Noises/GradientNoise_float', NoiseNode);


function InvertNode() {
  this.addInput('in',  'texture');
  this.addOutput('out', 'texture');
  this.size = [180, 20 + 180];
  this._canvas = null;
}
InvertNode.title = 'Invert';
InvertNode.prototype.onExecute = async function() {
  const inputCanvas = this.getInputData(0);
  if (!inputCanvas) return;
  const src = await loadShader('invert');
  this._canvas = renderNode(src, { u_input: { value: canvasToTexture(inputCanvas) } });
  this.setOutputData(0, this._canvas);
};
InvertNode.prototype.onDrawForeground = function(ctx) {
  drawThumbnail(this, ctx, this._canvas);
};
LiteGraph.registerNodeType('texture/invert', InvertNode);


function UVNode() {
  this.addOutput('out', 'texture');
  this.size = [180, 20 + 180];
  this._canvas = null;
}
UVNode.title = 'UV';
UVNode.prototype.onExecute = async function() {
  const src = await loadShader('uv');
  this._canvas = renderNode(src, {});
  this.setOutputData(0, this._canvas);
};
UVNode.prototype.onDrawForeground = function(ctx) {
  drawThumbnail(this, ctx, this._canvas);
};
LiteGraph.registerNodeType('texture/uv', UVNode);


function OutputNode() {
  this.addInput('in', 'texture');
  this.size = [180, 20 + 180];
  this._canvas = null;

  this.addWidget("button", "Save PNG", null, () => {
    if (this._canvas) {
      downloadCanvasAsPNG(this._canvas);
    }
  });
}
OutputNode.title = 'Output';
OutputNode.prototype.onExecute = function() {
  const src = this.getInputData(0);
  if (!src) return;
  this._canvas = src;
  const preview = document.getElementById('previewCanvas');
  preview.getContext('2d').drawImage(src, 0, 0, preview.width, preview.height);
  
};
OutputNode.prototype.onDrawForeground = function(ctx) {
  drawThumbnail(this, ctx, this._canvas);
};
LiteGraph.registerNodeType('texture/output', OutputNode);

function downloadCanvasAsPNG(canvas, filename = "texture.png") {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
  
      URL.revokeObjectURL(url);
    }, "image/png");
  }

// ── GRAPH SETUP ───────────────────────────────────────────────
const graph    = new LiteGraph.LGraph();
const lgCanvas = new LiteGraph.LGraphCanvas('#graphCanvas', graph);

function resizeGraph() {
  const el = document.getElementById('graphCanvas');
  lgCanvas.resize(el.offsetWidth, el.offsetHeight);
}
resizeGraph();
window.addEventListener('resize', resizeGraph);

const noiseNode  = LiteGraph.createNode('Noises/GradientNoise_float');
noiseNode.pos    = [60, 200];
graph.add(noiseNode);

const invertNode = LiteGraph.createNode('texture/invert');
invertNode.pos   = [310, 200];
graph.add(invertNode);

const outputNode = LiteGraph.createNode('texture/output');
outputNode.pos   = [560, 200];
graph.add(outputNode);

noiseNode.connect(0, invertNode, 0);
invertNode.connect(0, outputNode, 0);

graph.start();