import * as THREE from 'three';

import vertShader from './shaders/passthrough.vert.glsl';
import initFrag from './shaders/init.frag.glsl';
import advectFrag from './shaders/advect.frag.glsl';
import divergenceFrag from './shaders/divergence.frag.glsl';
import pressureFrag from './shaders/pressure.frag.glsl';
import projectFrag from './shaders/project.frag.glsl';
import confinementFrag from './shaders/confinement.frag.glsl';
import smokeFrag from './shaders/smoke.frag.glsl';
import displayFrag from './shaders/display.frag.glsl';

import {
  initUniforms, advectUniforms, confinementUniforms, divergenceUniforms,
  pressureUniforms, projectUniforms, smokeUniforms, displayUniforms
} from './uniforms.js';

function makeMat(uniforms, fragmentShader) {
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertShader,
    fragmentShader
  });
  mat.blending = THREE.NoBlending;
  return mat;
}

export const initMaterial = makeMat(initUniforms, initFrag);
export const advectMaterial = makeMat(advectUniforms, advectFrag);
export const confinementMaterial = makeMat(confinementUniforms, confinementFrag);
export const divergenceMaterial = makeMat(divergenceUniforms, divergenceFrag);
export const pressureMaterial = makeMat(pressureUniforms, pressureFrag);
export const projectMaterial = makeMat(projectUniforms, projectFrag);
export const smokeMaterial = makeMat(smokeUniforms, smokeFrag);
export const displayMaterial = makeMat(displayUniforms, displayFrag);
