# Smoke Flow

Real-time GPU simulation of the laminar-to-turbulent flow transition, inspired by wind-tunnel smoke visualization.

**[Live demo](https://raggedr.github.io/smoke-flow/)** — scroll right to explore the transition from order to chaos.

## What It Does

A Gaussian jet enters from the left as smooth, parallel colored smoke streams. Kelvin-Helmholtz instabilities develop in the shear layers, rolling up into vortices that pair, merge, and cascade into turbulent mixing. Scroll horizontally to explore the entire journey from order to chaos.

## Physics

- **Navier-Stokes equations** solved on a 2048×256 GPU grid using Chorin's projection method
- **Semi-Lagrangian advection** for unconditional stability
- **Jacobi pressure solver** (40 iterations, warm-started from previous frame)
- **Reynolds number ~115,000** — well into the instability regime
- **Passive smoke advection** in 3 channels (yellow-green / cyan / blue-purple) that blend naturally as turbulence mixes the flow

## How It Looks

| Region | What You See |
|--------|-------------|
| Far left | Clean, parallel colored bands (laminar) |
| Left-center | Bands wobble — perturbations seed the instability |
| Center | KH billows roll up — shear layers curl into vortices |
| Right-center | Vortex pairing — small vortices merge into larger ones |
| Far right | Chaotic mixing — colors blend as vortices interact |

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5174 and scroll right to explore the flow.

## Controls

| Key | Action |
|-----|--------|
| Up/Down arrows | Adjust viscosity (move transition point) |
| Left/Right arrows | Adjust flow speed |
| 1 | Wind-tunnel color scheme (default) |
| 2 | Infrared thermal ramp |
| 3 | Monochrome (white smoke on black) |
| Space | Pause / resume |
| R | Reset simulation |

## Tech Stack

- **Three.js** — WebGL render targets and orthographic rendering
- **GLSL** — 7 fragment shaders implementing the fluid solver
- **Vite** — Build tool with GLSL import plugin

## Architecture

Six shader passes per simulation step:

1. **Advect** — Semi-Lagrangian velocity self-advection + viscous diffusion + boundary conditions
2. **Divergence** — Compute ∇·v
3. **Pressure** — Jacobi iteration solving ∇²p = ∇·v
4. **Project** — Subtract pressure gradient to enforce incompressibility
5. **Smoke** — Advect passive smoke density + inject at inlet
6. **Display** — Map RGB smoke channels to color + vorticity glow

## Related Projects

- [reaction-diffusion-playground](https://github.com/RaggedR/reaction-diffusion-playground) — Gray-Scott reaction-diffusion on GPU
- [screen-saver](https://github.com/RaggedR/screen-saver) — Audio-reactive Kelvin-Helmholtz vortices (vorticity-streamfunction formulation)

## License

MIT
