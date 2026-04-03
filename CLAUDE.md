# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Real-time GPU simulation of smoke flowing through a wind tunnel, showing the spatial transition from laminar to turbulent flow. A Gaussian jet enters from the left; Kelvin-Helmholtz instabilities develop in the shear layers; vortex pairing cascades into turbulent mixing on the right.

## Architecture

```
Inlet (jet profile + perturbation)
  ↓
┌─────────────────────────────────────────────────┐
│ Chorin's Projection Method (per simulation step) │
│                                                   │
│ 1. advect.frag  — Semi-Lagrangian velocity self-  │
│                   advection + viscous diffusion    │
│                   + inlet/outlet/wall BCs          │
│ 2. divergence.frag — ∇·v (central differences)    │
│ 3. pressure.frag — Jacobi iteration: ∇²p = ∇·v   │
│                    (40 iterations, warm-started)   │
│ 4. project.frag — v = v - ∇p, re-apply BCs        │
│ 5. smoke.frag   — Passive scalar advection (RGB)  │
│                   + inlet injection                │
│ 6. display.frag — Color mapping + vorticity glow   │
└─────────────────────────────────────────────────┘
  ↓
Screen (horizontal scroll to explore laminar→turbulent)
```

## Key Design Decision: Velocity-Pressure (not Vorticity-Streamfunction)

The sibling project (`~/screen-saver/`) uses vorticity-streamfunction with periodic boundaries. This project uses velocity-pressure (Chorin's projection) because we need non-periodic boundaries: inlet (prescribed jet), outlet (zero-gradient), and walls (free-slip). You cannot prescribe a velocity profile at an inlet in the vorticity-streamfunction formulation without contorted workarounds.

## Key Files

- `src/uniforms.js` — All simulation constants and physics parameters
- `src/renderer.js` — Three.js setup, 7 render targets (vel/pres/div/smoke), ping-pong, step()
- `src/materials.js` — `makeMat()` helper + 7 ShaderMaterial exports
- `src/main.js` — Entry point, animation loop, keyboard controls, HUD
- `src/shaders/init.frag.glsl` — Gaussian jet initial condition (divergence-free)
- `src/shaders/advect.frag.glsl` — Semi-Lagrangian advection + viscous diffusion + BCs
- `src/shaders/divergence.frag.glsl` — Velocity divergence
- `src/shaders/pressure.frag.glsl` — Jacobi Poisson solver
- `src/shaders/project.frag.glsl` — Pressure gradient subtraction + BCs
- `src/shaders/smoke.frag.glsl` — 3-channel smoke advection + inlet injection
- `src/shaders/display.frag.glsl` — Color schemes + vorticity glow

## Commands

```bash
npm run dev      # Start dev server (Vite, port 5174)
npm run build    # Production build
npm run preview  # Preview production build
```

## Critical Constraints

### Pressure Solver
- **Warm-start from previous frame's pressure** — clearing pressure each frame kills convergence on large grids (Jacobi spectral radius ≈ cos(π/N) ≈ 1 for large N)
- **Initialize velocity with jet profile everywhere** — don't grow the jet from the inlet; start with the divergence-free base flow so the Jacobi solver only corrects small perturbations
- **p=0 at all boundaries** (homogeneous Dirichlet) — simple and converges well; the inlet BC override in the advect/project shaders prevents pressure from corrupting the jet

### Velocity Units
- Velocity stored in **texels per timestep-unit**
- Backtrace: `vUv - dt * vel * (1/resolution)` converts to UV offset
- Laplacian uses dx=1 texel (isotropic stencil)
- CFL for viscous diffusion: `dt * nu < 0.5` (currently 0.5 × 0.0008 = 0.0004, safe)

### Boundary Conditions
| Edge | Velocity | Pressure | Smoke |
|------|----------|----------|-------|
| Left (inlet) | Gaussian jet + sinusoidal/noise perturbation | p=0 | Inject thin colored bands |
| Right (outlet) | Zero-gradient (copy from interior) | p=0 | Free exit |
| Top/Bottom | Free-slip: v=0, du/dy=0 | Neumann (via ClampToEdge) | Zero-gradient |

### Render Targets
- All use `ClampToEdgeWrapping` (NOT RepeatWrapping — non-periodic domain)
- Velocity: `LinearFilter` (bilinear for Semi-Lagrangian backtrace)
- Pressure/divergence: `NearestFilter`
- Smoke: `LinearFilter`

## Parameters & Tuning

| Parameter | Default | Effect |
|-----------|---------|--------|
| `nu` | 0.0008 | Viscosity. Lower → higher Re → earlier turbulence |
| `uJet` | 2.0 | Jet speed (texels/timestep). Higher → faster flow |
| `jetWidth` | 0.18 | Gaussian width. Narrower → thinner shear layers → finer vortices |
| `pertAmp` | 0.18 | Perturbation strength. Higher → faster instability onset |
| `pertFreq` | 3.0 | Seeds N KH billows across jet height |
| `smokeDecay` | 0.9995 | Per-step decay. Lower → smoke fades before reaching right edge |

Re = uJet × jetWidth × SIM_H / nu. Current: 2.0 × 0.18 × 256 / 0.0008 ≈ 115,200.

## Controls

- **Up/Down arrows**: Adjust viscosity (Re)
- **Left/Right arrows**: Adjust flow speed
- **1/2/3**: Wind-tunnel / infrared / monochrome color schemes
- **Space**: Pause
- **R**: Reset simulation
