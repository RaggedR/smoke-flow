/**
 * Display shader: maps RGB smoke channels to visual color.
 * Three color schemes: wind-tunnel, infrared, monochrome.
 * Adds vorticity-based glow in turbulent regions.
 */
precision highp float;

uniform sampler2D tSmoke;
uniform sampler2D tVelocity;
uniform vec2 resolution;
uniform int colorScheme;
uniform float glowStrength;

varying vec2 vUv;

// Compute vorticity: omega = dv/dx - du/dy
float getVorticity() {
  vec2 tx = 1.0 / resolution;
  float uN = texture2D(tVelocity, vUv + vec2(0.0, tx.y)).r;
  float uS = texture2D(tVelocity, vUv - vec2(0.0, tx.y)).r;
  float vE = texture2D(tVelocity, vUv + vec2(tx.x, 0.0)).g;
  float vW = texture2D(tVelocity, vUv - vec2(tx.x, 0.0)).g;
  return (vE - vW) * 0.5 / tx.x - (uN - uS) * 0.5 / tx.y;
}

void main() {
  vec3 smoke = texture2D(tSmoke, vUv).rgb;
  vec3 color;

  if (colorScheme == 0) {
    // WIND TUNNEL — multi-colored smoke streams
    vec3 rColor = vec3(0.75, 0.92, 0.22);   // yellow-green
    vec3 gColor = vec3(0.15, 0.82, 0.72);   // cyan-green
    vec3 bColor = vec3(0.42, 0.22, 0.92);   // blue-purple
    color = smoke.r * rColor + smoke.g * gColor + smoke.b * bColor;

    // Vorticity glow — warm tones in turbulent regions
    float vort = abs(getVorticity());
    float glow = glowStrength * smoothstep(0.0, 80.0, vort);
    color += glow * vec3(0.35, 0.18, 0.06);

  } else if (colorScheme == 1) {
    // INFRARED — total density to thermal ramp
    float density = (smoke.r + smoke.g + smoke.b) / 3.0;
    color.r = smoothstep(0.0, 0.35, density);
    color.g = smoothstep(0.2, 0.65, density);
    color.b = smoothstep(0.45, 0.85, density);

    // Vorticity glow — white-hot
    float vort = abs(getVorticity());
    float glow = glowStrength * smoothstep(0.0, 80.0, vort);
    color += glow * vec3(0.4, 0.35, 0.25);

  } else if (colorScheme == 2) {
    // MONOCHROME — white smoke on black
    float density = (smoke.r + smoke.g + smoke.b) / 3.0;
    color = vec3(density);

  } else {
    // DEBUG — show velocity magnitude as heatmap
    vec2 vel = texture2D(tVelocity, vUv).rg;
    float speed = length(vel);
    color = vec3(speed / 2.5, speed / 5.0, 0.0);  // red-yellow ramp, scaled to uJet=2
  }

  // Gamma correction for better dark-end contrast
  color = pow(color, vec3(0.85));

  gl_FragColor = vec4(color, 1.0);
}
