/**
 * Initialize velocity field with a parallel Gaussian jet profile.
 * u(y) = uJet * exp(-((y - 0.5) / jetWidth)^2), v = 0.
 * This is divergence-free (du/dx = 0, dv/dy = 0), so pressure = 0.
 */
precision highp float;

uniform float uJet;
uniform float jetWidth;

varying vec2 vUv;

void main() {
  float y = vUv.y;
  float u = uJet * exp(-pow((y - 0.5) / jetWidth, 2.0));
  gl_FragColor = vec4(u, 0.0, 0.0, 1.0);
}
