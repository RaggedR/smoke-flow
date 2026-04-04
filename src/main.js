import { setupRenderer, initSimulation, runStep, renderToScreen, zoom } from './renderer.js';
import { SIM_W, SIM_H, DEFAULTS, advectUniforms, confinementUniforms,
         projectUniforms, smokeUniforms, displayUniforms } from './uniforms.js';

let paused = false;

const SCHEME_NAMES = ['wind-tunnel', 'infrared', 'monochrome'];

// --- Setup ---
setupRenderer();
initSimulation();

// --- HUD ---
const hud = document.getElementById('hud');

function updateHUD() {
  const nu = advectUniforms.nu.value;
  const uJet = advectUniforms.uJet.value;
  const jetWidth = advectUniforms.jetWidth.value;
  const Re = Math.round(uJet * jetWidth * SIM_H / nu);
  const scheme = SCHEME_NAMES[displayUniforms.colorScheme.value];

  hud.innerHTML =
    `<span class="label">Re</span> <span class="value">${Re.toLocaleString()}</span>` +
    ` &nbsp; <span class="label">&nu;</span> <span class="value">${nu.toFixed(4)}</span>` +
    ` &nbsp; <span class="label">scheme</span> <span class="value">${scheme}</span>` +
    (paused ? ' &nbsp; <span class="value">PAUSED</span>' : '');
}

// --- Controls ---
function adjustViscosity(factor) {
  const nu = Math.max(0.0002, Math.min(0.02, advectUniforms.nu.value * factor));
  advectUniforms.nu.value = nu;
}

function adjustSpeed(factor) {
  const uJet = Math.max(0.2, Math.min(3.0, advectUniforms.uJet.value * factor));
  advectUniforms.uJet.value = uJet;
  projectUniforms.uJet.value = uJet;
}

function setColorScheme(idx) {
  displayUniforms.colorScheme.value = idx;
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      adjustViscosity(1.3);
      break;
    case 'ArrowDown':
      adjustViscosity(1 / 1.3);
      break;
    case 'ArrowRight':
      adjustSpeed(1.2);
      break;
    case 'ArrowLeft':
      adjustSpeed(1 / 1.2);
      break;
    case '1':
      setColorScheme(0);
      break;
    case '2':
      setColorScheme(1);
      break;
    case '3':
      setColorScheme(2);
      break;
    case ' ':
      e.preventDefault();
      paused = !paused;
      break;
    case 'c':
      confinementUniforms.confinementStrength.value =
        Math.max(0, confinementUniforms.confinementStrength.value - 0.01);
      break;
    case 'v':
      confinementUniforms.confinementStrength.value =
        Math.min(0.3, confinementUniforms.confinementStrength.value + 0.01);
      break;
    case 'r':
    case 'R':
      initSimulation();
      break;
  }
});

// --- Zoom (mouse wheel) ---
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1);
}, { passive: false });

// --- Animation loop ---
function update() {
  if (!paused) {
    runStep();
  }
  renderToScreen();
  updateHUD();
  requestAnimationFrame(update);
}

update();
