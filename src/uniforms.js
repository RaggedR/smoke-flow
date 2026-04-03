import * as THREE from 'three';

// Grid dimensions — 8:1 panoramic with vertical space for turbulent expansion
export const SIM_W = 2048;
export const SIM_H = 256;

// Solver parameters
export const JACOBI_ITERS = 40;
export const STEPS_PER_FRAME = 4;  // balanced for 2048×256 performance

// Physics defaults
// Velocity in texels/timestep-unit, dt in timestep-units/step.
// Flow speed per step = dt * uJet = 0.5 * 2.0 = 1.0 texel/step.
// At 8 steps/frame × 60fps = 480 steps/s → domain crossing ~1.1s.
export const DEFAULTS = {
  dt: 0.5,
  nu: 0.0008,         // very low viscosity — Re ≈ 112,000, aggressive turbulence
  uJet: 2.0,          // peak inlet velocity (texels/timestep-unit)
  jetWidth: 0.18,     // narrow jet — leaves space above/below for turbulent expansion
  pertAmp: 0.18,      // very strong perturbation — fast KH breakdown
  pertFreq: 3.0,      // perturbation wavenumber (seeds 3 KH billows)
  smokeDecay: 0.9995,  // per-step smoke density decay (slower fade)
  glowStrength: 0.3
};

const res = new THREE.Vector2(SIM_W, SIM_H);

export const advectUniforms = {
  tVelocity: { value: null },
  resolution: { value: res },
  dt: { value: DEFAULTS.dt },
  nu: { value: DEFAULTS.nu },
  uJet: { value: DEFAULTS.uJet },
  jetWidth: { value: DEFAULTS.jetWidth },
  pertAmp: { value: DEFAULTS.pertAmp },
  pertFreq: { value: DEFAULTS.pertFreq },
  time: { value: 0.0 }
};

export const divergenceUniforms = {
  tVelocity: { value: null },
  resolution: { value: res }
};

export const pressureUniforms = {
  tPressure: { value: null },
  tDivergence: { value: null },
  resolution: { value: res }
};

export const projectUniforms = {
  tVelocity: { value: null },
  tPressure: { value: null },
  resolution: { value: res },
  uJet: { value: DEFAULTS.uJet },
  jetWidth: { value: DEFAULTS.jetWidth }
};

export const smokeUniforms = {
  tSmoke: { value: null },
  tVelocity: { value: null },
  resolution: { value: res },
  dt: { value: DEFAULTS.dt },
  smokeDecay: { value: DEFAULTS.smokeDecay },
  time: { value: 0.0 }
};

export const initUniforms = {
  uJet: { value: DEFAULTS.uJet },
  jetWidth: { value: DEFAULTS.jetWidth }
};

export const displayUniforms = {
  tSmoke: { value: null },
  tVelocity: { value: null },
  resolution: { value: res },
  colorScheme: { value: 0 },
  glowStrength: { value: DEFAULTS.glowStrength }
};
