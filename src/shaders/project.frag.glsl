/**
 * Pressure gradient subtraction (Chorin projection step).
 * v_new = v - grad(p)
 * Re-applies boundary conditions after projection.
 */
precision highp float;

uniform sampler2D tVelocity;
uniform sampler2D tPressure;
uniform vec2 resolution;
uniform float uJet, jetWidth;

varying vec2 vUv;

void main() {
  vec2 tx = 1.0 / resolution;

  vec2 vel = texture2D(tVelocity, vUv).rg;

  float pE = texture2D(tPressure, vUv + vec2(tx.x, 0.0)).r;
  float pW = texture2D(tPressure, vUv - vec2(tx.x, 0.0)).r;
  float pN = texture2D(tPressure, vUv + vec2(0.0, tx.y)).r;
  float pS = texture2D(tPressure, vUv - vec2(0.0, tx.y)).r;

  vec2 gradP = vec2(pE - pW, pN - pS) * 0.5;
  vec2 result = vel - gradP;

  float x = vUv.x;
  float y = vUv.y;

  // Re-apply inlet BC (don't let pressure corrupt the jet)
  if (x < tx.x * 2.0) {
    float jetProfile = uJet * exp(-pow((y - 0.5) / jetWidth, 2.0));
    result.x = jetProfile;
  }

  // Outlet: zero-gradient
  if (x > 1.0 - tx.x * 2.0) {
    result = texture2D(tVelocity, vec2(x - tx.x, y)).rg;
  }

  // Walls: free-slip
  if (y < tx.y * 1.5 || y > 1.0 - tx.y * 1.5) {
    result.y = 0.0;
  }

  gl_FragColor = vec4(result, 0.0, 1.0);
}
