/**
 * Compute velocity divergence: div(v) = du/dx + dv/dy
 * Central differences with 0.5 factor.
 */
precision highp float;

uniform sampler2D tVelocity;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
  vec2 tx = 1.0 / resolution;

  float uE = texture2D(tVelocity, vUv + vec2(tx.x, 0.0)).r;
  float uW = texture2D(tVelocity, vUv - vec2(tx.x, 0.0)).r;
  float vN = texture2D(tVelocity, vUv + vec2(0.0, tx.y)).g;
  float vS = texture2D(tVelocity, vUv - vec2(0.0, tx.y)).g;

  float div = (uE - uW + vN - vS) * 0.5;

  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
