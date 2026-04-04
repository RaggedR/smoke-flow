import * as THREE from 'three';

// Grid dimensions — SIM_H > SIM_H_REF gives more vertical room for plume
export const SIM_W = 2048;
export const SIM_H = 768;
export const SIM_H_REF = 256;  // reference height (physics tuned at this size)

// Solver parameters
export const JACOBI_ITERS = 40;
export const STEPS_PER_FRAME = 4;

// Domain expansion: jet stays same texel size in bigger domain
const hScale = SIM_H_REF / SIM_H;

export const DEFAULTS = {
  dt: 0.5,
  nu: 0.0008,                       // same texel viscosity
  uJet: 2.0,                        // peak inlet velocity (texels/timestep-unit)
  jetWidth: 0.18 * hScale,          // jet stays same texel width
  pertAmp: 0.18,                    // perturbation strength
  pertFreq: 3.0 / hScale,           // same physical wavelength
  smokeDecay: 0.9995,
  glowStrength: 0.3,
  confinement: 0.0                    // off by default — use V/C keys to adjust
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
  time: { value: 0.0 },
  hScale: { value: hScale }
};

export const confinementUniforms = {
  tVelocity: { value: null },
  resolution: { value: res },
  dt: { value: DEFAULTS.dt },
  confinementStrength: { value: DEFAULTS.confinement }
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
