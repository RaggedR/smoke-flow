import * as THREE from 'three';
import { SIM_W, SIM_H, JACOBI_ITERS, STEPS_PER_FRAME,
         advectUniforms, divergenceUniforms, pressureUniforms,
         projectUniforms, smokeUniforms, displayUniforms } from './uniforms.js';
import { initMaterial, advectMaterial, divergenceMaterial, pressureMaterial,
         projectMaterial, smokeMaterial, displayMaterial } from './materials.js';

let camera, scene, mesh, renderer;

// Ping-pong render targets
let velocity = [];
let pressure = [];
let divergence;
let smoke = [];

let curVel = 0;
let curPres = 0;
let curSmoke = 0;
let elapsedTime = 0;
let stepsPerFrame = STEPS_PER_FRAME;

function makeRT(w, h, filter) {
  return new THREE.WebGLRenderTarget(w, h, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: filter,
    magFilter: filter,
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false
  });
}

export function setupRenderer() {
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene = new THREE.Scene();
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  scene.add(mesh);

  // Canvas: full viewport height, width preserves simulation aspect ratio
  // This creates a wide canvas with horizontal scrollbar for exploring the flow
  const simAspect = SIM_W / SIM_H;
  const canvasH = Math.round(window.innerHeight * 0.55);  // 55% of viewport
  const canvasW = Math.round(canvasH * simAspect);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  renderer.setSize(canvasW, canvasH);
  renderer.setClearColor(0x000000, 1);

  const wrap = document.getElementById('canvas-wrap');
  wrap.appendChild(renderer.domElement);

  // Velocity: LinearFilter for bilinear interpolation in Semi-Lagrangian
  velocity = [makeRT(SIM_W, SIM_H, THREE.LinearFilter),
              makeRT(SIM_W, SIM_H, THREE.LinearFilter)];

  // Pressure: NearestFilter (sampled at grid points)
  pressure = [makeRT(SIM_W, SIM_H, THREE.NearestFilter),
              makeRT(SIM_W, SIM_H, THREE.NearestFilter)];

  // Divergence: single target
  divergence = makeRT(SIM_W, SIM_H, THREE.NearestFilter);

  // Smoke: LinearFilter for smooth advection
  smoke = [makeRT(SIM_W, SIM_H, THREE.LinearFilter),
           makeRT(SIM_W, SIM_H, THREE.LinearFilter)];
}

export function initSimulation() {
  // Clear pressure, divergence, and smoke
  const clearTargets = [pressure[0], pressure[1], divergence, smoke[0], smoke[1]];
  for (const t of clearTargets) {
    renderer.setRenderTarget(t);
    renderer.clear();
  }

  // Initialize velocity with the jet profile (divergence-free base flow)
  mesh.material = initMaterial;
  renderer.setRenderTarget(velocity[0]);
  renderer.render(scene, camera);
  renderer.setRenderTarget(velocity[1]);
  renderer.render(scene, camera);

  curVel = 0;
  curPres = 0;
  curSmoke = 0;
  elapsedTime = 0;
}

function step() {
  const dt = advectUniforms.dt.value;

  // Phase 1: Advect velocity (self-advection + BCs + viscous diffusion)
  mesh.material = advectMaterial;
  advectUniforms.tVelocity.value = velocity[curVel].texture;
  advectUniforms.time.value = elapsedTime;
  renderer.setRenderTarget(velocity[1 - curVel]);
  renderer.render(scene, camera);
  curVel = 1 - curVel;

  // Phase 2: Compute divergence
  mesh.material = divergenceMaterial;
  divergenceUniforms.tVelocity.value = velocity[curVel].texture;
  renderer.setRenderTarget(divergence);
  renderer.render(scene, camera);

  // Phase 3: Pressure Poisson solve (Jacobi iterations)
  // Warm-start from previous frame's pressure (critical for convergence
  // on large grids — Jacobi spectral radius ≈ cos(π/N) ≈ 1 for large N,
  // but inter-frame pressure changes are small, so warm-start converges fast)
  mesh.material = pressureMaterial;
  pressureUniforms.tDivergence.value = divergence.texture;
  for (let j = 0; j < JACOBI_ITERS; j++) {
    pressureUniforms.tPressure.value = pressure[curPres].texture;
    renderer.setRenderTarget(pressure[1 - curPres]);
    renderer.render(scene, camera);
    curPres = 1 - curPres;
  }

  // Phase 4: Project velocity (subtract pressure gradient)
  mesh.material = projectMaterial;
  projectUniforms.tVelocity.value = velocity[curVel].texture;
  projectUniforms.tPressure.value = pressure[curPres].texture;
  renderer.setRenderTarget(velocity[1 - curVel]);
  renderer.render(scene, camera);
  curVel = 1 - curVel;

  // Phase 5: Advect smoke by velocity field + inject at inlet
  mesh.material = smokeMaterial;
  smokeUniforms.tSmoke.value = smoke[curSmoke].texture;
  smokeUniforms.tVelocity.value = velocity[curVel].texture;
  smokeUniforms.time.value = elapsedTime;
  renderer.setRenderTarget(smoke[1 - curSmoke]);
  renderer.render(scene, camera);
  curSmoke = 1 - curSmoke;

  elapsedTime += dt;
}

export function runStep() {
  for (let i = 0; i < stepsPerFrame; i++) {
    step();
  }
}

export function renderToScreen() {
  displayUniforms.tSmoke.value = smoke[curSmoke].texture;
  displayUniforms.tVelocity.value = velocity[curVel].texture;
  mesh.material = displayMaterial;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

export function setStepsPerFrame(n) {
  stepsPerFrame = Math.max(1, Math.min(8, Math.round(n)));
}
