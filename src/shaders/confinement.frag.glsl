/**
 * Vorticity confinement — gentle sub-vortex enhancement in turbulent region.
 */
precision highp float;

uniform sampler2D tVelocity;
uniform vec2 resolution;
uniform float dt;
uniform float confinementStrength;

varying vec2 vUv;

float vort(vec2 pos) {
    vec2 tx = 1.0 / resolution;
    float vE = texture2D(tVelocity, pos + vec2(tx.x, 0.0)).g;
    float vW = texture2D(tVelocity, pos - vec2(tx.x, 0.0)).g;
    float uN = texture2D(tVelocity, pos + vec2(0.0, tx.y)).r;
    float uS = texture2D(tVelocity, pos - vec2(0.0, tx.y)).r;
    return (vE - vW) * 0.5 - (uN - uS) * 0.5;
}

void main() {
    vec2 tx = 1.0 / resolution;

    float wC = vort(vUv);
    float wE = vort(vUv + vec2(tx.x, 0.0));
    float wW = vort(vUv - vec2(tx.x, 0.0));
    float wN = vort(vUv + vec2(0.0, tx.y));
    float wS = vort(vUv - vec2(0.0, tx.y));

    vec2 eta = vec2(abs(wE) - abs(wW), abs(wN) - abs(wS)) * 0.5;
    float etaLen = length(eta);
    if (etaLen < 1e-5) {
        gl_FragColor = vec4(texture2D(tVelocity, vUv).rg, 0.0, 1.0);
        return;
    }
    eta /= etaLen;

    // Gentle ramp: zero in laminar, builds through turbulent, tapers at outlet
    float ramp = smoothstep(0.35, 0.65, vUv.x) * (1.0 - smoothstep(0.85, 0.95, vUv.x));

    vec2 force = confinementStrength * ramp * vec2(eta.y, -eta.x) * wC;

    vec2 vel = texture2D(tVelocity, vUv).rg;
    vel += dt * force;

    gl_FragColor = vec4(vel, 0.0, 1.0);
}
