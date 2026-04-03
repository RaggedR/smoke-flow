/**
 * Semi-Lagrangian velocity self-advection + viscous diffusion.
 * Applies inlet jet profile, outlet zero-gradient, and free-slip wall BCs.
 */
precision highp float;

uniform sampler2D tVelocity;
uniform vec2 resolution;
uniform float dt, nu;
uniform float uJet, jetWidth, pertAmp, pertFreq;
uniform float time;

varying vec2 vUv;

#define PI 3.14159265359

// Simple pseudo-random hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 tx = 1.0 / resolution;

  // Current velocity
  vec2 vel = texture2D(tVelocity, vUv).rg;

  // Semi-Lagrangian backtrace
  vec2 backPos = vUv - dt * vel * tx;
  backPos = clamp(backPos, vec2(0.0), vec2(1.0));
  vec2 advected = texture2D(tVelocity, backPos).rg;

  // Viscous diffusion (explicit 5-point Laplacian)
  vec2 uC = texture2D(tVelocity, vUv).rg;
  vec2 uE = texture2D(tVelocity, vUv + vec2(tx.x, 0.0)).rg;
  vec2 uW = texture2D(tVelocity, vUv - vec2(tx.x, 0.0)).rg;
  vec2 uN = texture2D(tVelocity, vUv + vec2(0.0, tx.y)).rg;
  vec2 uS = texture2D(tVelocity, vUv - vec2(0.0, tx.y)).rg;
  vec2 laplacian = (uE + uW + uN + uS - 4.0 * uC);

  vec2 result = advected + dt * nu * laplacian;

  float x = vUv.x;
  float y = vUv.y;

  // --- INLET (left edge) ---
  if (x < tx.x * 2.0) {
    // Gaussian jet profile centered at y=0.5
    float jetProfile = uJet * exp(-pow((y - 0.5) / jetWidth, 2.0));

    // Coherent sinusoidal perturbation + noise
    float phase = time * 0.3;
    float pertU = pertAmp * sin(2.0 * PI * pertFreq * y + phase);
    float pertV = pertAmp * uJet * (hash(vec2(y * 17.3, time * 0.7)) - 0.5) * 2.0;

    result = vec2(jetProfile * (1.0 + pertU), pertV);
  }

  // --- OUTLET (right edge): zero-gradient outflow ---
  if (x > 1.0 - tx.x * 2.0) {
    result = texture2D(tVelocity, vec2(x - tx.x, y)).rg;
  }

  // --- WALLS (top/bottom): free-slip ---
  if (y < tx.y * 1.5) {
    result.y = 0.0;
  }
  if (y > 1.0 - tx.y * 1.5) {
    result.y = 0.0;
  }

  // Stability clamp
  result = clamp(result, vec2(-10.0), vec2(10.0));

  gl_FragColor = vec4(result, 0.0, 1.0);
}
