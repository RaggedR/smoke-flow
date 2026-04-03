/**
 * Jacobi iteration for pressure Poisson equation: ∇²p = div(v)
 * p_new = (pE + pW + pN + pS - div) / 4.0
 * Boundary: p = 0 at all edges (homogeneous Dirichlet).
 */
precision highp float;

uniform sampler2D tPressure;
uniform sampler2D tDivergence;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
  vec2 tx = 1.0 / resolution;

  float div = texture2D(tDivergence, vUv).r;

  float pE = texture2D(tPressure, vUv + vec2(tx.x, 0.0)).r;
  float pW = texture2D(tPressure, vUv - vec2(tx.x, 0.0)).r;
  float pN = texture2D(tPressure, vUv + vec2(0.0, tx.y)).r;
  float pS = texture2D(tPressure, vUv - vec2(0.0, tx.y)).r;

  float pNew = (pE + pW + pN + pS - div) / 4.0;

  // Boundary: force p=0 at edges
  float x = vUv.x, y = vUv.y;
  if (x < tx.x * 1.5 || x > 1.0 - tx.x * 1.5 ||
      y < tx.y * 1.5 || y > 1.0 - tx.y * 1.5) {
    pNew = 0.0;
  }

  gl_FragColor = vec4(pNew, 0.0, 0.0, 1.0);
}
