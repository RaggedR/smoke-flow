/**
 * Passive smoke advection (RGB channels) + injection at inlet.
 * R = upper streams (yellow-green), G = middle (cyan), B = lower (blue-purple).
 * Smoke is a passive scalar — advected by velocity but does not affect it.
 */
precision highp float;

uniform sampler2D tSmoke;
uniform sampler2D tVelocity;
uniform vec2 resolution;
uniform float dt;
uniform float smokeDecay;
uniform float time;
uniform float hScale;

varying vec2 vUv;

void main() {
  vec2 tx = 1.0 / resolution;

  // Advect smoke by velocity field (Semi-Lagrangian)
  vec2 vel = texture2D(tVelocity, vUv).rg;
  vec2 backPos = vUv - dt * vel * tx;
  backPos = clamp(backPos, vec2(0.0), vec2(1.0));

  vec3 smoke = texture2D(tSmoke, backPos).rgb;

  // Gentle decay to prevent saturation
  smoke *= smokeDecay;

  // Inject smoke at inlet (left edge, first 3 texels)
  // Bands are concentrated around the jet center (y=0.5) within the jet width
  if (vUv.x < tx.x * 3.0) {
    float y = vUv.y;
    float bandWidth = 0.004 * hScale;
    float intensity = 0.7;
    float sp = 0.025 * hScale;

    // Upper streams → R channel (5 bands above center)
    for (float i = 0.0; i < 5.0; i++) {
      float center = 0.5 + (0.04 + i * 0.025) * hScale;
      float d = abs(y - center) / bandWidth;
      smoke.r += intensity * exp(-d * d);
    }

    // Middle streams → G channel (5 bands around center)
    for (float i = 0.0; i < 5.0; i++) {
      float center = 0.5 + (-0.06 + i * 0.025) * hScale;
      float d = abs(y - center) / bandWidth;
      smoke.g += intensity * exp(-d * d);
    }

    // Lower streams → B channel (5 bands below center)
    for (float i = 0.0; i < 5.0; i++) {
      float center = 0.5 + (-0.16 + i * 0.025) * hScale;
      float d = abs(y - center) / bandWidth;
      smoke.b += intensity * exp(-d * d);
    }
  }

  smoke = clamp(smoke, 0.0, 1.0);
  gl_FragColor = vec4(smoke, 1.0);
}
